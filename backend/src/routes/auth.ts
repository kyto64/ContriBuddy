import { Router, Request, Response } from 'express'
import { AuthService } from '../services/auth.js'
import { generateToken, authenticateToken } from '../middleware/auth.js'
import type { AuthUser, JWTPayload } from '../types/index.js'

export const authRouter = Router()

// In-memory user storage (in production, use a database)
const users = new Map<number, AuthUser>()
let nextUserId = 1

/**
 * GitHub OAuth callback
 * POST /api/auth/github/callback
 */
authRouter.post('/github/callback', async (req: Request, res: Response): Promise<void> => {
  try {
    const { code } = req.body

    if (!code) {
      res.status(400).json({ error: 'Authorization code is required' })
      return
    }

    // Exchange code for access token
    const accessToken = await AuthService.exchangeCodeForToken(code)

    // Get user information from GitHub
    const githubUser = await AuthService.getGitHubUser(accessToken)

    // Convert to our user format
    const authUser = AuthService.gitHubUserToAuthUser(githubUser)

    // Check if user already exists
    let existingUser = Array.from(users.values()).find(u => u.githubId === githubUser.id)

    if (existingUser) {
      // Update existing user
      existingUser = {
        ...existingUser,
        ...authUser,
        id: existingUser.id, // Keep existing ID
        createdAt: existingUser.createdAt, // Keep original creation date
        updatedAt: new Date().toISOString()
      }
      users.set(existingUser.id, existingUser)
    } else {
      // Create new user
      authUser.id = nextUserId++
      users.set(authUser.id, authUser)
      existingUser = authUser
    }

    // Generate JWT token
    const tokenPayload: Omit<JWTPayload, 'iat' | 'exp'> = {
      userId: existingUser.id,
      githubId: existingUser.githubId,
      login: existingUser.login
    }

    const token = generateToken(tokenPayload)

    // Return user info and token
    res.json({
      success: true,
      token,
      user: {
        id: existingUser.id,
        githubId: existingUser.githubId,
        login: existingUser.login,
        name: existingUser.name,
        email: existingUser.email,
        avatar_url: existingUser.avatar_url,
        bio: existingUser.bio,
        company: existingUser.company,
        location: existingUser.location,
        blog: existingUser.blog,
        public_repos: existingUser.public_repos,
        followers: existingUser.followers,
        following: existingUser.following,
      }
    })

  } catch (error) {
    console.error('GitHub OAuth callback error:', error)
    res.status(500).json({
      error: 'Authentication failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

/**
 * Get current user profile
 * GET /api/auth/me
 */
authRouter.get('/me', authenticateToken, (req: Request, res: Response): void => {
  if (!req.user) {
    res.status(401).json({ error: 'User not authenticated' })
    return
  }

  const user = users.get(req.user.userId)

  if (!user) {
    res.status(404).json({ error: 'User not found' })
    return
  }

  res.json({
    user: {
      id: user.id,
      githubId: user.githubId,
      login: user.login,
      name: user.name,
      email: user.email,
      avatar_url: user.avatar_url,
      bio: user.bio,
      company: user.company,
      location: user.location,
      blog: user.blog,
      public_repos: user.public_repos,
      followers: user.followers,
      following: user.following,
    }
  })
})

/**
 * Logout user (client-side token removal)
 * POST /api/auth/logout
 */
authRouter.post('/logout', authenticateToken, (req: Request, res: Response) => {
  // With JWT, logout is typically handled client-side by removing the token
  // Here we can log the logout action or implement token blacklisting if needed

  res.json({
    success: true,
    message: 'Logged out successfully'
  })
})

/**
 * Get GitHub OAuth URL for frontend
 * GET /api/auth/github/url
 */
authRouter.get('/github/url', (req: Request, res: Response): void => {
  const clientId = process.env.GH_CLIENT_ID

  if (!clientId) {
    res.status(500).json({ error: 'GitHub OAuth not configured' })
    return
  }

  const redirectUri = `${process.env.SERVICE_URL}/auth/github/callback`
  const scope = 'user:email read:user'

  const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}`

  res.json({
    url: githubAuthUrl,
    clientId
  })
})
