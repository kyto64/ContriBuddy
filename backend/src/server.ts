import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import dotenv from 'dotenv'
import { githubRouter } from './routes/github.js'
import { recommendationsRouter } from './routes/recommendations.js'
import { errorHandler } from './middleware/errorHandler.js'

// Load environment variables based on NODE_ENV
const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env'
dotenv.config({ path: envFile })

// Also try to load from .env as fallback
dotenv.config()

const app = express()
const PORT = Number(process.env.PORT) || 3001

// Middleware
app.use(helmet())
app.use(compression())

// CORS configuration
const allowedOrigins = [
  process.env.SERVICE_URL,
  'https://contribhub.fly.dev', // Production frontend URL
  'http://localhost:5173', // Vite dev server
  'http://localhost:3000', // Alternative dev port
].filter(Boolean)

// Debug logging
console.log('Environment file used:', envFile)
console.log('Environment variables:')
console.log('SERVICE_URL:', process.env.SERVICE_URL)
console.log('NODE_ENV:', process.env.NODE_ENV)
console.log('PORT:', process.env.PORT)
console.log('All environment variables:', Object.keys(process.env).filter(key => key.startsWith('SERVICE_') || key.startsWith('NODE_') || key.startsWith('PORT')))
console.log('Allowed origins:', allowedOrigins)

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
app.use('/api/github', githubRouter)
app.use('/api/recommendations', recommendationsRouter)

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
