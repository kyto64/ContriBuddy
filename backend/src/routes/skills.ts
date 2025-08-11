import { Router, Request, Response } from 'express'
import { SkillAnalysisService } from '../services/skillAnalysis.js'
import { AuthService } from '../services/auth.js'
import { getUserAccessToken } from './auth.js'
import { authenticateToken } from '../middleware/auth.js'

export const skillsRouter = Router()

// In-memory storage for analysis results
const userAnalysisResults = new Map<number, any>()

/**
 * Store GitHub access token for authenticated user
 * POST /api/skills/store-token
 */
skillsRouter.post('/store-token', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' })
      return
    }

    const { accessToken } = req.body

    if (!accessToken) {
      res.status(400).json({ error: 'GitHub access token is required' })
      return
    }

    // Store the access token for this user
    // Note: This is now handled automatically in the auth callback
    console.log(`💾 Access token should already be stored for user ${req.user.userId}`)

    res.json({ success: true, message: 'Access token stored successfully' })

  } catch (error) {
    console.error('Store token error:', error)
    res.status(500).json({
      error: 'Failed to store access token',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

/**
 * Analyze user's GitHub repositories for skills
 * POST /api/skills/analyze
 */
skillsRouter.post('/analyze', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' })
      return
    }

    // Get stored access token
    const accessToken = getUserAccessToken(req.user.userId)

    if (!accessToken) {
      res.status(400).json({
        error: 'GitHub access token not found. Please re-authenticate with GitHub.',
        requiresAuth: true
      })
      return
    }

    console.log(`🔍 Starting skill analysis for user ID: ${req.user.userId}`)

    // Get user information to get username
    const githubUser = await AuthService.getGitHubUser(accessToken)
    console.log(`📊 Analyzing skills for GitHub user: ${githubUser.login}`)

    // Analyze user's skills
    const analysis = await SkillAnalysisService.analyzeUserSkills(accessToken, githubUser.login)

    // Store the analysis result
    userAnalysisResults.set(req.user.userId, {
      ...analysis,
      analyzedAt: new Date().toISOString(),
      githubUser: {
        login: githubUser.login,
        name: githubUser.name,
        avatar_url: githubUser.avatar_url
      }
    })

    console.log(`✅ Analysis complete for ${githubUser.login}. Confidence: ${analysis.confidence}%`)

    res.json({
      success: true,
      data: analysis
    })

  } catch (error) {
    console.error('Skill analysis error:', error)
    res.status(500).json({
      error: 'Failed to analyze skills',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

/**
 * Get user's stored skill analysis
 * GET /api/skills/my-analysis
 */
skillsRouter.get('/my-analysis', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' })
      return
    }

    const analysis = userAnalysisResults.get(req.user.userId)

    if (!analysis) {
      res.json({
        success: true,
        data: null,
        message: 'No analysis found. Please run an analysis first.'
      })
      return
    }

    res.json({
      success: true,
      data: analysis
    })

  } catch (error) {
    console.error('Get analysis error:', error)
    res.status(500).json({
      error: 'Failed to retrieve analysis',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

/**
 * Delete user's stored skill analysis
 * DELETE /api/skills/my-analysis
 */
skillsRouter.delete('/my-analysis', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' })
      return
    }

    const hadAnalysis = userAnalysisResults.has(req.user.userId)
    userAnalysisResults.delete(req.user.userId)

    res.json({
      success: true,
      message: hadAnalysis ? 'Analysis deleted successfully' : 'No analysis found to delete'
    })

  } catch (error) {
    console.error('Delete analysis error:', error)
    res.status(500).json({
      error: 'Failed to delete analysis',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

/**
 * Get analysis status for user
 * GET /api/skills/status
 */
skillsRouter.get('/status', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' })
      return
    }

    const hasToken = !!getUserAccessToken(req.user.userId)
    const hasAnalysis = userAnalysisResults.has(req.user.userId)
    const analysis = hasAnalysis ? userAnalysisResults.get(req.user.userId) : null

    res.json({
      success: true,
      data: {
        hasGitHubToken: hasToken,
        hasAnalysis,
        lastAnalyzedAt: analysis?.analyzedAt || null,
        githubUser: analysis?.githubUser || null
      }
    })

  } catch (error) {
    console.error('Get status error:', error)
    res.status(500).json({
      error: 'Failed to get status',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})
