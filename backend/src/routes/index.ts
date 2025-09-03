import { FastifyInstance } from 'fastify'
import { sensayRoutes } from './sensayRoutes'
import { dataSourceRoutes } from './dataSourceRoutes'
import { userRoutes } from './userRoutes'
import { authRoutes } from './authRoutes'
import { authMiddleware, requireAdmin } from '../middlewares/auth'
import { config } from '../config'

export async function registerRoutes(fastify: FastifyInstance) {
  // Rotas públicas
  fastify.register(authRoutes, { prefix: config.api.prefix })
  
  // Rotas protegidas
  fastify.register(async function (fastify) {
    fastify.addHook('preHandler', authMiddleware)
    
    // Rotas que requerem autenticação
    fastify.register(sensayRoutes, { prefix: config.api.prefix })
    fastify.register(dataSourceRoutes, { prefix: `${config.api.prefix}/data-sources` })
    
    // Rotas que requerem role admin
    fastify.register(async function (fastify) {
      fastify.addHook('preHandler', requireAdmin)
      fastify.register(userRoutes, { prefix: config.api.prefix })
    })
  })
}
