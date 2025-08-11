import type { SkillAnalysisResult, FrameworkSkill, LanguageSkill } from '../types/index.js'

interface GitHubRepository {
  name: string
  description: string | null
  language: string | null
  topics: string[]
  updated_at: string
  stargazers_count: number
  size: number
}

interface GitHubLanguagesResponse {
  [language: string]: number
}

export class SkillAnalysisService {
  private static readonly FRAMEWORK_PATTERNS = {
    // JavaScript/TypeScript Frameworks
    'React': ['react', 'jsx', 'tsx', 'react-dom', 'next.js', 'gatsby'],
    'Vue.js': ['vue', 'vuejs', 'nuxt', 'vue-cli', 'vite'],
    'Angular': ['angular', '@angular', 'ng', 'angular-cli'],
    'Node.js': ['node', 'nodejs', 'express', 'koa', 'fastify', 'nest'],
    'Svelte': ['svelte', 'sveltekit'],

    // Python Frameworks
    'Django': ['django', 'django-rest-framework'],
    'Flask': ['flask', 'flask-restful'],
    'FastAPI': ['fastapi', 'starlette'],
    'Pandas': ['pandas', 'numpy', 'scipy'],
    'TensorFlow': ['tensorflow', 'tf', 'keras'],
    'PyTorch': ['torch', 'pytorch', 'torchvision'],

    // Java Frameworks
    'Spring': ['spring', 'spring-boot', 'spring-framework'],
    'Spring Boot': ['spring-boot', 'springboot'],

    // C# Frameworks
    '.NET': ['dotnet', '.net', 'aspnet', 'asp.net'],
    'ASP.NET': ['aspnet', 'asp.net'],

    // PHP Frameworks
    'Laravel': ['laravel', 'artisan'],
    'Symfony': ['symfony'],
    'CodeIgniter': ['codeigniter'],

    // Ruby Frameworks
    'Ruby on Rails': ['rails', 'ruby-on-rails', 'ror'],

    // Go Frameworks
    'Gin': ['gin-gonic', 'gin'],
    'Echo': ['echo'],
    'Fiber': ['fiber'],

    // Database & Tools
    'Docker': ['docker', 'dockerfile', 'docker-compose'],
    'Kubernetes': ['kubernetes', 'k8s', 'kubectl'],
    'MongoDB': ['mongodb', 'mongo', 'mongoose'],
    'PostgreSQL': ['postgresql', 'postgres', 'pg'],
    'MySQL': ['mysql'],
    'Redis': ['redis'],
    'GraphQL': ['graphql', 'apollo'],
    'REST API': ['rest', 'api', 'restful'],

    // Frontend Tools
    'Webpack': ['webpack'],
    'Vite': ['vite'],
    'Tailwind CSS': ['tailwind', 'tailwindcss'],
    'Bootstrap': ['bootstrap'],
    'Sass/SCSS': ['sass', 'scss'],

    // Testing
    'Jest': ['jest'],
    'Cypress': ['cypress'],
    'Pytest': ['pytest'],
    'JUnit': ['junit'],

    // Cloud & DevOps
    'AWS': ['aws', 'amazon-web-services'],
    'Azure': ['azure', 'microsoft-azure'],
    'Google Cloud': ['gcp', 'google-cloud'],
    'Terraform': ['terraform'],
    'Jenkins': ['jenkins'],
    'GitHub Actions': ['github-actions', 'actions']
  }

  /**
   * Analyze user's GitHub repositories to detect skills
   */
  static async analyzeUserSkills(accessToken: string, username: string): Promise<SkillAnalysisResult> {
    try {
      console.log(`🔍 Starting skill analysis for user: ${username}`)

      // Get user's repositories
      const repositories = await this.fetchUserRepositories(accessToken, username)
      console.log(`📁 Found ${repositories.length} repositories`)

      if (repositories.length === 0) {
        return this.createEmptyAnalysis()
      }

      // Analyze languages from all repositories
      const languageSkills = await this.analyzeLanguages(accessToken, username, repositories)

      // Analyze frameworks and tools
      const frameworkSkills = await this.analyzeFrameworks(accessToken, username, repositories)

      // Extract topics and interests
      const interests = this.extractInterests(repositories)

      // Calculate experience level
      const experienceLevel = this.calculateExperienceLevel(repositories, languageSkills)

      // Calculate confidence score
      const confidence = this.calculateConfidenceScore(repositories.length, languageSkills.length)

      const result: SkillAnalysisResult = {
        confidence,
        languages: languageSkills,
        frameworks: frameworkSkills,
        interests,
        experienceLevel,
        summary: {
          totalRepositories: repositories.length,
          publicRepositories: repositories.length,
          estimatedCommits: this.estimateCommits(repositories),
          recentActivity: this.getRecentActivity(repositories)
        }
      }

      console.log(`✅ Analysis complete. Confidence: ${confidence}%`)
      return result

    } catch (error) {
      console.error('Skill analysis error:', error)
      throw new Error('Failed to analyze user skills')
    }
  }

