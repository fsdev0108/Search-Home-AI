import { FastifyRequest, FastifyReply } from 'fastify'
import { TwilioService } from '../services/twilioService'
import { ResponseHandler } from '../utils/response'
import { PrismaClient } from '@prisma/client'
import axios from 'axios'
import twilio from 'twilio'

const prisma = new PrismaClient()

export class TwilioController {
  
  static async testServerCredentials(request: FastifyRequest, reply: FastifyReply) {
    try {
      const accountSid = process.env.TWILIO_ACCOUNT_SID
      const authToken = process.env.TWILIO_AUTH_TOKEN

      console.log('🔍 Checking Twilio credentials:')
      console.log('TWILIO_ACCOUNT_SID:', accountSid ? '✅ Set' : '❌ Missing')
      console.log('TWILIO_AUTH_TOKEN:', authToken ? '✅ Set' : '❌ Missing')

      if (!accountSid || !authToken) {
        const missing = []
        if (!accountSid) missing.push('TWILIO_ACCOUNT_SID')
        if (!authToken) missing.push('TWILIO_AUTH_TOKEN')
        
        return ResponseHandler.error(reply, `Missing environment variables: ${missing.join(', ')}`, 500)
      }

      const auth = Buffer.from(`${accountSid}:${authToken}`).toString('base64')
      
      const response = await axios.get(
        `https://api.twilio.com/2010-04-01/Accounts/${accountSid}.json`,
        {
          headers: {
            'Authorization': `Basic ${auth}`
          }
        }
      )

      if (response.status === 200) {
        return ResponseHandler.success(reply, {
          accountName: response.data.friendly_name,
          status: response.data.status,
          phoneNumber: process.env.TWILIO_WHATSAPP_NUMBER || '+14155238886'
        }, 'Server Twilio credentials are valid')
      } else {
        return ResponseHandler.error(reply, 'Invalid server credentials', 401)
      }

    } catch (error: any) {
      console.error('Error testing server Twilio credentials:', error)
      
      if (error.response?.status === 404) {
        return ResponseHandler.error(reply, 'Account SID not found. Please check if you are using the correct Account SID (starts with AC) instead of API Key SID (starts with SK)', 401)
      }
      
      if (error.response?.status === 401) {
        return ResponseHandler.error(reply, 'Invalid credentials. Please check your Account SID and Auth Token', 401)
      }
      
      return ResponseHandler.error(reply, `Twilio API error: ${error.response?.status || 'Unknown error'}`, 401)
    }
  }

