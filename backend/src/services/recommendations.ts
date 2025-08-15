import { GitHubService } from './github.js'
import type { UserSkills, ProjectRecommendation, GitHubRepo, GitHubIssue, SearchFilters } from '../types/index.js'
import { getUserAccessToken } from '../routes/auth.js'
import type { JWTPayload } from '../types/index.js'

export class RecommendationService {
  static async getRecommendations(
    skills: UserSkills,
    filters: Partial<SearchFilters> = {}
  ): Promise<ProjectRecommendation[]> {
    const startTime = Date.now()
    console.log('🔍 Starting recommendation process for skills:', skills)

    try {
      // Build search filters based on user skills
      const searchFilters = this.buildSearchFilters(skills, filters)

      // Search for repositories (candidate pool)
      let repositories = await this.searchRepositories(skills, searchFilters)

      // Score and rank repositories
      const recommendations = await this.scoreRepositories(repositories, skills)

      console.log(`✅ Generated ${recommendations.length} recommendations in ${Date.now() - startTime}ms`)
      return recommendations

    } catch (error) {
      console.error('❌ Error generating recommendations:', error)
      throw new Error('Failed to generate recommendations')
    }
  }

  static async getPersonalizedRecommendations(
    user: JWTPayload,
    skills: UserSkills,
    filters: Partial<SearchFilters> = {}
  ): Promise<ProjectRecommendation[]> {
    const startTime = Date.now()

    // base pool
    const searchFilters = this.buildSearchFilters(skills, filters)
    let repositories = await this.searchRepositories(skills, searchFilters)

    // personalization inputs
    const accessToken = getUserAccessToken(user.userId)
    if (accessToken) {
      // 1) starred repos boost and seed similar
      const starred = await GitHubService.getUserStarredRepos({ accessToken })

      // 2) following users' top repos (by stars)
      const following = await GitHubService.getUserFollowing(accessToken)

      // 3) exclude already contributed repos: approximate using recent events (optional) or by starred contributions placeholder
      // Simple exclusion: if repo owner is user or user has starred AND contributed (not available easily), we skip later via name match

      // Merge additional candidates from starred owners/topics
      const starTopics = new Set<string>()
      const starLanguages = new Set<string>()
      const starOwners = new Set<string>()
      for (const r of starred.slice(0, 100)) {
        r.topics?.forEach(t => starTopics.add(t.toLowerCase()))
        if (r.language) starLanguages.add(r.language.toLowerCase())
        starOwners.add(r.owner?.login?.toLowerCase())
      }

      // Expand search using topics from stars
      const topicFilters: SearchFilters[] = Array.from(starTopics).slice(0, 5).map(t => ({
        topics: [t],
        minStars: this.getMinStarsForLevel(skills.experienceLevel)
      }))
      for (const f of topicFilters) {
        try {
          const repos = await GitHubService.searchRepositories(f)
          repositories.push(...repos)
        } catch {
          // Ignore errors and continue
        }
      }

      // Expand search using languages from stars (if not in skills)
      const extraLangs = Array.from(starLanguages).filter(l => !skills.languages.includes(l))
      for (const lang of extraLangs.slice(0, 3)) {
        try {
          const repos = await GitHubService.searchRepositories({ language: lang, minStars: 20 })
          repositories.push(...repos)
        } catch {
          // Ignore errors and continue
        }
      }

      // Collaborative filtering (user-based): take top starred owners and fetch their popular repos
      for (const owner of Array.from(starOwners).slice(0, 5)) {
        try {
      const repos = await GitHubService.searchRepositories({ minStars: 50 })
          // Can't query by owner via search filters structure; fallback to filtering
          repositories.push(...repos.filter(r => r.owner?.login?.toLowerCase() === owner))
        } catch {
          // Ignore errors and continue
        }
      }

      // Following users' starred repos union (public path, no token for other user stars via API; we skip to their popular owned repos)
      for (const u of following.slice(0, 10)) {
        try {
          // Search popular repos owned by followed user
          const repos = await GitHubService.searchRepositories({ minStars: 20 })
          repositories.push(...repos.filter(r => r.owner?.login?.toLowerCase() === u.login.toLowerCase()))
        } catch {
          // Ignore errors and continue
        }
      }
    }

    // Dedup
    const unique = repositories.filter((repo, index, self) => index === self.findIndex(r => r.id === repo.id))

    // Exclude likely already contributed repos
    let contributedSet: Set<string> | undefined
    try {
      contributedSet = await GitHubService.getUserRecentContributedRepos(user.login, accessToken)
    } catch {
      // Ignore errors and continue
    }
    const cleaned = unique.filter(r => {
      if (r.owner?.login?.toLowerCase() === user.login.toLowerCase()) return false
      if (contributedSet && contributedSet.has(r.full_name.toLowerCase())) return false
      return true
    })

    // score and rank
    const recs = await this.scoreRepositories(cleaned, skills)
    console.log(`✅ Generated ${recs.length} personalized recommendations in ${Date.now() - startTime}ms`)
    return recs
  }

