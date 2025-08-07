import axios from 'axios'
import type {
  UserSkills,
  ProjectRecommendation,
  RecommendationResponse,
  GitHubRepo,
  GitHubIssue,
  ApiResponse
} from '@/types'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'

const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message)
    throw error
  }
)

export class ApiService {
  /**
   * Generate project recommendations based on user skills
   */
  static async generateRecommendations(
    skills: UserSkills,
    filters: Record<string, any> = {}
  ): Promise<ProjectRecommendation[]> {
    try {
      const response = await apiClient.post<ApiResponse<RecommendationResponse>>(
        '/recommendations/generate',
        { skills, filters }
      )

      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to generate recommendations')
      }

      return response.data.data?.recommendations || []
    } catch (error) {
      console.error('Error generating recommendations:', error)
      throw new Error('Failed to generate recommendations. Please try again.')
    }
  }

  /**
   * Search repositories by language and filters
   */
  static async searchRepositories(filters: {
    language?: string
    minStars?: number
    maxStars?: number
    hasGoodFirstIssues?: boolean
    topics?: string[]
  }): Promise<GitHubRepo[]> {
    try {
      const params = new URLSearchParams()

      if (filters.language) params.append('language', filters.language)
      if (filters.minStars) params.append('minStars', filters.minStars.toString())
      if (filters.maxStars) params.append('maxStars', filters.maxStars.toString())
      if (filters.hasGoodFirstIssues) params.append('hasGoodFirstIssues', 'true')
      if (filters.topics) params.append('topics', filters.topics.join(','))

      const response = await apiClient.get<ApiResponse<{ repositories: GitHubRepo[] }>>(
        `/github/repositories/search?${params.toString()}`
      )

      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to search repositories')
      }

      return response.data.data?.repositories || []
    } catch (error) {
      console.error('Error searching repositories:', error)
      throw new Error('Failed to search repositories. Please try again.')
    }
  }

  /**
   * Get repository details
   */
  static async getRepository(owner: string, repo: string): Promise<GitHubRepo> {
    try {
      const response = await apiClient.get<ApiResponse<GitHubRepo>>(
        `/github/repositories/${owner}/${repo}`
      )

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.error || 'Repository not found')
      }

      return response.data.data
    } catch (error) {
      console.error(`Error fetching repository ${owner}/${repo}:`, error)
      throw new Error('Failed to fetch repository details. Please try again.')
    }
  }

  /**
   * Get repository issues
   */
  static async getRepositoryIssues(
    owner: string,
    repo: string,
    labels?: string[]
  ): Promise<GitHubIssue[]> {
    try {
      const params = new URLSearchParams()
      if (labels && labels.length > 0) {
        params.append('labels', labels.join(','))
      }

      const response = await apiClient.get<ApiResponse<{ issues: GitHubIssue[] }>>(
        `/github/repositories/${owner}/${repo}/issues?${params.toString()}`
      )

      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to fetch issues')
      }

      return response.data.data?.issues || []
    } catch (error) {
      console.error(`Error fetching issues for ${owner}/${repo}:`, error)
      throw new Error('Failed to fetch repository issues. Please try again.')
    }
  }

  /**
   * Get good first issues for a repository
   */
  static async getGoodFirstIssues(owner: string, repo: string): Promise<GitHubIssue[]> {
    try {
      const response = await apiClient.get<ApiResponse<{ issues: GitHubIssue[] }>>(
        `/github/repositories/${owner}/${repo}/good-first-issues`
      )

      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to fetch good first issues')
      }

      return response.data.data?.issues || []
    } catch (error) {
      console.error(`Error fetching good first issues for ${owner}/${repo}:`, error)
      throw new Error('Failed to fetch good first issues. Please try again.')
    }
  }

  /**
   * Get trending repositories by language
   */
  static async getTrendingRepositories(language: string, limit = 10): Promise<GitHubRepo[]> {
    try {
      const response = await apiClient.get<ApiResponse<{ repositories: GitHubRepo[] }>>(
        `/recommendations/trending/${language}?limit=${limit}`
      )

      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to fetch trending repositories')
      }

      return response.data.data?.repositories || []
    } catch (error) {
      console.error(`Error fetching trending ${language} repositories:`, error)
      throw new Error('Failed to fetch trending repositories. Please try again.')
    }
  }

  /**
   * Health check
   */
  static async healthCheck(): Promise<boolean> {
    try {
      const response = await apiClient.get('/recommendations/health')
      return response.status === 200
    } catch (error) {
      console.error('Health check failed:', error)
      return false
    }
  }
}
