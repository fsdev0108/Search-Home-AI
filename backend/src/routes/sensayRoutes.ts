import { FastifyInstance } from 'fastify'
import { SensayController } from '../controllers/sensayController'
import { authMiddleware, requireUser } from '../middlewares/auth'

const sensayController = new SensayController()

export async function sensayRoutes(fastify: FastifyInstance) {
  fastify.post('/integrations', { 
    preHandler: [authMiddleware, requireUser] 
  }, sensayController.createIntegration.bind(sensayController))
  fastify.get('/integrations', { 
    preHandler: [authMiddleware, requireUser] 
  }, sensayController.getIntegrations.bind(sensayController))

  // HubSpot Integration (requires auth)
  fastify.post('/integrations/:integrationId/hubspot/connect', { 
    preHandler: [authMiddleware, requireUser] 
  }, sensayController.connectHubSpot.bind(sensayController))
  fastify.post('/integrations/:integrationId/hubspot/sync', { 
    preHandler: [authMiddleware, requireUser] 
  }, sensayController.syncHubSpotData.bind(sensayController))
  fastify.get('/integrations/:integrationId/hubspot/status', { 
    preHandler: [authMiddleware, requireUser] 
  }, sensayController.getHubSpotStatus.bind(sensayController))

  // User Management (requires auth)
  fastify.post('/integrations/:integrationId/users', { 
    preHandler: [authMiddleware, requireUser] 
  }, sensayController.createUser.bind(sensayController))
  fastify.get('/integrations/:integrationId/users', { 
    preHandler: [authMiddleware, requireUser] 
  }, sensayController.getUsers.bind(sensayController))

  // Replica Management (via Sensay API) - Requires authentication
  fastify.post('/integrations/:integrationId/replicas', { 
    preHandler: [authMiddleware, requireUser] 
  }, sensayController.createReplica.bind(sensayController))
  fastify.get('/integrations/:integrationId/replicas', { 
    preHandler: [authMiddleware, requireUser] 
  }, sensayController.getReplicas.bind(sensayController))

  // Knowledge Base Management (requires auth)
  fastify.get('/replicas/:replicaUUID/knowledge-base', { 
    preHandler: [authMiddleware, requireUser] 
  }, sensayController.getKnowledgeBase.bind(sensayController))
  fastify.get('/replicas/:replicaUUID/knowledge-base/:knowledgeBaseID', { 
    preHandler: [authMiddleware, requireUser] 
  }, sensayController.getKnowledgeBaseEntry.bind(sensayController))
  fastify.delete('/replicas/:replicaUUID/knowledge-base/:knowledgeBaseID', { 
    preHandler: [authMiddleware, requireUser] 
  }, sensayController.deleteKnowledgeBaseEntry.bind(sensayController))

  // Sync Logs (requires auth)
  fastify.get('/integrations/:integrationId/logs', { 
    preHandler: [authMiddleware, requireUser] 
  }, sensayController.getSyncLogs.bind(sensayController))
}