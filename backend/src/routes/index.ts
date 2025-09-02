import { FastifyInstance } from 'fastify'
import { sensayRoutes } from './sensayRoutes'
import { dataSourceRoutes } from './dataSourceRoutes'
import { config } from '../config'

export async function registerRoutes(fastify: FastifyInstance) {
  fastify.register(sensayRoutes, { prefix: config.api.prefix })
  fastify.register(dataSourceRoutes, { prefix: `${config.api.prefix}/data-sources` })
}
