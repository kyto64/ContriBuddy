import type { ContributionHistory, ContributionStats, PullRequest, Issue, Commit } from '../types/index.js'

interface GitHubSearchResponse<T> {
  total_count: number
  incomplete_results: boolean
  items: T[]
}

interface GitHubPR {
  id: number
  number: number
  title: string
  body: string | null
  state: 'open' | 'closed'
  html_url: string
  created_at: string
  updated_at: string
  closed_at: string | null
  merged_at: string | null
  user: {
    login: string
    avatar_url: string
  }
  base?: {
    repo?: {
      name: string
      full_name: string
      language: string | null
      stargazers_count: number
    }
  }
  additions?: number
  deletions?: number
  changed_files?: number
}

interface GitHubIssue {
  id: number
  number: number
  title: string
  body: string | null
  state: 'open' | 'closed'
  html_url: string
  created_at: string
  updated_at: string
  closed_at: string | null
  user: {
    login: string
    avatar_url: string
  }
  repository?: {
    name: string
    full_name: string
    language: string | null
    stargazers_count: number
  }
  labels?: Array<{
    name: string
    color: string
  }>
}

interface GitHubCommit {
  sha: string
  commit?: {
    message: string
    author?: {
      name: string
      email: string
      date: string
    }
  }
  html_url: string
  repository?: {
    name: string
    full_name: string
    language: string | null
    stargazers_count: number
  }
  stats?: {
    additions: number
    deletions: number
    total: number
  }
}

export class ContributionAnalysisService {
  private static readonly GITHUB_API_BASE = 'https://api.github.com'

  /**
   * Analyze user's complete contribution history
   */
  static async analyzeContributionHistory(accessToken: string, username: string): Promise<ContributionHistory> {
    try {
      console.log(`🔍 Starting contribution analysis for user: ${username}`)

      // Get all contribution data in parallel
      const [pullRequests, issues, commits] = await Promise.all([
        this.getUserPullRequests(accessToken, username),
        this.getUserIssues(accessToken, username),
        this.getUserCommits(accessToken, username)
      ])

      // Calculate comprehensive statistics
      const stats = this.calculateContributionStats(pullRequests, issues, commits)

      const result: ContributionHistory = {
        username,
        analyzedAt: new Date().toISOString(),
        pullRequests,
        issues,
        commits: commits.slice(0, 100), // Limit commits for performance
        stats,
        summary: {
          totalContributions: pullRequests.length + issues.length + commits.length,
          totalPullRequests: pullRequests.length,
          totalIssues: issues.length,
          totalCommits: commits.length,
          mergedPullRequests: pullRequests.filter(pr => pr.mergedAt).length,
          closedIssues: issues.filter(issue => issue.state === 'closed').length,
          recentActivity: this.getRecentActivitySummary(pullRequests, issues, commits)
        }
      }

      console.log(`✅ Contribution analysis complete. Total contributions: ${result.summary.totalContributions}`)
      return result

    } catch (error) {
      console.error('Contribution analysis error:', error)
      throw new Error('Failed to analyze contribution history')
    }
  }

  /**
   * Get user's pull requests across all repositories
   */
  private static async getUserPullRequests(accessToken: string, username: string): Promise<PullRequest[]> {
    const pullRequests: PullRequest[] = []
    let page = 1
    const perPage = 100

    try {
      while (page <= 5) { // Limit to first 5 pages (500 PRs) for performance
        const query = `author:${username} type:pr`
        const response = await fetch(
          `${this.GITHUB_API_BASE}/search/issues?q=${encodeURIComponent(query)}&page=${page}&per_page=${perPage}&sort=created&order=desc`,
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Accept': 'application/vnd.github+json',
              'User-Agent': 'ContriBuddy-App',
              'X-GitHub-Api-Version': '2022-11-28'
            }
          }
        )

        if (!response.ok) {
          console.warn(`Failed to fetch PRs page ${page}: ${response.statusText}`)
          break
        }

        const data: GitHubSearchResponse<GitHubPR> = await response.json()

        if (data.items.length === 0) break

        for (const pr of data.items) {
          // Skip PRs without proper repository information
          if (!pr.base || !pr.base.repo) {
            console.warn(`Skipping PR ${pr.number} - missing repository information`)
            continue
          }

          // Get detailed PR information
          const detailedPR = await this.getPullRequestDetails(accessToken, pr.base.repo.full_name, pr.number)

          pullRequests.push({
            id: pr.id,
            number: pr.number,
            title: pr.title,
            body: pr.body,
            state: pr.state,
            htmlUrl: pr.html_url,
            createdAt: pr.created_at,
            updatedAt: pr.updated_at,
            closedAt: pr.closed_at,
            mergedAt: pr.merged_at,
            repository: {
              name: pr.base?.repo?.name || 'Unknown',
              fullName: pr.base?.repo?.full_name || 'unknown/unknown',
              language: pr.base?.repo?.language || null,
              stars: pr.base?.repo?.stargazers_count || 0
            },
            additions: detailedPR?.additions || 0,
            deletions: detailedPR?.deletions || 0,
            changedFiles: detailedPR?.changed_files || 0,
            labels: [] // GitHub search API doesn't include labels for PRs
          })
        }

        page++

        // Respect rate limits
        await this.delay(100)
      }

