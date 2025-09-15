import { FastifyInstance } from 'fastify'
import { sensayRoutes } from './sensayRoutes'
import { authRoutes } from './authRoutes'
import { config } from '../config'

export async function registerRoutes(fastify: FastifyInstance) {
  // Public routes
  fastify.register(authRoutes, { prefix: config.api.prefix })

  // Sensay integration routes (simplified approach)
  fastify.register(sensayRoutes, { prefix: config.api.prefix })
}
