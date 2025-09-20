import { FastifyInstance } from 'fastify'
import { TwilioController } from '../controllers/twilioController'
import { authMiddleware, requireUser } from '../middlewares/auth'

export async function twilioRoutes(fastify: FastifyInstance) {
  
  fastify.post('/twilio/integrations', {
    preHandler: [authMiddleware, requireUser],
    schema: {
      body: {
        type: 'object',
        required: ['integrationId', 'accountSid', 'authToken', 'phoneNumber', 'replicaId'],
        properties: {
          integrationId: { type: 'string' },
          accountSid: { type: 'string' },
          authToken: { type: 'string' },
          phoneNumber: { type: 'string' },
          replicaId: { type: 'string' }
        }
      }
    }
  }, TwilioController.createIntegration)

  fastify.post('/twilio/integrations/:integrationId/activate', {
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

  fastify.post('/twilio/webhook/:integrationId', {
    schema: {
      params: {
        type: 'object',
        properties: {
          integrationId: { type: 'string' }
        }
      }
    }
  }, TwilioController.handleWebhook)

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
