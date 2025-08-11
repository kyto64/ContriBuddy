import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import dotenv from 'dotenv'
import { githubRouter } from './routes/github.js'
import { recommendationsRouter } from './routes/recommendations.js'
import { authRouter } from './routes/auth.js'
import { skillsRouter } from './routes/skills.js'
import { errorHandler } from './middleware/errorHandler.js'

// Load environment variables based on NODE_ENV
const env = process.env.NODE_ENV || 'development'
dotenv.config({ path: `.env.${env}` })

// Also try to load from .env as fallback
dotenv.config()

const app = express()
const PORT = Number(process.env.PORT) || 3001

// Middleware
app.use(helmet())
app.use(compression())

// CORS configuration
const allowedOrigins = [
  // ALLOWED_ORIGINS is a comma-separated list of allowed origins
  ...(process.env.ALLOWED_ORIGINS?.split(',') || []),
].filter(Boolean)

app.use(cors({
  origin: (origin, callback) => {
    // Log all requests for debugging
    console.log(`CORS request from origin: ${origin}`)

    // Allow requests with no origin (mobile apps, etc.)
    if (!origin) {
      console.log('Allowing request with no origin')
      return callback(null, true)
    }

    if (allowedOrigins.includes(origin)) {
      console.log(`Allowing origin: ${origin}`)
      return callback(null, true)
    }

    // Log the rejected origin for debugging
    console.log(`CORS rejected origin: ${origin}`)
    console.log(`Allowed origins: ${allowedOrigins.join(', ')}`)

    return callback(new Error('Not allowed by CORS'))
  },
  credentials: true
}))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// API Routes
app.use('/api/auth', authRouter)
app.use('/api/github', githubRouter)
app.use('/api/recommendations', recommendationsRouter)
app.use('/api/skills', skillsRouter)

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' })
})

// Error handler
app.use(errorHandler)

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on 0.0.0.0:${PORT}`)
  console.log(`📊 Health check: http://localhost:${PORT}/health`)
})
