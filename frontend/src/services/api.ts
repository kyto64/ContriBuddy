import axios from 'axios'
import type { AxiosInstance } from 'axios'
import type {
  UserSkills,
  ProjectRecommendation,
  RecommendationResponse,
  GitHubRepo,
  GitHubIssue,
  ApiResponse,
  AuthResponse,
  AuthUser,
  GitHubAuthUrl
} from '@/types'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'

class ApiClient {
  private client: AxiosInstance

  constructor() {
    this.client = axios.create({
      baseURL: `${API_BASE_URL}/api`,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json'
      }
    })

    // Add request interceptor to include auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('auth_token')
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error) => Promise.reject(error)
    )

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('API Error:', error.response?.data || error.message)

        // Handle auth errors
        if (error.response?.status === 401) {
          localStorage.removeItem('auth_token')
          // Optionally redirect to login or emit auth error event
        }

        throw error
      }
    )
  }

  get axiosInstance() {
    return this.client
  }
}

const apiClient = new ApiClient().axiosInstance

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

  // Authentication methods

  /**
   * Get GitHub OAuth URL for authentication
   */
  static async getGitHubAuthUrl(): Promise<GitHubAuthUrl> {
    try {
      const response = await apiClient.get<GitHubAuthUrl>('/auth/github/url')
      return response.data
    } catch (error) {
      console.error('Error getting GitHub auth URL:', error)
      throw new Error('Failed to get GitHub authentication URL')
    }
  }

  /**
   * Handle GitHub OAuth callback
   */
  static async handleGitHubCallback(code: string): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>('/auth/github/callback', { code })

      if (response.data.success && response.data.token) {
        // Store token in localStorage
        localStorage.setItem('auth_token', response.data.token)
      }

      return response.data
    } catch (error) {
      console.error('Error handling GitHub callback:', error)
      throw new Error('Failed to authenticate with GitHub')
    }
  }

  /**
   * Get current user profile
   */
  static async getCurrentUser(): Promise<AuthUser> {
    try {
      const response = await apiClient.get<{ user: AuthUser }>('/auth/me')
      return response.data.user
    } catch (error) {
      console.error('Error getting current user:', error)
      throw new Error('Failed to get user profile')
    }
  }

  /**
   * Logout user
   */
  static async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout')
    } catch (error) {
      console.error('Error during logout:', error)
    } finally {
      // Always remove token from localStorage
      localStorage.removeItem('auth_token')
    }
  }

  /**
   * Check if user is authenticated
   */
  static isAuthenticated(): boolean {
    return !!localStorage.getItem('auth_token')
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
