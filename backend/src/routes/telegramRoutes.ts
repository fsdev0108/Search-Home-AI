import { FastifyInstance } from 'fastify'
import { TelegramController } from '../controllers/telegramController'

export async function telegramRoutes(fastify: FastifyInstance) {
  
  // Test bot token
  fastify.post('/telegram/test', {
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

  // Create Telegram integration
  fastify.post('/telegram/integrations', {
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

  // Get Telegram integration
  fastify.get('/telegram/integrations/:integrationId', {
    schema: {
      params: {
        type: 'object',
        properties: {
          integrationId: { type: 'string' }
        }
      }
    }
  }, TelegramController.getIntegration)

  // Update Telegram integration
  fastify.put('/telegram/integrations/:integrationId', {
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

  // Activate bot (set webhook)
  fastify.post('/telegram/integrations/:integrationId/activate', {
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

  // Delete Telegram integration
  fastify.delete('/telegram/integrations/:integrationId', {
    schema: {
      params: {
        type: 'object',
        properties: {
          integrationId: { type: 'string' }
        }
      }
    }
  }, TelegramController.deleteIntegration)

  // Webhook endpoint for Telegram (public, no auth)
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
