import { FastifyInstance } from 'fastify'
import { TwilioController } from '../controllers/twilioController'
import { authMiddleware, requireUser } from '../middlewares/auth'

export async function twilioRoutes(fastify: FastifyInstance) {
  
  fastify.get('/twilio/test-server', {
    preHandler: [authMiddleware, requireUser]
  }, TwilioController.testServerCredentials)
  
  fastify.get('/twilio/integrations/:integrationId', {
    preHandler: [authMiddleware, requireUser],
    schema: {
      params: {
        type: 'object',
        properties: {
          integrationId: { type: 'string' }
        }
      }
    }
  }, TwilioController.getIntegration)

  fastify.post('/twilio/integrations', {
    preHandler: [authMiddleware, requireUser],
    schema: {
      body: {
        type: 'object',
        required: ['integrationId', 'replicaId'],
        properties: {
          integrationId: { type: 'string' },
          replicaId: { type: 'string' }
        }
      }
    }
  }, TwilioController.createIntegration)

  fastify.get('/twilio/integrations/:integrationId/activate', {
    preHandler: [authMiddleware, requireUser],
    schema: {
      params: {
        type: 'object',
        properties: {
          integrationId: { type: 'string' }
        }
      }
    }
  }, TwilioController.activateIntegration)

  fastify.post('/twilio/webhook/:integrationId', TwilioController.handleWebhook)
  fastify.post('/twilio/webhook/global', TwilioController.handleWebhook)

  fastify.delete('/twilio/integrations/:integrationId', {
    preHandler: [authMiddleware, requireUser],
    schema: {
      params: {
        type: 'object',
        properties: {
          integrationId: { type: 'string' }
        }
      }
    }
  }, TwilioController.deleteIntegration)
}