  /**
   * Fetch user's public repositories
   */
  private static async fetchUserRepositories(accessToken: string, username: string): Promise<GitHubRepository[]> {
    const response = await fetch(`https://api.github.com/users/${username}/repos?type=public&sort=updated&per_page=100`, {
      headers: {
        'Authorization': `token ${accessToken}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch repositories: ${response.statusText}`)
    }

    return response.json()
  }

  /**
   * Analyze programming languages from repositories
   */
  private static async analyzeLanguages(accessToken: string, username: string, repositories: GitHubRepository[]): Promise<LanguageSkill[]> {
    const languageStats = new Map<string, number>()

    for (const repo of repositories) {
      if (repo.language) {
        languageStats.set(repo.language, (languageStats.get(repo.language) || 0) + 1)
      }

      // Get detailed language statistics for significant repositories
      if (repo.stargazers_count > 0 || repo.size > 100) {
        try {
          const langResponse = await fetch(`https://api.github.com/repos/${username}/${repo.name}/languages`, {
            headers: {
              'Authorization': `token ${accessToken}`,
              'Accept': 'application/vnd.github.v3+json'
            }
          })

          if (langResponse.ok) {
            const languages: GitHubLanguagesResponse = await langResponse.json()
            for (const [lang, bytes] of Object.entries(languages)) {
              languageStats.set(lang, (languageStats.get(lang) || 0) + bytes / 1000)
            }
          }
        } catch (error) {
          console.warn(`Failed to fetch languages for ${repo.name}:`, error)
        }
      }
    }

    // Convert to LanguageSkill array and sort by usage
    const sortedLanguages = Array.from(languageStats.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10) // Top 10 languages

    return sortedLanguages.map(([name, score], index) => ({
      name,
      level: this.calculateSkillLevel(score, index, sortedLanguages.length),
      confidence: Math.min(90, 60 + (score / Math.max(...sortedLanguages.map(l => l[1]))) * 30)
    }))
  }

  /**
   * Analyze frameworks and tools from repositories
   */
  private static async analyzeFrameworks(accessToken: string, username: string, repositories: GitHubRepository[]): Promise<FrameworkSkill[]> {
    const frameworkStats = new Map<string, number>()

    for (const repo of repositories) {
      // Check repository topics
      for (const topic of repo.topics) {
        this.matchFrameworkFromText(topic.toLowerCase(), frameworkStats)
      }

      // Check repository description
      if (repo.description) {
        this.matchFrameworkFromText(repo.description.toLowerCase(), frameworkStats)
      }

      // Check repository name
      this.matchFrameworkFromText(repo.name.toLowerCase(), frameworkStats)

      // For JavaScript/TypeScript projects, check package.json
      if (['JavaScript', 'TypeScript'].includes(repo.language || '')) {
        try {
          const packageJsonResponse = await fetch(`https://api.github.com/repos/${username}/${repo.name}/contents/package.json`, {
            headers: {
              'Authorization': `token ${accessToken}`,
              'Accept': 'application/vnd.github.v3+json'
            }
          })

          if (packageJsonResponse.ok) {
            const packageData = await packageJsonResponse.json()
            if (packageData.content) {
              const content = atob(packageData.content)
              const packageJson = JSON.parse(content)

              // Check dependencies
              const allDeps = {
                ...packageJson.dependencies,
                ...packageJson.devDependencies,
                ...packageJson.peerDependencies
              }

              for (const dep of Object.keys(allDeps)) {
                this.matchFrameworkFromText(dep.toLowerCase(), frameworkStats)
              }
            }
          }
        } catch (error) {
          // Ignore errors for package.json parsing
        }
      }

      // For Python projects, check requirements.txt or setup.py
      if (repo.language === 'Python') {
        try {
          const reqResponse = await fetch(`https://api.github.com/repos/${username}/${repo.name}/contents/requirements.txt`, {
            headers: {
              'Authorization': `token ${accessToken}`,
              'Accept': 'application/vnd.github.v3+json'
            }
          })

          if (reqResponse.ok) {
            const reqData = await reqResponse.json()
            if (reqData.content) {
              const content = atob(reqData.content)
              const lines = content.split('\n')
              for (const line of lines) {
                const trimmedLine = line.trim()
                if (trimmedLine) {
                  const packageName = trimmedLine.split('==')[0]?.split('>=')[0]?.split('<=')[0]?.trim()
                  if (packageName) {
                    this.matchFrameworkFromText(packageName.toLowerCase(), frameworkStats)
                  }
                }
              }
            }
          }
        } catch (error) {
          // Ignore errors
        }
      }
    }

    // Convert to FrameworkSkill array and sort by usage
    const sortedFrameworks = Array.from(frameworkStats.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15) // Top 15 frameworks

    return sortedFrameworks.map(([name, score], index) => ({
      name,
      level: this.calculateSkillLevel(score, index, sortedFrameworks.length),
      confidence: Math.min(85, 50 + (score / Math.max(...sortedFrameworks.map(f => f[1]))) * 35)
    }))
  }

  /**
   * Match frameworks from text content
   */
  private static matchFrameworkFromText(text: string, frameworkStats: Map<string, number>): void {
    for (const [framework, patterns] of Object.entries(this.FRAMEWORK_PATTERNS)) {
      for (const pattern of patterns) {
        if (text.includes(pattern)) {
          frameworkStats.set(framework, (frameworkStats.get(framework) || 0) + 1)
          break // Only count once per repository
        }
      }
    }
  }

  /**
   * Extract interests from repository topics and descriptions
   */
  private static extractInterests(repositories: GitHubRepository[]): string[] {
    const interestMap = new Map<string, number>()

    for (const repo of repositories) {
      // Add topics as interests
      for (const topic of repo.topics) {
        const cleanTopic = topic.replace(/-/g, ' ').toLowerCase()
        interestMap.set(cleanTopic, (interestMap.get(cleanTopic) || 0) + 1)
      }

      // Extract keywords from descriptions
      if (repo.description) {
        const keywords = this.extractKeywords(repo.description)
        for (const keyword of keywords) {
          interestMap.set(keyword, (interestMap.get(keyword) || 0) + 1)
        }
      }
    }

    // Return top interests
    return Array.from(interestMap.entries())
      .filter(([, count]) => count >= 2) // Must appear in at least 2 repositories
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([interest]) => interest)
  }

