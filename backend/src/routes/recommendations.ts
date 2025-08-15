import { Router } from 'express'
import { RecommendationService } from '../services/recommendations.js'
import { z } from 'zod'
import type { Request, Response } from 'express'
import type { ApiResponse, RecommendationResponse, SearchFilters } from '../types/index.js'
import { authenticateToken } from '../middleware/auth.js'
import { getUserAccessToken } from './auth.js'

export const recommendationsRouter = Router()

// Request validation schema
const RecommendationRequestSchema = z.object({
  skills: z.object({
    languages: z.array(z.string()).default([]),
    frameworks: z.array(z.string()).default([]),
    interests: z.array(z.string()).default([]),
    experienceLevel: z.enum(['beginner', 'intermediate', 'advanced']).default('beginner')
  }),
  filters: z.object({
    language: z.string().optional(),
    minStars: z.number().min(0).optional(),
    maxStars: z.number().min(0).optional(),
    hasGoodFirstIssues: z.boolean().optional(),
    topics: z.array(z.string()).optional()
  }).optional()
})

// Get personalized project recommendations
recommendationsRouter.post('/generate', async (req: Request, res: Response): Promise<void> => {
  try {
    const startTime = Date.now()

    // Validate request body
    const validation = RecommendationRequestSchema.safeParse(req.body)
    if (!validation.success) {
      const response: ApiResponse = {
        success: false,
        error: 'Invalid request data',
        message: validation.error.errors.map(e => e.message).join(', ')
      }
      res.status(400).json(response)
      return
    }

  const { skills, filters = {} } = validation.data

    // Validate that user provided some skills or interests
    if (skills.languages.length === 0 && skills.frameworks.length === 0 && skills.interests.length === 0) {
      const response: ApiResponse = {
        success: false,
        error: 'At least one skill, framework, or interest must be provided'
      }
      res.status(400).json(response)
      return
    }

    console.log('📝 Generating recommendations for:', {
      languages: skills.languages,
      frameworks: skills.frameworks,
      interests: skills.interests,
      experienceLevel: skills.experienceLevel
    })

    // Generate recommendations
    const cleanFilters: Partial<SearchFilters> = {}

    if (filters.language) {
      cleanFilters.language = filters.language
    }
    if (filters.minStars !== undefined) {
      cleanFilters.minStars = filters.minStars
    }
    if (filters.maxStars !== undefined) {
      cleanFilters.maxStars = filters.maxStars
    }
    if (filters.hasGoodFirstIssues !== undefined) {
      cleanFilters.hasGoodFirstIssues = filters.hasGoodFirstIssues
    }
    if (filters.topics) {
      cleanFilters.topics = filters.topics
    }

    const recommendations = await RecommendationService.getRecommendations(skills, cleanFilters)
    const processingTime = Date.now() - startTime

    const responseData: RecommendationResponse = {
      recommendations,
      totalCount: recommendations.length,
      processingTime
    }

    const response: ApiResponse<RecommendationResponse> = {
      success: true,
      data: responseData,
      message: `Generated ${recommendations.length} recommendations in ${processingTime}ms`
    }

    res.json(response)
  } catch (error) {
    console.error('❌ Error generating recommendations:', error)
    const response: ApiResponse = {
      success: false,
      error: 'Failed to generate recommendations',
      message: error instanceof Error ? error.message : 'Unknown error'
    }
    res.status(500).json(response)
  }
})

recommendationsRouter.post('/generate/personalized', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const validation = RecommendationRequestSchema.safeParse(req.body)
    if (!validation.success) {
      res.status(400).json({ success: false, error: 'Invalid request data', message: validation.error.errors.map(e => e.message).join(', ') })
      return
    }

    const { skills, filters = {} } = validation.data

    // user and token
  const user = req.user!
  const token = getUserAccessToken(user.userId)

    if (!token) {
      // Fallback to non-personalized
      const clean: Partial<SearchFilters> = {}
      if (filters.language) clean.language = filters.language
      if (typeof filters.minStars === 'number') clean.minStars = filters.minStars
      if (typeof filters.maxStars === 'number') clean.maxStars = filters.maxStars
      if (typeof filters.hasGoodFirstIssues === 'boolean') clean.hasGoodFirstIssues = filters.hasGoodFirstIssues
      if (Array.isArray(filters.topics)) clean.topics = filters.topics
      const recs = await RecommendationService.getRecommendations(skills, clean)
      res.json({ success: true, data: { recommendations: recs, totalCount: recs.length, processingTime: 0 } })
      return
    }

    const clean: Partial<SearchFilters> = {}
    if (filters.language) clean.language = filters.language
    if (typeof filters.minStars === 'number') clean.minStars = filters.minStars
    if (typeof filters.maxStars === 'number') clean.maxStars = filters.maxStars
    if (typeof filters.hasGoodFirstIssues === 'boolean') clean.hasGoodFirstIssues = filters.hasGoodFirstIssues
    if (Array.isArray(filters.topics)) clean.topics = filters.topics
    const recs = await RecommendationService.getPersonalizedRecommendations(user, skills, clean)
    res.json({ success: true, data: { recommendations: recs, totalCount: recs.length } })
  } catch (error) {
    console.error('❌ Error generating personalized recommendations:', error)
    res.status(500).json({ success: false, error: 'Failed to generate personalized recommendations' })
  }
})

// Get trending repositories by language
recommendationsRouter.get('/trending/:language', async (req: Request, res: Response): Promise<void> => {
  try {
    const { language } = req.params
    const { limit = '10' } = req.query

    if (!language) {
      const response: ApiResponse = {
        success: false,
        error: 'Language parameter is required'
      }
      res.status(400).json(response)
      return
    }

    const repositories = await RecommendationService.getRecommendations(
      {
        languages: [language],
        frameworks: [],
        interests: [],
        experienceLevel: 'intermediate'
      },
      {
        minStars: 100,
        hasGoodFirstIssues: false
      }
    )

    const limitedResults = repositories.slice(0, parseInt(limit as string))

    const response: ApiResponse = {
      success: true,
      data: {
        language,
        repositories: limitedResults.map(r => r.repo),
        count: limitedResults.length
      }
    }

    res.json(response)
  } catch (error) {
    console.error(`Error fetching trending ${req.params.language} repositories:`, error)
    const response: ApiResponse = {
      success: false,
      error: 'Failed to fetch trending repositories'
    }
    res.status(500).json(response)
  }
})

// Health check for recommendations service
recommendationsRouter.get('/health', (req: Request, res: Response): void => {
  res.json({
    status: 'ok',
    service: 'recommendations',
    timestamp: new Date().toISOString()
  })
})
