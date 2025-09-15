import 'dotenv/config'
import Fastify from 'fastify'
import cors from '@fastify/cors'
import helmet from '@fastify/helmet'
import multipart from '@fastify/multipart'
import { config } from './config'
import { errorHandler } from './middlewares/errorHandler'
import { registerRoutes } from './routes'
// Scheduler removed in simplified version

const fastify = Fastify({
  logger: true
})

fastify.register(cors, config.cors)
fastify.register(helmet)
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
    status: 'running'
  }
})

async function start() {
  try {
    await registerRoutes(fastify)
    await fastify.listen({ port: Number(config.port), host: config.host })
    console.log(`Server running on http://${config.host}:${config.port}`)

    // Graceful shutdown
    process.on('SIGINT', () => {
      console.log('Shutting down gracefully...')
      fastify.close(() => {
        console.log('Server closed')
        process.exit(0)
      })
    })
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

start()