  /**
   * Extract keywords from text
   */
  private static extractKeywords(text: string): string[] {
    const commonWords = new Set([
      'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
      'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did',
      'this', 'that', 'these', 'those', 'my', 'your', 'his', 'her', 'its', 'our', 'their'
    ])

    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2 && !commonWords.has(word))
      .slice(0, 5)
  }

  /**
   * Calculate experience level based on repositories and languages
   */
  private static calculateExperienceLevel(repositories: GitHubRepository[], languages: LanguageSkill[]): 'beginner' | 'intermediate' | 'advanced' {
    const repoCount = repositories.length
    const languageCount = languages.length
    const totalStars = repositories.reduce((sum, repo) => sum + repo.stargazers_count, 0)
    const avgRepoSize = repositories.reduce((sum, repo) => sum + repo.size, 0) / repositories.length

    let score = 0

    // Repository count factor
    if (repoCount >= 20) score += 3
    else if (repoCount >= 10) score += 2
    else if (repoCount >= 5) score += 1

    // Language diversity factor
    if (languageCount >= 5) score += 2
    else if (languageCount >= 3) score += 1

    // Star factor (community recognition)
    if (totalStars >= 50) score += 2
    else if (totalStars >= 10) score += 1

    // Repository complexity factor
    if (avgRepoSize >= 1000) score += 2
    else if (avgRepoSize >= 500) score += 1

    if (score >= 7) return 'advanced'
    if (score >= 4) return 'intermediate'
    return 'beginner'
  }

  /**
   * Calculate skill level for individual skills
   */
  private static calculateSkillLevel(score: number, index: number, total: number): 'beginner' | 'intermediate' | 'advanced' {
    const position = index / total

    if (position <= 0.3) return 'advanced'
    if (position <= 0.6) return 'intermediate'
    return 'beginner'
  }

  /**
   * Calculate confidence score for the analysis
   */
  private static calculateConfidenceScore(repoCount: number, languageCount: number): number {
    let confidence = 30 // Base confidence

    // Repository count factor
    confidence += Math.min(30, repoCount * 2)

    // Language diversity factor
    confidence += Math.min(25, languageCount * 5)

    // Cap at 95%
    return Math.min(95, confidence)
  }

  /**
   * Estimate total commits across repositories
   */
  private static estimateCommits(repositories: GitHubRepository[]): number {
    // Rough estimation based on repository size and age
    return repositories.reduce((total, repo) => {
      const monthsOld = this.getMonthsOld(repo.updated_at)
      const sizeEstimate = Math.max(1, repo.size / 100)
      return total + Math.floor(monthsOld * sizeEstimate * 2)
    }, 0)
  }

  /**
   * Get recent activity description
   */
  private static getRecentActivity(repositories: GitHubRepository[]): string {
    const recentRepos = repositories
      .filter(repo => this.getMonthsOld(repo.updated_at) <= 3)
      .length

    if (recentRepos === 0) return 'No recent activity'
    if (recentRepos <= 2) return 'Low activity'
    if (recentRepos <= 5) return 'Moderate activity'
    return 'High activity'
  }

  /**
   * Calculate months since last update
   */
  private static getMonthsOld(dateString: string): number {
    const date = new Date(dateString)
    const now = new Date()
    return (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24 * 30)
  }

  /**
   * Create empty analysis for users with no repositories
   */
  private static createEmptyAnalysis(): SkillAnalysisResult {
    return {
      confidence: 0,
      languages: [],
      frameworks: [],
      interests: [],
      experienceLevel: 'beginner',
      summary: {
        totalRepositories: 0,
        publicRepositories: 0,
        estimatedCommits: 0,
        recentActivity: 'No activity'
      }
    }
  }
}
