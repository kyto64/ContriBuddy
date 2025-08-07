// GitHub API Response Types
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
  pushed_at: string
  size: number
  default_branch: string
  owner: {
    login: string
    avatar_url: string
    type: string
  }
  license: {
    key: string
    name: string
  } | null
}

export interface GitHubIssue {
  id: number
  number: number
  title: string
  body: string | null
  html_url: string
  state: 'open' | 'closed'
  labels: Array<{
    id: number
    name: string
    color: string
    description: string | null
  }>
  created_at: string
  updated_at: string
  user: {
    login: string
    avatar_url: string
    type: string
  }
  assignee: {
    login: string
    avatar_url: string
  } | null
  pull_request?: {
    url: string
  }
}

// Request/Response Types
export interface UserSkills {
  languages: string[]
  frameworks: string[]
  interests: string[]
  experienceLevel: 'beginner' | 'intermediate' | 'advanced'
}

export interface SearchFilters {
  language?: string
  minStars?: number
  maxStars?: number
  hasGoodFirstIssues?: boolean
  topics?: string[]
}

export interface ProjectRecommendation {
  repo: GitHubRepo
  matchScore: number
  reasons: string[]
  suggestedIssues: GitHubIssue[]
}

export interface RecommendationRequest {
  skills: UserSkills
  filters?: Partial<SearchFilters>
}

export interface RecommendationResponse {
  recommendations: ProjectRecommendation[]
  totalCount: number
  processingTime: number
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

export interface HealthResponse {
  status: 'ok' | 'error'
  timestamp: string
  uptime: number
  version: string
}
