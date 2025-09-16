import { FastifyInstance } from 'fastify'
import { SensayController } from '../controllers/sensayController'

const sensayController = new SensayController()

export async function sensayRoutes(fastify: FastifyInstance) {
  // Integration Management
  fastify.post('/integrations', sensayController.createIntegration.bind(sensayController))
  fastify.get('/integrations', sensayController.getIntegrations.bind(sensayController))

  // HubSpot Integration
  fastify.post('/integrations/:integrationId/hubspot/connect', sensayController.connectHubSpot.bind(sensayController))
  fastify.post('/integrations/:integrationId/hubspot/sync', sensayController.syncHubSpotData.bind(sensayController))
  fastify.get('/integrations/:integrationId/hubspot/status', sensayController.getHubSpotStatus.bind(sensayController))

  // User Management (via Sensay API)
  fastify.post('/integrations/:integrationId/users', sensayController.createUser.bind(sensayController))
  fastify.get('/integrations/:integrationId/users', sensayController.getUsers.bind(sensayController))

  // Replica Management (via Sensay API)
  fastify.post('/integrations/:integrationId/replicas', sensayController.createReplica.bind(sensayController))
  fastify.get('/integrations/:integrationId/replicas', sensayController.getReplicas.bind(sensayController))

  // Knowledge Base Management (via Sensay API)
  fastify.get('/replicas/:replicaUUID/knowledge-base', sensayController.getKnowledgeBase.bind(sensayController))
  fastify.get('/replicas/:replicaUUID/knowledge-base/:knowledgeBaseID', sensayController.getKnowledgeBaseEntry.bind(sensayController))

  // Sync Logs
  fastify.get('/integrations/:integrationId/logs', sensayController.getSyncLogs.bind(sensayController))
}