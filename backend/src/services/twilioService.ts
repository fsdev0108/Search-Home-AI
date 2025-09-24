import axios from 'axios'
import { SensayApiService } from './sensayApiService'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export class TwilioService {
  private accountSid: string
  private authToken: string
  private phoneNumber: string
  private sensayService: SensayApiService
  private replicaId: string

  constructor(accountSid: string, authToken: string, phoneNumber: string, replicaId: string) {
    this.accountSid = accountSid
    this.authToken = authToken
    this.phoneNumber = phoneNumber
    const envOrgSecret = process.env.SENSAY_ORGANIZATION_SECRET || ''
    this.sensayService = new SensayApiService(envOrgSecret)
    this.replicaId = replicaId
  }

  async sendMessage(to: string, message: string): Promise<boolean> {
    try {
      const auth = Buffer.from(`${this.accountSid}:${this.authToken}`).toString('base64')
      
      const response = await axios.post(
        `https://api.twilio.com/2010-04-01/Accounts/${this.accountSid}/Messages.json`,
        new URLSearchParams({
          From: `whatsapp:${this.phoneNumber}`,
          To: `whatsapp:${to}`,
          Body: message
        }),
        {
          headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      )
      
      return response.status === 201
    } catch (error) {
      console.error('Failed to send WhatsApp message:', error)
      return false
    }
  }

  async processMessage(body: any): Promise<void> {
    try {
      const from = body.From?.replace('whatsapp:', '')
      const message = body.Body
      const messageId = body.MessageSid

      console.log(`📱 WhatsApp message from ${from}: ${message}`)

      if (!message || message.toLowerCase().includes('hello') || message.toLowerCase().includes('hi')) {
        await this.sendMessage(from, "👋 Hello! I'm your real estate assistant. Ask me anything about properties!")
        return
      }

      // Check if this is a join command for specific real estate company
      if (message.toLowerCase().startsWith('join ')) {
        const companyCode = message.toLowerCase().replace('join ', '').trim()
        await this.sendMessage(from, `🏠 Welcome to ${companyCode} real estate! How can I help you find your perfect property?`)
        return
      }

      if (!this.replicaId) {
        await this.sendMessage(from, "I'm not properly configured yet. Please contact support.")
        return
      }

      const replicas = await this.sensayService.getReplicas()
      const currentReplica = replicas.find((r: any) => r.id === this.replicaId || r.uuid === this.replicaId)
      const replicaOwnerID = currentReplica?.ownerID || currentReplica?.owner_uuid

      if (!replicaOwnerID) {
        await this.sendMessage(from, "I'm experiencing technical difficulties. Please try again later.")
        return
      }

      const sensayResponse = await this.sensayService.sendMessage(this.replicaId, {
        message,
        userId: from,
        channel: 'whatsapp',
        replicaOwnerID,
        metadata: { messageId, from }
      })

      if (sensayResponse?.response) {
        await this.sendMessage(from, sensayResponse.response)
      } else {
        await this.sendMessage(from, "I couldn't process your message right now. Please try again later.")
      }

    } catch (error) {
      console.error('Error processing WhatsApp message:', error)
    }
  }

  async processMessageForTwiML(body: any): Promise<string> {
    try {
      const from = body.From?.replace('whatsapp:', '')
      const message = body.Body
      const messageId = body.MessageSid

      console.log(`📱 WhatsApp message from ${from}: ${message}`)

      if (!message || message.toLowerCase().includes('hello') || message.toLowerCase().includes('hi')) {
        return "👋 Hello! I'm your real estate assistant. Ask me anything about properties!"
      }

      // Check if this is a join command for specific real estate company
      if (message.toLowerCase().startsWith('join ')) {
        const companyCode = message.toLowerCase().replace('join ', '').trim()
        return `🏠 Welcome to ${companyCode} real estate! How can I help you find your perfect property?`
      }

      if (!this.replicaId) {
        return "I'm not properly configured yet. Please contact support."
      }

      const replicas = await this.sensayService.getReplicas()
      const currentReplica = replicas.find((r: any) => r.id === this.replicaId || r.uuid === this.replicaId)
      const replicaOwnerID = currentReplica?.ownerID || currentReplica?.owner_uuid
      
      if (!replicaOwnerID) {
        return "I'm not properly configured yet. Please contact support."
      }

      const sensayResponse = await this.sensayService.sendMessage(this.replicaId, {
        message,
        userId: from,
        channel: 'whatsapp',
        replicaOwnerID,
        metadata: { messageId, from }
      })

      if (sensayResponse?.response) {
        return sensayResponse.response
      } else {
        return "I couldn't process your message right now. Please try again later."
      }

    } catch (error) {
      console.error('Error processing WhatsApp message for TwiML:', error)
      return "Sorry, there was an error processing your message."
    }
  }

  static async createTwilioIntegration(integrationId: string, accountSid: string, authToken: string, phoneNumber: string, replicaId: string) {
    try {
      const twilioSettings = await prisma.twilioSettings.upsert({
        where: { integrationId },
        update: {
          accountSid,
          authToken,
          phoneNumber,
          replicaId,
          isActive: false,
          updatedAt: new Date()
        },
        create: {
          integrationId,
          accountSid,
          authToken,
          phoneNumber,
          replicaId,
          isActive: false
        },
        include: { integration: true }
      })

      return twilioSettings
    } catch (error: any) {
      throw new Error(`Failed to create/update Twilio integration: ${error.message}`)
    }
  }

  static async getTwilioService(integrationId: string): Promise<TwilioService | null> {
    try {
      const settings = await prisma.twilioSettings.findFirst({
        where: { integrationId, isActive: true },
        include: { integration: true }
      })

      if (!settings) return null

      return new TwilioService(
        settings.accountSid,
        settings.authToken,
        settings.phoneNumber,
        settings.replicaId || ''
      )
    } catch (error) {
      console.error('Error getting Twilio service:', error)
      return null
    }
  }

  static async configureWebhook(integrationId: string, phoneNumberSid?: string): Promise<boolean> {
    try {
      const accountSid = process.env.TWILIO_ACCOUNT_SID
      const authToken = process.env.TWILIO_AUTH_TOKEN
      
      if (!accountSid || !authToken) {
        throw new Error('Twilio credentials not configured')
      }

      const baseUrl = process.env.RAILWAY_PUBLIC_DOMAIN || 'https://sensay-search-home-ai-production.up.railway.app'
      
      // For WhatsApp Sandbox: Use a single global webhook that routes internally
      // For Production: Each client will have their own phone number and webhook
      const isSandbox = process.env.TWILIO_WHATSAPP_NUMBER === '+14155238886'
      
      if (isSandbox) {
        // Sandbox: Configure single webhook that routes to all integrations
        const webhookUrl = `${baseUrl}/api/v1/twilio/webhook/global`
        
        const auth = Buffer.from(`${accountSid}:${authToken}`).toString('base64')
        
        // For sandbox, we don't need to configure webhook programmatically
        // The webhook URL is already configured in Twilio Console
        // We just need to ensure our endpoint can handle the messages
        console.log(`✅ Sandbox webhook URL: ${webhookUrl}`)
        console.log(`📝 Note: Webhook should be configured in Twilio Console to point to this URL`)
        console.log(`📝 All integrations will use the same sandbox number. Routing will be handled internally.`)
        return true
      } else {
        // Production: Each integration gets its own webhook
        const webhookUrl = `${baseUrl}/api/v1/twilio/webhook/${integrationId}`
        
        if (phoneNumberSid) {
          const auth = Buffer.from(`${accountSid}:${authToken}`).toString('base64')
          
          await axios.post(
            `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/IncomingPhoneNumbers/${phoneNumberSid}.json`,
            new URLSearchParams({
              SmsUrl: webhookUrl,
              SmsMethod: 'POST'
            }),
            {
              headers: {
                'Authorization': `Basic ${auth}`,
                'Content-Type': 'application/x-www-form-urlencoded'
              }
            }
          )
          
          console.log(`✅ Production webhook configured for integration ${integrationId}: ${webhookUrl}`)
          return true
        }
      }

      return false
    } catch (error) {
      console.error('Error configuring webhook:', error)
      return false
    }
  }
}
