import { FastifyInstance } from 'fastify'
import { sensayRoutes } from './sensayRoutes'
import { authRoutes } from './authRoutes'
import { telegramRoutes } from './telegramRoutes'
import { config } from '../config'

export async function registerRoutes(fastify: FastifyInstance) {
  // Public routes
  fastify.register(authRoutes, { prefix: config.api.prefix })

  // Sensay integration routes (simplified approach)
  fastify.register(sensayRoutes, { prefix: config.api.prefix })

  // Telegram integration routes
  fastify.register(telegramRoutes, { prefix: config.api.prefix })
}