  static async getIntegration(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { integrationId } = request.params as { integrationId: string }

      const twilioSettings = await prisma.twilioSettings.findFirst({
        where: { integrationId },
        include: { integration: true }
      })

      if (!twilioSettings) {
        return ResponseHandler.error(reply, 'Twilio integration not found', 404)
      }

      return ResponseHandler.success(reply, {
        id: twilioSettings.id,
        integrationId: twilioSettings.integrationId,
        phoneNumber: twilioSettings.phoneNumber,
        isActive: twilioSettings.isActive,
        replicaId: twilioSettings.replicaId,
        createdAt: twilioSettings.createdAt,
        updatedAt: twilioSettings.updatedAt
      }, 'Twilio integration retrieved successfully')

    } catch (error: any) {
      console.error('Error getting Twilio integration:', error)
      return ResponseHandler.error(reply, 'Failed to get Twilio integration', 500)
    }
  }
  
  static async createIntegration(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { integrationId, replicaId } = request.body as any

      if (!integrationId || !replicaId) {
        return ResponseHandler.error(reply, 'Missing required fields', 400)
      }

      // For MVP: using server credentials
      const accountSid = process.env.TWILIO_ACCOUNT_SID
      const authToken = process.env.TWILIO_AUTH_TOKEN
      const phoneNumber = process.env.TWILIO_WHATSAPP_NUMBER || '+14155238886'

      if (!accountSid || !authToken) {
        return ResponseHandler.error(reply, 'Twilio credentials not configured on server', 500)
      }

      const twilioSettings = await TwilioService.createTwilioIntegration(
        integrationId,
        accountSid,
        authToken,
        phoneNumber,
        replicaId
      )

      return ResponseHandler.success(reply, {
        id: twilioSettings.id,
        phoneNumber: twilioSettings.phoneNumber,
        isActive: twilioSettings.isActive
      }, 'WhatsApp integration created successfully! Using server credentials.')

    } catch (error: any) {
      console.error('Error creating Twilio integration:', error)
      return ResponseHandler.error(reply, error.message, 500)
    }
  }

  static async activateIntegration(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { integrationId } = request.params as { integrationId: string }

      // Configure webhook programmatically
      const webhookConfigured = await TwilioService.configureWebhook(integrationId)
      
      if (!webhookConfigured) {
        return ResponseHandler.error(reply, 'Failed to configure webhook. Please check Twilio settings.', 500)
      }

      // Deactivate all other integrations first (only one active at a time)
      await prisma.twilioSettings.updateMany({
        where: { isActive: true },
        data: { isActive: false }
      })

      // Activate the current integration
      await prisma.twilioSettings.updateMany({
        where: { integrationId },
        data: { isActive: true }
      })

      return ResponseHandler.success(reply, { 
        isActive: true,
        webhookUrl: `${process.env.RAILWAY_PUBLIC_DOMAIN || 'https://sensay-search-home-ai-production.up.railway.app'}/api/v1/twilio/webhook/${integrationId}`
      }, 'WhatsApp integration activated successfully! Webhook configured automatically.')

    } catch (error: any) {
      console.error('Error activating Twilio integration:', error)
      return ResponseHandler.error(reply, error.message, 500)
    }
  }

  static async handleWebhook(request: FastifyRequest, reply: FastifyReply) {
    try {
      const body = request.body as any
      const { integrationId } = request.params as { integrationId: string }

      console.log('📨 Twilio webhook received:', JSON.stringify(body, null, 2))

      // Create TwiML response
      const twiml = new twilio.twiml.MessagingResponse()

      if (integrationId === 'test-integration') {
        console.log('🧪 Test webhook - echoing message back')
        const message = body.Body || 'Hello!'
        
        // Add message to TwiML response
        twiml.message(`Echo: ${message} ✅`)
        
        // Set proper headers for TwiML
        reply.type('text/xml')
        return reply.status(200).send(twiml.toString())
      }

      if (integrationId === 'global') {
        // Global webhook for sandbox - route to appropriate integration
        return await this.handleGlobalWebhook(body, reply)
      }

      const twilioService = await TwilioService.getTwilioService(integrationId)
      
      if (twilioService) {
        // Process message and get response
        const responseText = await twilioService.processMessageForTwiML(body)
        if (responseText) {
          twiml.message(responseText)
        } else {
          twiml.message('Thank you for your message!')
        }
      } else {
        console.log(`⚠️  No Twilio service found for integration: ${integrationId}`)
        twiml.message('Service temporarily unavailable. Please try again later.')
      }

      // Set proper headers for TwiML
      reply.type('text/xml')
      return reply.status(200).send(twiml.toString())

    } catch (error) {
      console.error('Error handling Twilio webhook:', error)
      
      // Return error TwiML response
      const twiml = new twilio.twiml.MessagingResponse()
      twiml.message('Sorry, there was an error processing your message.')
      
      reply.type('text/xml')
      return reply.status(200).send(twiml.toString())
    }
  }

  static async handleGlobalWebhook(body: any, reply: FastifyReply) {
    try {
      const twiml = new twilio.twiml.MessagingResponse()
      const from = body.From?.replace('whatsapp:', '')
      const message = body.Body

      console.log(`🌐 Global webhook - message from ${from}: ${message}`)

      // For sandbox: only one integration can be active at a time
      const activeIntegration = await prisma.twilioSettings.findFirst({
        where: { isActive: true },
        include: { integration: true }
      })

      if (!activeIntegration) {
        console.log(`❌ No active integration found`)
        twiml.message('No active integration found. Please contact support.')
        reply.type('text/xml')
        return reply.status(200).send(twiml.toString())
      }

      console.log(`✅ Using active integration: ${activeIntegration.integration.organizationName}`)
      console.log(`🔧 Integration details:`, {
        accountSid: activeIntegration.accountSid?.substring(0, 8) + '...',
        phoneNumber: activeIntegration.phoneNumber,
        replicaId: activeIntegration.replicaId,
        isActive: activeIntegration.isActive
      })

      const integration = activeIntegration
      const twilioService = new TwilioService(
        integration.accountSid,
        integration.authToken,
        integration.phoneNumber,
        integration.replicaId || ''
      )

      console.log(`🤖 Processing message with TwilioService...`)
      const responseText = await twilioService.processMessageForTwiML(body)
      console.log(`📤 Response from TwilioService:`, responseText)
      
      if (responseText) {
        twiml.message(responseText)
        console.log(`✅ TwiML response sent:`, responseText)
      } else {
        twiml.message('Thank you for your message!')
        console.log(`⚠️ No response from TwilioService, sent default message`)
      }

      reply.type('text/xml')
      return reply.status(200).send(twiml.toString())

    } catch (error) {
      console.error('❌ Error handling global webhook:', error)
      
      const twiml = new twilio.twiml.MessagingResponse()
      twiml.message('Sorry, there was an error processing your message.')
      
      reply.type('text/xml')
      return reply.status(200).send(twiml.toString())
    }
  }

  static async deleteIntegration(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { integrationId } = request.params as { integrationId: string }

      await prisma.twilioSettings.deleteMany({
        where: { integrationId }
      })

      return ResponseHandler.success(reply, null, 'Twilio integration deleted')

    } catch (error: any) {
      console.error('Error deleting Twilio integration:', error)
      return ResponseHandler.error(reply, error.message, 500)
    }
  }
}
