import axios from 'axios'
import type { GitHubRepo, GitHubIssue, SearchFilters } from '../types/index.js'

const GITHUB_API_BASE = 'https://api.github.com'
const GITHUB_TOKEN = process.env.GITHUB_TOKEN

const githubApi = axios.create({
  baseURL: GITHUB_API_BASE,
  headers: {
    'Accept': 'application/vnd.github+json',
    'User-Agent': 'ContriBuddy-App',
    'X-GitHub-Api-Version': '2022-11-28',
    ...(GITHUB_TOKEN && { 'Authorization': `Bearer ${GITHUB_TOKEN}` })
  }
})

export class GitHubService {
  static async searchRepositories(filters: SearchFilters): Promise<GitHubRepo[]> {
    try {
      const queryParts = ['is:public', 'archived:false']

      if (filters.language) {
        queryParts.push(`language:${filters.language}`)
      }

      if (filters.hasGoodFirstIssues) {
        queryParts.push('good-first-issues:>0')
      }

      if (filters.topics && filters.topics.length > 0) {
        filters.topics.forEach(topic => {
          queryParts.push(`topic:${topic}`)
        })
      }

      if (filters.minStars) {
        queryParts.push(`stars:>=${filters.minStars}`)
      }

      if (filters.maxStars) {
        queryParts.push(`stars:<=${filters.maxStars}`)
      }

      const query = queryParts.join(' ')

      const response = await githubApi.get('/search/repositories', {
        params: {
          q: query,
          sort: 'stars',
          order: 'desc',
          per_page: 50
        }
      })

      return response.data.items
    } catch (error) {
      console.error('Error searching repositories:', error)
      throw new Error('Failed to search repositories')
    }
  }

  static async getRepositoryIssues(
    owner: string,
    repo: string,
    labels?: string[]
  ): Promise<GitHubIssue[]> {
    try {
      const params: Record<string, any> = {
        state: 'open',
        per_page: 20,
        sort: 'created',
        direction: 'desc'
      }

      if (labels && labels.length > 0) {
        params.labels = labels.join(',')
      }

      const response = await githubApi.get(`/repos/${owner}/${repo}/issues`, {
        params
      })

      // Filter out pull requests (GitHub API includes PRs in issues)
      return response.data.filter((issue: any) => !issue.pull_request)
    } catch (error) {
      console.error(`Error fetching issues for ${owner}/${repo}:`, error)
      throw new Error('Failed to fetch repository issues')
    }
  }

  static async getGoodFirstIssues(owner: string, repo: string): Promise<GitHubIssue[]> {
    return this.getRepositoryIssues(owner, repo, ['good first issue', 'good-first-issue', 'beginner-friendly'])
  }

  static async getRepositoryDetails(owner: string, repo: string): Promise<GitHubRepo> {
    try {
      const response = await githubApi.get(`/repos/${owner}/${repo}`)
      return response.data
    } catch (error) {
      console.error(`Error fetching repository details for ${owner}/${repo}:`, error)
      throw new Error('Failed to fetch repository details')
    }
  }

  static async searchByLanguages(languages: string[]): Promise<GitHubRepo[]> {
    const allRepos: GitHubRepo[] = []

    for (const language of languages) {
      try {
        const repos = await this.searchRepositories({
          language,
          minStars: 10,
          hasGoodFirstIssues: true
        })
        allRepos.push(...repos)
      } catch (error) {
        console.error(`Error searching for ${language} repositories:`, error)
      }
    }

    // Remove duplicates and sort by stars
    const uniqueRepos = allRepos.filter((repo, index, self) =>
      index === self.findIndex(r => r.id === repo.id)
    )

    return uniqueRepos.sort((a, b) => b.stargazers_count - a.stargazers_count)
  }
}
