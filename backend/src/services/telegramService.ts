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
      console.log('📱 Received Telegram update:', JSON.stringify(update, null, 2))

      const message = update.message
      if (!message || !message.text) {
        console.log('⚠️ No message or text found in update')
        return
      }

      const chatId = message.chat.id.toString()
      const userId = message.from?.id?.toString()
      const messageText = message.text
      const messageId = message.message_id

      console.log(`📱 Telegram message from ${userId} (${message.from?.first_name}): ${messageText}`)

      // Handle special commands
      if (messageText === '/start') {
        const welcomeMessage = "👋 Hello! I'm your real estate assistant. Ask me anything about properties, locations, or real estate services!"
        await this.sendMessage(chatId, welcomeMessage, messageId)
        console.log(`✅ Welcome message sent to chat ${chatId}`)
        return
      }

      // Check if replicaId is configured
      if (!this.replicaId) {
        console.error('❌ No replica ID configured for this bot')
        await this.sendMessage(chatId, "I'm sorry, but I'm not properly configured yet. Please contact support.", messageId)
        return
      }

      // Get replica owner for authentication
      console.log(`🔍 Getting replica owner for ${this.replicaId}`)
      const replicas = await this.sensayService.getReplicas()
      const currentReplica = replicas.find((r: any) => r.id === this.replicaId || r.uuid === this.replicaId)
      const replicaOwnerID = currentReplica?.ownerID || currentReplica?.owner_uuid
      
      console.log(`👤 Replica owner ID: ${replicaOwnerID}`)

      // Send to Sensay for processing
      console.log(`🤖 Sending to Sensay replica ${this.replicaId}:`, messageText)
      const sensayResponse = await this.sensayService.sendMessage(this.replicaId, {
        message: messageText,
        userId: userId || chatId,
        channel: 'telegram',
        replicaOwnerID: replicaOwnerID, // Add dynamic owner ID
        metadata: {
          chatId,
          messageId,
          username: message.from?.username,
          firstName: message.from?.first_name,
          lastName: message.from?.last_name
        }
      })

      console.log('🤖 Sensay response:', sensayResponse)

      // Send response back to Telegram
      if (sensayResponse?.response) {
        await this.sendMessage(chatId, sensayResponse.response, messageId)
        console.log(`✅ Response sent to Telegram chat ${chatId}`)
      } else {
        console.log('⚠️ No response from Sensay')
        await this.sendMessage(chatId, "I'm sorry, I couldn't process your message right now. Please try again later.", messageId)
      }

    } catch (error) {
      console.error('Error processing Telegram message:', error)
      
      // Try to send error message to user
      try {
        const message = update.message
        if (message) {
          const chatId = message.chat.id.toString()
          const messageId = message.message_id
          await this.sendMessage(chatId, "I'm experiencing technical difficulties. Please try again later.", messageId)
        }
      } catch (sendError) {
        console.error('Failed to send error message:', sendError)
      }
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
