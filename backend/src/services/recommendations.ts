import { GitHubService } from './github.js'
import type { UserSkills, ProjectRecommendation, GitHubRepo, GitHubIssue, SearchFilters } from '../types/index.js'

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

      // Search for repositories
      const repositories = await this.searchRepositories(skills, searchFilters)

      // Score and rank repositories
      const recommendations = await this.scoreRepositories(repositories, skills)

      console.log(`✅ Generated ${recommendations.length} recommendations in ${Date.now() - startTime}ms`)
      return recommendations

    } catch (error) {
      console.error('❌ Error generating recommendations:', error)
      throw new Error('Failed to generate recommendations')
    }
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