  private static buildSearchFilters(skills: UserSkills, userFilters: Partial<SearchFilters>): SearchFilters[] {
    const filters: SearchFilters[] = []

    // Create filters for each programming language
    skills.languages.forEach(language => {
      filters.push({
        language: language.toLowerCase(),
        hasGoodFirstIssues: skills.experienceLevel === 'beginner',
        minStars: this.getMinStarsForLevel(skills.experienceLevel),
        maxStars: this.getMaxStarsForLevel(skills.experienceLevel),
        topics: skills.interests,
        ...userFilters
      })
    })

    // If no languages specified, use interests as topics
    if (skills.languages.length === 0 && skills.interests.length > 0) {
      filters.push({
        hasGoodFirstIssues: skills.experienceLevel === 'beginner',
        minStars: this.getMinStarsForLevel(skills.experienceLevel),
        maxStars: this.getMaxStarsForLevel(skills.experienceLevel),
        topics: skills.interests,
        ...userFilters
      })
    }

    return filters.length > 0 ? filters : [{
      hasGoodFirstIssues: true,
      minStars: 10,
      maxStars: 1000,
      ...userFilters
    }]
  }

  private static async searchRepositories(
    skills: UserSkills,
    searchFilters: SearchFilters[]
  ): Promise<GitHubRepo[]> {
    const allRepos: GitHubRepo[] = []

    for (const filter of searchFilters) {
      try {
        const repos = await GitHubService.searchRepositories(filter)
        allRepos.push(...repos)
      } catch (error) {
        console.error('Error searching with filter:', filter, error)
      }
    }

    // Remove duplicates
    const uniqueRepos = allRepos.filter((repo, index, self) =>
      index === self.findIndex(r => r.id === repo.id)
    )

    console.log(`📦 Found ${uniqueRepos.length} unique repositories`)
    return uniqueRepos
  }

  private static async scoreRepositories(
    repositories: GitHubRepo[],
    skills: UserSkills
  ): Promise<ProjectRecommendation[]> {
    const recommendations: ProjectRecommendation[] = []

    for (const repo of repositories.slice(0, 20)) { // Limit to 20 for performance
      try {
        const score = this.calculateMatchScore(repo, skills)
        const reasons = this.generateReasons(repo, skills)

        // Get suggested issues
        const suggestedIssues = await this.getSuggestedIssues(repo, skills)

        recommendations.push({
          repo,
          matchScore: score,
          reasons,
          suggestedIssues
        })
      } catch (error) {
        console.error(`Error processing repository ${repo.full_name}:`, error)
      }
    }

    return recommendations.sort((a, b) => b.matchScore - a.matchScore)
  }

  private static calculateMatchScore(repo: GitHubRepo, skills: UserSkills): number {
    let score = 0

    // Language match (40% of score)
    if (repo.language && skills.languages.includes(repo.language.toLowerCase())) {
      score += 40
    }

    // Topic/Interest match (30% of score)
    const matchingTopics = repo.topics.filter(topic =>
      skills.interests.some(interest =>
        topic.toLowerCase().includes(interest.toLowerCase()) ||
        interest.toLowerCase().includes(topic.toLowerCase())
      )
    )
    score += Math.min(30, matchingTopics.length * 10)

    // Framework match (20% of score)
    const repoText = `${repo.name} ${repo.description || ''} ${repo.topics.join(' ')}`.toLowerCase()
    const matchingFrameworks = skills.frameworks.filter(framework =>
      repoText.includes(framework.toLowerCase())
    )
    score += Math.min(20, matchingFrameworks.length * 7)

    // Repository quality indicators (10% of score)
    if (repo.stargazers_count > 100) score += 2
    if (repo.stargazers_count > 1000) score += 3
    if (repo.open_issues_count > 0) score += 2
    if (repo.description && repo.description.length > 50) score += 1
    if (repo.topics.length > 3) score += 2

    return Math.min(100, score)
  }

  private static generateReasons(repo: GitHubRepo, skills: UserSkills): string[] {
    const reasons: string[] = []

    if (repo.language && skills.languages.includes(repo.language.toLowerCase())) {
      reasons.push(`Matches your ${repo.language} skills`)
    }

    const matchingTopics = repo.topics.filter(topic =>
      skills.interests.some(interest =>
        topic.toLowerCase().includes(interest.toLowerCase())
      )
    )
    if (matchingTopics.length > 0) {
      reasons.push(`Aligns with your interests: ${matchingTopics.slice(0, 3).join(', ')}`)
    }

    if (repo.stargazers_count > 1000) {
      reasons.push(`Popular project (${repo.stargazers_count.toLocaleString()} stars)`)
    }

    if (repo.open_issues_count > 0) {
      reasons.push(`Active development (${repo.open_issues_count} open issues)`)
    }

    return reasons
  }

  private static async getSuggestedIssues(repo: GitHubRepo, skills: UserSkills): Promise<GitHubIssue[]> {
    try {
      const [owner, repoName] = repo.full_name.split('/')

      if (!owner || !repoName) {
        console.error(`Invalid repository name format: ${repo.full_name}`)
        return []
      }

      if (skills.experienceLevel === 'beginner') {
        // Try to get good first issues
        const goodFirstIssues = await GitHubService.getGoodFirstIssues(owner, repoName)
        if (goodFirstIssues.length > 0) {
          return goodFirstIssues.slice(0, 3)
        }
      }

      // Get general issues
      const issues = await GitHubService.getRepositoryIssues(owner, repoName)
      return issues.slice(0, 3)

    } catch (error) {
      console.error(`Error fetching issues for ${repo.full_name}:`, error)
      return []
    }
  }

  private static getMinStarsForLevel(level: string): number {
    switch (level) {
      case 'beginner': return 10
      case 'intermediate': return 50
      case 'advanced': return 100
      default: return 10
    }
  }

  private static getMaxStarsForLevel(level: string): number {
    switch (level) {
      case 'beginner': return 5000
      case 'intermediate': return 20000
      case 'advanced': return undefined as any
      default: return 5000
    }
  }
}
