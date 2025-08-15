import express from 'express'
import { ContributionAnalysisService } from '../services/contributionAnalysis.js'
import { GitHubService } from '../services/github.js'
import { authenticateToken } from '../middleware/auth.js'
import { getUserAccessToken } from './auth.js'
import axios from 'axios'
import type { ContributionHistory, GitHubUser, JWTPayload } from '../types/index.js'

const router = express.Router()

// GitHub APIを使用してユーザープロファイルを取得するヘルパー関数
async function getUserProfile(token: string): Promise<GitHubUser | null> {
  try {
    const response = await axios.get('https://api.github.com/user', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github+json',
        'User-Agent': 'ContriBuddy-App',
        'X-GitHub-Api-Version': '2022-11-28'
      }
    })
    return response.data
  } catch (error) {
    console.error('Error fetching user profile:', error)
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        status: (error as any).response?.status,
        statusText: (error as any).response?.statusText,
        data: (error as any).response?.data
      })
    }
    return null
  }
}

/**
 * GET /api/contribution-history
 * 現在ログイン中のユーザーの貢献履歴を分析・取得
 */
router.get('/', authenticateToken, async (req, res) => {
  try {
    const user = (req as any).user as JWTPayload

    if (!user) {
      return res.status(401).json({ error: 'User not authenticated' })
    }

    // JWTペイロードからユーザーIDを取得し、GitHubアクセストークンを取得
    const githubAccessToken = getUserAccessToken(user.userId)

    if (!githubAccessToken) {
      return res.status(401).json({ error: 'GitHub access token not found. Please re-authenticate.' })
    }

    // GitHubのユーザー情報を取得
    const userProfile = await getUserProfile(githubAccessToken)

    if (!userProfile) {
      return res.status(404).json({ error: 'GitHub user profile not found' })
    }

    // 貢献履歴を分析
    const contributionHistory = await ContributionAnalysisService.analyzeContributionHistory(githubAccessToken, userProfile.login)

    return res.json({
      success: true,
      data: contributionHistory
    })
  } catch (error) {
    console.error('Error analyzing contribution history:', error)

    if (error instanceof Error) {
      if (error.message.includes('API rate limit')) {
        return res.status(429).json({
          error: 'GitHub API rate limit exceeded. Please try again later.',
          details: error.message
        })
      }

      if (error.message.includes('Not Found')) {
        return res.status(404).json({
          error: 'User or repository not found',
          details: error.message
        })
      }
    }

    return res.status(500).json({
      error: 'Failed to analyze contribution history',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

/**
 * GET /api/contribution-history/:username
 * 指定されたユーザーの貢献履歴を分析・取得（パブリック情報のみ）
 */
router.get('/:username', authenticateToken, async (req, res) => {
  try {
    const { username } = req.params
    const user = (req as any).user as JWTPayload

    if (!user) {
      return res.status(401).json({ error: 'User not authenticated' })
    }

    // JWTペイロードからユーザーIDを取得し、GitHubアクセストークンを取得
    const githubAccessToken = getUserAccessToken(user.userId)

    if (!githubAccessToken) {
      return res.status(401).json({ error: 'GitHub access token not found. Please re-authenticate.' })
    }

    // 貢献履歴を分析
    const contributionHistory = await ContributionAnalysisService.analyzeContributionHistory(githubAccessToken, username)

    return res.json({
      success: true,
      data: contributionHistory
    })
  } catch (error) {
    console.error(`Error analyzing contribution history for ${req.params.username}:`, error)

    if (error instanceof Error) {
      if (error.message.includes('API rate limit')) {
        return res.status(429).json({
          error: 'GitHub API rate limit exceeded. Please try again later.',
          details: error.message
        })
      }

      if (error.message.includes('Not Found')) {
        return res.status(404).json({
          error: 'User not found',
          details: error.message
        })
      }
    }

    return res.status(500).json({
      error: 'Failed to analyze contribution history',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

/**
 * GET /api/contribution-history/stats/summary
 * 現在ログイン中のユーザーの貢献統計サマリーを取得
 */
router.get('/stats/summary', authenticateToken, async (req, res) => {
  try {
    const user = (req as any).user as JWTPayload

    if (!user) {
      return res.status(401).json({ error: 'User not authenticated' })
    }

    // JWTペイロードからユーザーIDを取得し、GitHubアクセストークンを取得
    const githubAccessToken = getUserAccessToken(user.userId)

    if (!githubAccessToken) {
      return res.status(401).json({ error: 'GitHub access token not found. Please re-authenticate.' })
    }

    const userProfile = await getUserProfile(githubAccessToken)

    if (!userProfile) {
      return res.status(404).json({ error: 'GitHub user profile not found' })
    }

    const contributionHistory = await ContributionAnalysisService.analyzeContributionHistory(githubAccessToken, userProfile.login)

    // サマリー情報のみを返す
    return res.json({
      success: true,
      data: {
        username: contributionHistory.username,
        analyzedAt: contributionHistory.analyzedAt,
        summary: contributionHistory.summary,
        stats: {
          topLanguages: contributionHistory.stats.topLanguages.slice(0, 5),
          topRepositories: contributionHistory.stats.topRepositories.slice(0, 5),
          monthlyActivity: contributionHistory.stats.monthlyActivity.slice(-6), // 直近6ヶ月
          totalAdditions: contributionHistory.stats.totalAdditions,
          totalDeletions: contributionHistory.stats.totalDeletions,
          contributionStreak: contributionHistory.stats.contributionStreak,
          firstContribution: contributionHistory.stats.firstContribution,
          mostActiveRepository: contributionHistory.stats.mostActiveRepository
        }
      }
    })
  } catch (error) {
    console.error('Error getting contribution summary:', error)

    if (error instanceof Error) {
      if (error.message.includes('API rate limit')) {
        return res.status(429).json({
          error: 'GitHub API rate limit exceeded. Please try again later.',
          details: error.message
        })
      }
    }

    return res.status(500).json({
      error: 'Failed to get contribution summary',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

export default router
