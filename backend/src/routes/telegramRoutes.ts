import { FastifyInstance } from 'fastify'
import { TelegramController } from '../controllers/telegramController'
import { authMiddleware, requireUser } from '../middlewares/auth'

export async function telegramRoutes(fastify: FastifyInstance) {
  
  fastify.post('/telegram/test', {
    preHandler: [authMiddleware, requireUser],
    schema: {
      body: {
        type: 'object',
        required: ['botToken'],
        properties: {
          botToken: { type: 'string' }
        }
      }
    }
  }, TelegramController.testBot)

  fastify.post('/telegram/integrations', {
    preHandler: [authMiddleware, requireUser],
    schema: {
      body: {
        type: 'object',
        required: ['integrationId', 'botToken', 'replicaId'],
        properties: {
          integrationId: { type: 'string' },
          botToken: { type: 'string' },
          replicaId: { type: 'string' }
        }
      }
    }
  }, TelegramController.createIntegration)

  fastify.get('/telegram/integrations/:integrationId', {
    preHandler: [authMiddleware, requireUser],
    schema: {
      params: {
        type: 'object',
        properties: {
          integrationId: { type: 'string' }
        }
      }
    }
  }, TelegramController.getIntegration)

  fastify.put('/telegram/integrations/:integrationId', {
    preHandler: [authMiddleware, requireUser],
    schema: {
      params: {
        type: 'object',
        properties: {
          integrationId: { type: 'string' }
        }
      },
      body: {
        type: 'object',
        properties: {
          replicaId: { type: 'string' },
          isActive: { type: 'boolean' }
        }
      }
    }
  }, TelegramController.updateIntegration)

  fastify.post('/telegram/integrations/:integrationId/activate', {
    preHandler: [authMiddleware, requireUser],
    schema: {
      params: {
        type: 'object',
        properties: {
          integrationId: { type: 'string' }
        }
      },
      body: {
        type: 'object',
        required: ['webhookUrl'],
        properties: {
          webhookUrl: { type: 'string' }
        }
      }
    }
  }, TelegramController.activateBot)

  fastify.delete('/telegram/integrations/:integrationId', {
    preHandler: [authMiddleware, requireUser],
    schema: {
      params: {
        type: 'object',
        properties: {
          integrationId: { type: 'string' }
        }
      }
    }
  }, TelegramController.deleteIntegration)

  fastify.post('/telegram/webhook/:botToken', {
    schema: {
      params: {
        type: 'object',
        properties: {
          botToken: { type: 'string' }
        }
      }
    }
  }, TelegramController.handleWebhook)
}
