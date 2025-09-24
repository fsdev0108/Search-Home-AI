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
  
  // File Upload to Knowledge Base (requires auth)
  fastify.post('/replicas/:replicaUUID/upload', { 
    preHandler: [authMiddleware, requireUser] 
  }, sensayController.uploadFileToKnowledgeBase.bind(sensayController))

  // Sync Logs (requires auth)
  fastify.get('/integrations/:integrationId/logs', { 
    preHandler: [authMiddleware, requireUser] 
  }, sensayController.getSyncLogs.bind(sensayController))

  // Debug endpoint to check organization configuration
  fastify.get('/debug/organization', { 
    preHandler: [authMiddleware, requireUser] 
  }, async (request, reply) => {
    try {
      const envOrgSecret = process.env.SENSAY_ORGANIZATION_SECRET
      const envOrgId = process.env.ORGANIZATION_ID

      return reply.send({
        success: true,
        data: {
          environment: process.env.NODE_ENV || 'development',
          hasEnvOrgSecret: !!envOrgSecret,
          hasEnvOrgId: !!envOrgId,
          envOrgSecretPrefix: envOrgSecret ? envOrgSecret.substring(0, 8) + '...' : 'not set',
          envOrgId: envOrgId || 'not set',
          timestamp: new Date().toISOString()
        }
      })
    } catch (error) {
      return reply.status(500).send({
        success: false,
        error: 'Failed to get debug info'
      })
    }
  })
}