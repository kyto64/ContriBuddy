import { Router } from 'express'
import { GitHubService } from '../services/github.js'
import type { Request, Response } from 'express'
import type { ApiResponse, SearchFilters } from '../types/index.js'

export const githubRouter = Router()

// Search repositories
githubRouter.get('/repositories/search', async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      language,
      minStars,
      maxStars,
      hasGoodFirstIssues,
      topics
    } = req.query

    const filters: SearchFilters = {}

    if (language) {
      filters.language = language as string
    }
    if (minStars) {
      filters.minStars = parseInt(minStars as string)
    }
    if (maxStars) {
      filters.maxStars = parseInt(maxStars as string)
    }
    if (hasGoodFirstIssues !== undefined) {
      filters.hasGoodFirstIssues = hasGoodFirstIssues === 'true'
    }
    if (topics) {
      filters.topics = (topics as string).split(',')
    }

    const repositories = await GitHubService.searchRepositories(filters)

    const response: ApiResponse = {
      success: true,
      data: {
        repositories,
        count: repositories.length
      }
    }

    res.json(response)
  } catch (error) {
    console.error('Error searching repositories:', error)
    const response: ApiResponse = {
      success: false,
      error: 'Failed to search repositories'
    }
    res.status(500).json(response)
  }
})

// Get repository details
githubRouter.get('/repositories/:owner/:repo', async (req: Request, res: Response): Promise<void> => {
  try {
    const { owner, repo } = req.params

    if (!owner || !repo) {
      const response: ApiResponse = {
        success: false,
        error: 'Owner and repository name are required'
      }
      res.status(400).json(response)
      return
    }

    const repository = await GitHubService.getRepositoryDetails(owner, repo)

    const response: ApiResponse = {
      success: true,
      data: repository
    }

    res.json(response)
  } catch (error) {
    console.error(`Error fetching repository ${req.params.owner}/${req.params.repo}:`, error)
    const response: ApiResponse = {
      success: false,
      error: 'Failed to fetch repository details'
    }
    res.status(500).json(response)
  }
})

// Get repository issues
githubRouter.get('/repositories/:owner/:repo/issues', async (req: Request, res: Response): Promise<void> => {
  try {
    const { owner, repo } = req.params
    const { labels } = req.query

    if (!owner || !repo) {
      const response: ApiResponse = {
        success: false,
        error: 'Owner and repository name are required'
      }
      res.status(400).json(response)
      return
    }

    const labelsArray = labels ? (labels as string).split(',') : undefined
    const issues = await GitHubService.getRepositoryIssues(owner, repo, labelsArray)

    const response: ApiResponse = {
      success: true,
      data: {
        issues,
        count: issues.length
      }
    }

    res.json(response)
  } catch (error) {
    console.error(`Error fetching issues for ${req.params.owner}/${req.params.repo}:`, error)
    const response: ApiResponse = {
      success: false,
      error: 'Failed to fetch repository issues'
    }
    res.status(500).json(response)
  }
})

// Get good first issues
githubRouter.get('/repositories/:owner/:repo/good-first-issues', async (req: Request, res: Response): Promise<void> => {
  try {
    const { owner, repo } = req.params

    if (!owner || !repo) {
      const response: ApiResponse = {
        success: false,
        error: 'Owner and repository name are required'
      }
      res.status(400).json(response)
      return
    }

    const issues = await GitHubService.getGoodFirstIssues(owner, repo)

    const response: ApiResponse = {
      success: true,
      data: {
        issues,
        count: issues.length
      }
    }

    res.json(response)
  } catch (error) {
    console.error(`Error fetching good first issues for ${req.params.owner}/${req.params.repo}:`, error)
    const response: ApiResponse = {
      success: false,
      error: 'Failed to fetch good first issues'
    }
    res.status(500).json(response)
  }
})
