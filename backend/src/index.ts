import 'dotenv/config'
import Fastify from 'fastify'
import cors from '@fastify/cors'
import helmet from '@fastify/helmet'
import multipart from '@fastify/multipart'
import { config } from './config'
import { errorHandler } from './middlewares/errorHandler'
import { registerRoutes } from './routes'
import { InitializationService } from './services/initializationService'
// Scheduler removed in simplified version

const fastify = Fastify({
  logger: true
})

fastify.register(cors, {
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Origin', 'Accept']
})
fastify.register(helmet, {
  crossOriginResourcePolicy: { policy: "cross-origin" }
})
fastify.register(multipart, {
  limits: {
    fileSize: config.upload.maxFileSize
  }
})

fastify.setErrorHandler(errorHandler)

fastify.get('/', async (request, reply) => {
  return { 
    message: 'Real Estate AI Agent API',
    version: '1.0.0',
    status: 'running',
    timestamp: new Date().toISOString()
  }
})

fastify.get('/health', async (request, reply) => {
  return { 
    status: 'ok',
    timestamp: new Date().toISOString()
  }
})

async function start() {
  try {
    console.log('🚀 Starting server...')
    
    // Register routes first
    await registerRoutes(fastify)
    console.log('✅ Routes registered')
    
    // Start server
    const port = process.env.PORT || config.port
    const host = process.env.NODE_ENV === 'production' ? '0.0.0.0' : config.host
    
    await fastify.listen({ port: Number(port), host })
    console.log(`✅ Server running on ${host}:${port}`)
    console.log(`📍 API available at: /api/v1`)
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`)

    // Initialize after server is running (don't block startup)
    if (process.env.SENSAY_ORGANIZATION_SECRET) {
      setTimeout(async () => {
        try {
          console.log('🔧 Starting initialization...')
          await InitializationService.initialize()
          console.log('✅ Initialization completed')
        } catch (err: any) {
          console.log('⚠️ Initialization failed:', err.message)
          console.log('📝 Server continues running without initialization')
        }
      }, 2000)
    } else {
      console.log('⚠️ SENSAY_ORGANIZATION_SECRET not found, skipping initialization')
    }

    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('📴 Received SIGTERM, shutting down gracefully...')
      fastify.close(() => {
        console.log('✅ Server closed')
        process.exit(0)
      })
    })

    process.on('SIGINT', () => {
      console.log('📴 Received SIGINT, shutting down gracefully...')
      fastify.close(() => {
        console.log('✅ Server closed')
        process.exit(0)
      })
    })

  } catch (err: any) {
    console.error('❌ Failed to start server:', err.message)
    console.error('Stack:', err.stack)
    process.exit(1)
  }
}

start()
