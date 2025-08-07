// GitHub API types
export interface GitHubRepo {
  id: number
  name: string
  full_name: string
  description: string | null
  html_url: string
  stargazers_count: number
  forks_count: number
  language: string | null
  topics: string[]
  open_issues_count: number
  updated_at: string
  owner: {
    login: string
    avatar_url: string
  }
}

export interface GitHubIssue {
  id: number
  number: number
  title: string
  body: string | null
  html_url: string
  state: 'open' | 'closed'
  labels: Array<{
    name: string
    color: string
  }>
  created_at: string
  updated_at: string
  user: {
    login: string
    avatar_url: string
  }
}

// Application types
export interface UserSkills {
  languages: string[]
  frameworks: string[]
  interests: string[]
  experienceLevel: 'beginner' | 'intermediate' | 'advanced'
}

export interface ProjectRecommendation {
  repo: GitHubRepo
  matchScore: number
  reasons: string[]
  suggestedIssues: GitHubIssue[]
}

export interface SearchFilters {
  language?: string
  minStars?: number
  maxStars?: number
  hasGoodFirstIssues?: boolean
  topics?: string[]
}

export interface RecommendationResponse {
  recommendations: ProjectRecommendation[]
  totalCount: number
  processingTime: number
}

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
}
