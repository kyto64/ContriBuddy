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

// Authentication types
export interface AuthUser {
  id: number
  githubId: number
  login: string
  name: string | null
  email: string | null
  avatar_url: string
  bio: string | null
  company: string | null
  location: string | null
  blog: string | null
  public_repos: number
  followers: number
  following: number
}

export interface AuthResponse {
  success: boolean
  token: string
  user: AuthUser
}

export interface GitHubAuthUrl {
  url: string
  clientId: string
}

// Application types
export interface SkillsFormData {
  languages: string[]
  frameworks: string[]
  interests: string[]
  experienceLevel: 'beginner' | 'intermediate' | 'advanced'
}

// Skill Analysis Types
export interface LanguageSkill {
  name: string
  level: 'beginner' | 'intermediate' | 'advanced'
  confidence: number
}

export interface FrameworkSkill {
  name: string
  level: 'beginner' | 'intermediate' | 'advanced'
  confidence: number
}

export interface SkillAnalysisResult {
  confidence: number
  languages: LanguageSkill[]
  frameworks: FrameworkSkill[]
  interests: string[]
  experienceLevel: 'beginner' | 'intermediate' | 'advanced'
  summary: {
    totalRepositories: number
    publicRepositories: number
    estimatedCommits: number
    recentActivity: string
  }
  analyzedAt?: string
  githubUser?: {
    login: string
    name: string | null
    avatar_url: string
  }
}

export interface AnalysisStatus {
  hasGitHubToken: boolean
  hasAnalysis: boolean
  lastAnalyzedAt: string | null
  githubUser: {
    login: string
    name: string | null
    avatar_url: string
  } | null
}

// API Response Types

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

// Search History types
export interface SearchHistoryItem {
  id: string
  skills: SkillsFormData
  timestamp: number
  label?: string
}

export interface FormattedSearchHistoryItem extends SearchHistoryItem {
  relativeTime: string
  skillsCount: number
}

// Contribution Analysis Types
export interface PullRequest {
  id: number
  number: number
  title: string
  body: string | null
  state: 'open' | 'closed'
  htmlUrl: string
  createdAt: string
  updatedAt: string
  closedAt: string | null
  mergedAt: string | null
  repository: {
    name: string
    fullName: string
    language: string | null
    stars: number
  }
  additions: number
  deletions: number
  changedFiles: number
  labels: Array<{
    name: string
    color: string
  }>
}

export interface Issue {
  id: number
  number: number
  title: string
  body: string | null
  state: 'open' | 'closed'
  htmlUrl: string
  createdAt: string
  updatedAt: string
  closedAt: string | null
  repository: {
    name: string
    fullName: string
    language: string | null
    stars: number
  }
  labels: Array<{
    name: string
    color: string
  }>
}

export interface Commit {
  sha: string
  message: string
  htmlUrl: string
  createdAt: string
  author: {
    name: string
    email: string
  }
  repository: {
    name: string
    fullName: string
    language: string | null
    stars: number
  }
  stats: {
    additions: number
    deletions: number
    total: number
  }
}

export interface ContributionStats {
  topLanguages: Array<{
    language: string
    count: number
  }>
  topRepositories: Array<{
    repository: string
    count: number
  }>
  monthlyActivity: Array<{
    month: string
    pullRequests: number
    issues: number
    commits: number
    total: number
  }>
  totalAdditions: number
  totalDeletions: number
  averagePRSize: number
  contributionStreak: number
  firstContribution: string | null
  mostActiveRepository: string | null
}

export interface ContributionHistory {
  username: string
  analyzedAt: string
  pullRequests: PullRequest[]
  issues: Issue[]
  commits: Commit[]
  stats: ContributionStats
  summary: {
    totalContributions: number
    totalPullRequests: number
    totalIssues: number
    totalCommits: number
    mergedPullRequests: number
    closedIssues: number
    recentActivity: string
  }
}
