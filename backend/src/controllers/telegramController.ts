import { FastifyRequest, FastifyReply } from 'fastify'
import { PrismaClient } from '@prisma/client'
import { TelegramService } from '../services/telegramService'
import { ResponseHandler } from '../utils/response'

const prisma = new PrismaClient()

export class TelegramController {
  
  // Create Telegram integration
  static async createIntegration(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { integrationId, botToken, replicaId } = request.body as any

      if (!integrationId || !botToken || !replicaId) {
        return ResponseHandler.error(reply, 'Missing required fields: integrationId, botToken, replicaId', 400)
      }

      const telegramSettings = await TelegramService.createTelegramIntegration(
        integrationId, 
        botToken, 
        replicaId
      )

      return ResponseHandler.success(reply, {
        id: telegramSettings.id,
        botUsername: telegramSettings.botUsername,
        isActive: telegramSettings.isActive
      }, 'Telegram integration created successfully')

    } catch (error: any) {
      console.error('Error creating Telegram integration:', error)
      return ResponseHandler.error(reply, error.message, 500)
    }
  }

  // Activate Telegram bot (set webhook)
  static async activateBot(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { integrationId } = request.params as any
      const { webhookUrl } = request.body as any

      if (!webhookUrl) {
        return ResponseHandler.error(reply, 'Webhook URL is required', 400)
      }

      await TelegramService.activateTelegramBot(integrationId, webhookUrl)

      return ResponseHandler.success(reply, {}, 'Telegram bot activated successfully')

    } catch (error: any) {
      console.error('Error activating Telegram bot:', error)
      return ResponseHandler.error(reply, error.message, 500)
    }
  }

  // Get Telegram integration status
  static async getIntegration(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { integrationId } = request.params as any

      const settings = await prisma.telegramSettings.findUnique({
        where: { integrationId },
        select: {
          id: true,
          botUsername: true,
          isActive: true,
          replicaId: true,
          createdAt: true,
          updatedAt: true
        }
      })

      if (!settings) {
        return ResponseHandler.error(reply, 'Telegram integration not found', 404)
      }

      return ResponseHandler.success(reply, { data: settings })

    } catch (error: any) {
      console.error('Error getting Telegram integration:', error)
      return ResponseHandler.error(reply, error.message, 500)
    }
  }

  // Update Telegram integration
  static async updateIntegration(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { integrationId } = request.params as any
      const { replicaId, isActive } = request.body as any

      const updateData: any = {}
      if (replicaId !== undefined) updateData.replicaId = replicaId
      if (isActive !== undefined) updateData.isActive = isActive

      const settings = await prisma.telegramSettings.update({
        where: { integrationId },
        data: updateData,
        select: {
          id: true,
          botUsername: true,
          isActive: true,
          replicaId: true,
          updatedAt: true
        }
      })

      return ResponseHandler.success(reply, {
        message: 'Telegram integration updated successfully',
        data: settings
      })

    } catch (error: any) {
      console.error('Error updating Telegram integration:', error)
      return ResponseHandler.error(reply, error.message, 500)
    }
  }

  // Delete Telegram integration
  static async deleteIntegration(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { integrationId } = request.params as any

      await prisma.telegramSettings.delete({
        where: { integrationId }
      })

      return ResponseHandler.success(reply, {
        message: 'Telegram integration deleted successfully'
      })

    } catch (error: any) {
      console.error('Error deleting Telegram integration:', error)
      return ResponseHandler.error(reply, error.message, 500)
    }
  }

  // Webhook handler for Telegram updates
  static async handleWebhook(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { botToken } = request.params as any
      const update = request.body

      // Find the integration by bot token
      const settings = await prisma.telegramSettings.findFirst({
        where: { botToken, isActive: true },
        include: { integration: true }
      })

      if (!settings) {
        console.log(`⚠️ No active Telegram integration found for bot token`)
        return reply.code(200).send('OK')
      }

      // Get Telegram service and process message
      const telegramService = new TelegramService(
        settings.botToken,
        settings.integration.organizationSecret,
        settings.replicaId || ''
      )

      await telegramService.processMessage(update)

      return reply.code(200).send('OK')

    } catch (error: any) {
      console.error('Error handling Telegram webhook:', error)
      return reply.code(200).send('OK') // Always return OK to Telegram
    }
  }

  // Test bot connection
  static async testBot(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { botToken } = request.body as any

      if (!botToken) {
        return ResponseHandler.error(reply, 'Bot token is required', 400)
      }

      const testService = new TelegramService(botToken, '', '')
      const botInfo = await testService.getBotInfo()

      if (!botInfo) {
        return ResponseHandler.error(reply, 'Invalid bot token', 400)
      }

      return ResponseHandler.success(reply, {
        message: 'Bot token is valid',
        data: {
          id: botInfo.id,
          username: botInfo.username,
          firstName: botInfo.first_name,
          canJoinGroups: botInfo.can_join_groups,
          canReadAllGroupMessages: botInfo.can_read_all_group_messages,
          supportsInlineQueries: botInfo.supports_inline_queries
        }
      })

    } catch (error: any) {
      console.error('Error testing bot:', error)
      return ResponseHandler.error(reply, error.message, 500)
    }
  }
}