      console.log(`📊 Found ${pullRequests.length} pull requests`)
      return pullRequests

    } catch (error) {
      console.error('Error fetching pull requests:', error)
      return pullRequests // Return partial results
    }
  }

  /**
   * Get detailed pull request information
   */
  private static async getPullRequestDetails(accessToken: string, repoFullName: string, prNumber: number): Promise<GitHubPR | null> {
    try {
      const response = await fetch(
        `${this.GITHUB_API_BASE}/repos/${repoFullName}/pulls/${prNumber}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Accept': 'application/vnd.github+json',
            'User-Agent': 'ContriBuddy-App',
            'X-GitHub-Api-Version': '2022-11-28'
          }
        }
      )

      if (!response.ok) return null

      return response.json()
    } catch (error) {
      return null
    }
  }

  /**
   * Get user's issues across all repositories
   */
  private static async getUserIssues(accessToken: string, username: string): Promise<Issue[]> {
    const issues: Issue[] = []
    let page = 1
    const perPage = 100

    try {
      while (page <= 3) { // Limit to first 3 pages (300 issues) for performance
        const query = `author:${username} type:issue`
        const response = await fetch(
          `${this.GITHUB_API_BASE}/search/issues?q=${encodeURIComponent(query)}&page=${page}&per_page=${perPage}&sort=created&order=desc`,
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Accept': 'application/vnd.github+json',
              'User-Agent': 'ContriBuddy-App',
              'X-GitHub-Api-Version': '2022-11-28'
            }
          }
        )

        if (!response.ok) {
          console.warn(`Failed to fetch issues page ${page}: ${response.statusText}`)
          break
        }

        const data: GitHubSearchResponse<GitHubIssue> = await response.json()

        if (data.items.length === 0) break

        for (const issue of data.items) {
          // Skip issues without proper repository information
          if (!issue.repository) {
            console.warn(`Skipping issue ${issue.number} - missing repository information`)
            continue
          }

          issues.push({
            id: issue.id,
            number: issue.number,
            title: issue.title,
            body: issue.body,
            state: issue.state,
            htmlUrl: issue.html_url,
            createdAt: issue.created_at,
            updatedAt: issue.updated_at,
            closedAt: issue.closed_at,
            repository: {
              name: issue.repository?.name || 'Unknown',
              fullName: issue.repository?.full_name || 'unknown/unknown',
              language: issue.repository?.language || null,
              stars: issue.repository?.stargazers_count || 0
            },
            labels: issue.labels?.map(label => ({
              name: label.name,
              color: label.color
            })) || []
          })
        }

        page++

        // Respect rate limits
        await this.delay(100)
      }

      console.log(`📊 Found ${issues.length} issues`)
      return issues

    } catch (error) {
      console.error('Error fetching issues:', error)
      return issues // Return partial results
    }
  }

  /**
   * Get user's recent commits across repositories
   */
  private static async getUserCommits(accessToken: string, username: string): Promise<Commit[]> {
    const commits: Commit[] = []

    try {
      // Get user's repositories first
      const reposResponse = await fetch(
        `${this.GITHUB_API_BASE}/users/${username}/repos?type=all&sort=updated&per_page=50`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Accept': 'application/vnd.github+json',
            'User-Agent': 'ContriBuddy-App',
            'X-GitHub-Api-Version': '2022-11-28'
          }
        }
      )

      if (!reposResponse.ok) {
        throw new Error('Failed to fetch user repositories')
      }

      const repositories = await reposResponse.json()

      // Get recent commits from each repository (limit for performance)
      for (const repo of repositories.slice(0, 20)) { // Limit to 20 most recent repos
        try {
          const commitsResponse = await fetch(
            `${this.GITHUB_API_BASE}/repos/${repo.full_name}/commits?author=${username}&per_page=20`,
            {
              headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Accept': 'application/vnd.github+json',
                'User-Agent': 'ContriBuddy-App',
                'X-GitHub-Api-Version': '2022-11-28'
              }
            }
          )

          if (commitsResponse.ok) {
            const repoCommits: GitHubCommit[] = await commitsResponse.json()

            for (const commit of repoCommits) {
              // Skip commits without proper structure
              if (!commit.commit || !commit.commit.author) {
                console.warn(`Skipping commit ${commit.sha} - missing author information`)
                continue
              }

              commits.push({
                sha: commit.sha,
                message: commit.commit?.message || 'No message',
                htmlUrl: commit.html_url,
                createdAt: commit.commit?.author?.date || new Date().toISOString(),
                author: {
                  name: commit.commit?.author?.name || 'Unknown',
                  email: commit.commit?.author?.email || 'unknown@example.com'
                },
                repository: {
                  name: repo.name,
                  fullName: repo.full_name,
                  language: repo.language,
                  stars: repo.stargazers_count
                },
                stats: commit.stats || { additions: 0, deletions: 0, total: 0 }
              })
            }
          }

          // Respect rate limits
          await this.delay(50)

        } catch (error) {
          console.warn(`Failed to fetch commits for ${repo.full_name}:`, error)
        }
      }

      // Sort commits by date (most recent first)
      commits.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

      console.log(`📊 Found ${commits.length} commits`)
      return commits

    } catch (error) {
      console.error('Error fetching commits:', error)
      return commits // Return partial results
    }
  }

  /**
   * Calculate comprehensive contribution statistics
   */
  private static calculateContributionStats(
    pullRequests: PullRequest[],
    issues: Issue[],
    commits: Commit[]
  ): ContributionStats {
    // Language statistics
    const languageStats = new Map<string, number>()
    const repositoryStats = new Map<string, number>()

    // Process PRs
    pullRequests.forEach(pr => {
      if (pr.repository.language) {
        languageStats.set(pr.repository.language, (languageStats.get(pr.repository.language) || 0) + 1)
      }
      repositoryStats.set(pr.repository.fullName, (repositoryStats.get(pr.repository.fullName) || 0) + 1)
    })

    // Process Issues
    issues.forEach(issue => {
      if (issue.repository.language) {
        languageStats.set(issue.repository.language, (languageStats.get(issue.repository.language) || 0) + 1)
      }
      repositoryStats.set(issue.repository.fullName, (repositoryStats.get(issue.repository.fullName) || 0) + 1)
    })

    // Process Commits
    commits.forEach(commit => {
      if (commit.repository.language) {
        languageStats.set(commit.repository.language, (languageStats.get(commit.repository.language) || 0) + 1)
      }
      repositoryStats.set(commit.repository.fullName, (repositoryStats.get(commit.repository.fullName) || 0) + 1)
    })

    // Monthly activity
    const monthlyActivity = this.calculateMonthlyActivity(pullRequests, issues, commits)

    // Top languages and repositories
    const topLanguages = Array.from(languageStats.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([language, count]) => ({ language, count }))

    const topRepositories = Array.from(repositoryStats.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([repository, count]) => ({ repository, count }))

    // Code statistics
    const totalAdditions = pullRequests.reduce((sum, pr) => sum + pr.additions, 0) +
                          commits.reduce((sum, commit) => sum + commit.stats.additions, 0)
    const totalDeletions = pullRequests.reduce((sum, pr) => sum + pr.deletions, 0) +
                          commits.reduce((sum, commit) => sum + commit.stats.deletions, 0)

    return {
      topLanguages,
      topRepositories,
      monthlyActivity,
      totalAdditions,
      totalDeletions,
      averagePRSize: pullRequests.length > 0 ?
        pullRequests.reduce((sum, pr) => sum + pr.additions + pr.deletions, 0) / pullRequests.length : 0,
      contributionStreak: this.calculateContributionStreak(pullRequests, issues, commits),
      firstContribution: this.getFirstContributionDate(pullRequests, issues, commits),
      mostActiveRepository: topRepositories[0]?.repository || null
    }
  }

  /**
   * Calculate monthly activity for the past 12 months
   */
  private static calculateMonthlyActivity(
    pullRequests: PullRequest[],
    issues: Issue[],
    commits: Commit[]
  ): Array<{ month: string; pullRequests: number; issues: number; commits: number; total: number }> {
    const monthlyData = new Map<string, { pullRequests: number; issues: number; commits: number }>()

    // Initialize last 12 months
    for (let i = 11; i >= 0; i--) {
      const date = new Date()
      date.setMonth(date.getMonth() - i)
      const monthKey = date.toISOString().substring(0, 7) // YYYY-MM format
      monthlyData.set(monthKey, { pullRequests: 0, issues: 0, commits: 0 })
    }

    // Count contributions by month
    const cutoffDate = new Date()
    cutoffDate.setFullYear(cutoffDate.getFullYear() - 1)

    pullRequests.forEach(pr => {
      const date = new Date(pr.createdAt)
      if (date >= cutoffDate) {
        const monthKey = date.toISOString().substring(0, 7)
        const data = monthlyData.get(monthKey)
        if (data) {
          data.pullRequests++
        }
      }
    })

    issues.forEach(issue => {
      const date = new Date(issue.createdAt)
      if (date >= cutoffDate) {
        const monthKey = date.toISOString().substring(0, 7)
        const data = monthlyData.get(monthKey)
        if (data) {
          data.issues++
        }
      }
    })

    commits.forEach(commit => {
      const date = new Date(commit.createdAt)
      if (date >= cutoffDate) {
        const monthKey = date.toISOString().substring(0, 7)
        const data = monthlyData.get(monthKey)
        if (data) {
          data.commits++
        }
      }
    })

    return Array.from(monthlyData.entries()).map(([month, data]) => ({
      month,
      ...data,
      total: data.pullRequests + data.issues + data.commits
    }))
  }

  /**
   * Calculate current contribution streak
   */
  private static calculateContributionStreak(
    pullRequests: PullRequest[],
    issues: Issue[],
    commits: Commit[]
  ): number {
    const allDates = [
      ...pullRequests.map(pr => pr.createdAt),
      ...issues.map(issue => issue.createdAt),
      ...commits.map(commit => commit.createdAt)
    ].map(date => new Date(date).toDateString())

    const uniqueDates = [...new Set(allDates)].sort((a, b) =>
      new Date(b).getTime() - new Date(a).getTime()
    )

  let streak = 0
    let checkDate = new Date()

    for (const dateStr of uniqueDates) {
      const contributionDate = new Date(dateStr)
      const daysDiff = Math.floor((checkDate.getTime() - contributionDate.getTime()) / (1000 * 60 * 60 * 24))

      if (daysDiff <= streak + 1) {
        streak++
        checkDate = contributionDate
      } else {
        break
      }
    }

    return streak
  }

  /**
   * Get first contribution date
   */
  private static getFirstContributionDate(
    pullRequests: PullRequest[],
    issues: Issue[],
    commits: Commit[]
  ): string | null {
    const allDates = [
      ...pullRequests.map(pr => pr.createdAt),
      ...issues.map(issue => issue.createdAt),
      ...commits.map(commit => commit.createdAt)
    ]

    if (allDates.length === 0) return null

    return allDates.sort((a, b) => new Date(a).getTime() - new Date(b).getTime())[0] || null
  }

  /**
   * Get recent activity summary
   */
  private static getRecentActivitySummary(
    pullRequests: PullRequest[],
    issues: Issue[],
    commits: Commit[]
  ): string {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const recentPRs = pullRequests.filter(pr => new Date(pr.createdAt) >= thirtyDaysAgo).length
    const recentIssues = issues.filter(issue => new Date(issue.createdAt) >= thirtyDaysAgo).length
    const recentCommits = commits.filter(commit => new Date(commit.createdAt) >= thirtyDaysAgo).length

    const total = recentPRs + recentIssues + recentCommits

    if (total === 0) return 'No recent activity'
    if (total <= 5) return 'Low activity'
    if (total <= 15) return 'Moderate activity'
    return 'High activity'
  }

  /**
   * Rate limiting helper
   */
  private static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}
