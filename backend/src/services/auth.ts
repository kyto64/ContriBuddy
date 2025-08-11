import axios from 'axios'
import type { GitHubUser, AuthUser } from '../types/index.js'

const GITHUB_API_BASE = 'https://api.github.com'

export class AuthService {
  /**
   * Exchange GitHub OAuth code for access token
   */
  static async exchangeCodeForToken(code: string): Promise<string> {
    const clientId = process.env.GH_CLIENT_ID
    const clientSecret = process.env.GH_CLIENT_SECRET

    if (!clientId || !clientSecret) {
      throw new Error('GitHub OAuth credentials not configured')
    }

    try {
      const response = await axios.post(
        'https://github.com/login/oauth/access_token',
        {
          client_id: clientId,
          client_secret: clientSecret,
          code,
        },
        {
          headers: {
            Accept: 'application/json',
          },
        }
      )

      const { access_token, error } = response.data

      if (error) {
        throw new Error(`GitHub OAuth error: ${error}`)
      }

      if (!access_token) {
        throw new Error('No access token received from GitHub')
      }

      return access_token
    } catch (error) {
      console.error('Error exchanging code for token:', error)
      throw new Error('Failed to exchange code for access token')
    }
  }

  /**
   * Get user information from GitHub using access token
   */
  static async getGitHubUser(accessToken: string): Promise<GitHubUser> {
    try {
      const response = await axios.get(`${GITHUB_API_BASE}/user`, {
        headers: {
          Authorization: `token ${accessToken}`,
          Accept: 'application/vnd.github.v3+json',
        },
      })

      return response.data
    } catch (error) {
      console.error('Error fetching GitHub user:', error)
      throw new Error('Failed to fetch user information from GitHub')
    }
  }

  /**
   * Convert GitHub user to AuthUser format
   */
  static gitHubUserToAuthUser(githubUser: GitHubUser): AuthUser {
    return {
      id: 0, // Will be set when storing in database
      githubId: githubUser.id,
      login: githubUser.login,
      name: githubUser.name,
      email: githubUser.email,
      avatar_url: githubUser.avatar_url,
      bio: githubUser.bio,
      company: githubUser.company,
      location: githubUser.location,
      blog: githubUser.blog,
      public_repos: githubUser.public_repos,
      followers: githubUser.followers,
      following: githubUser.following,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  }
}
