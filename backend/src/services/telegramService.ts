import axios from 'axios'
import { PrismaClient } from '@prisma/client'
import { SensayApiService } from './sensayApiService'

const prisma = new PrismaClient()

export class TelegramService {
  private botToken: string
  private sensayService: SensayApiService
  private replicaId: string

  constructor(botToken: string, organizationSecret: string, replicaId: string) {
    this.botToken = botToken
    this.sensayService = new SensayApiService(organizationSecret)
    this.replicaId = replicaId
  }

  // Setup webhook for bot
  async setWebhook(webhookUrl: string): Promise<boolean> {
    try {
      const response = await axios.post(`https://api.telegram.org/bot${this.botToken}/setWebhook`, {
        url: webhookUrl,
        allowed_updates: ['message', 'callback_query']
      })
      return response.data.ok
    } catch (error) {
      console.error('Failed to set webhook:', error)
      return false
    }
  }

  // Send message to Telegram
  async sendMessage(chatId: string, text: string, replyToMessageId?: number): Promise<boolean> {
    try {
      const payload: any = {
        chat_id: chatId,
        text: text,
        parse_mode: 'Markdown'
      }

      if (replyToMessageId) {
        payload.reply_to_message_id = replyToMessageId
      }

      const response = await axios.post(`https://api.telegram.org/bot${this.botToken}/sendMessage`, payload)
      return response.data.ok
    } catch (error) {
      console.error('Failed to send message:', error)
      return false
    }
  }

  // Process incoming message from Telegram
  async processMessage(update: any): Promise<void> {
    try {
      const message = update.message
      if (!message || !message.text) return

      const chatId = message.chat.id.toString()
      const userId = message.from?.id?.toString()
      const messageText = message.text
      const messageId = message.message_id

      console.log(`📱 Telegram message from ${userId}: ${messageText}`)

      // Send to Sensay for processing
      const sensayResponse = await this.sensayService.sendMessage(this.replicaId, {
        message: messageText,
        userId: userId || chatId,
        channel: 'telegram',
        metadata: {
          chatId,
          messageId,
          username: message.from?.username,
          firstName: message.from?.first_name,
          lastName: message.from?.last_name
        }
      })

      // Send response back to Telegram
      if (sensayResponse?.response) {
        await this.sendMessage(chatId, sensayResponse.response, messageId)
        console.log(`✅ Response sent to Telegram chat ${chatId}`)
      }

    } catch (error) {
      console.error('Error processing Telegram message:', error)
    }
  }

  // Get bot info
  async getBotInfo(): Promise<any> {
    try {
      const response = await axios.get(`https://api.telegram.org/bot${this.botToken}/getMe`)
      return response.data.result
    } catch (error) {
      console.error('Failed to get bot info:', error)
      return null
    }
  }

  // Static methods for managing telegram settings
  static async createTelegramIntegration(integrationId: string, botToken: string, replicaId: string) {
    try {
      // Test bot token first
      const testService = new TelegramService(botToken, '', '')
      const botInfo = await testService.getBotInfo()
      
      if (!botInfo) {
        throw new Error('Invalid bot token')
      }

      // Save to database
      const telegramSettings = await prisma.telegramSettings.create({
        data: {
          integrationId,
          botToken,
          botUsername: botInfo.username,
          replicaId,
          isActive: false // Will be activated after webhook setup
        }
      })

      console.log(`✅ Telegram integration created for bot @${botInfo.username}`)
      return telegramSettings

    } catch (error) {
      console.error('Failed to create Telegram integration:', error)
      throw error
    }
  }

  static async activateTelegramBot(integrationId: string, webhookUrl: string) {
    try {
      const settings = await prisma.telegramSettings.findUnique({
        where: { integrationId },
        include: { integration: true }
      })

      if (!settings) {
        throw new Error('Telegram settings not found')
      }

      const service = new TelegramService(
        settings.botToken,
        settings.integration.organizationSecret,
        settings.replicaId || ''
      )

      // Set webhook
      const webhookSet = await service.setWebhook(webhookUrl)
      if (!webhookSet) {
        throw new Error('Failed to set webhook')
      }

      // Activate bot
      await prisma.telegramSettings.update({
        where: { integrationId },
        data: { isActive: true }
      })

      console.log(`✅ Telegram bot activated for integration ${integrationId}`)
      return true

    } catch (error) {
      console.error('Failed to activate Telegram bot:', error)
      throw error
    }
  }

  static async getTelegramService(integrationId: string): Promise<TelegramService | null> {
    try {
      const settings = await prisma.telegramSettings.findUnique({
        where: { integrationId },
        include: { integration: true }
      })

      if (!settings || !settings.isActive) {
        return null
      }

      return new TelegramService(
        settings.botToken,
        settings.integration.organizationSecret,
        settings.replicaId || ''
      )

    } catch (error) {
      console.error('Failed to get Telegram service:', error)
      return null
    }
  }
}
