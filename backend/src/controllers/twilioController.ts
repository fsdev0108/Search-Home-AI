import { FastifyRequest, FastifyReply } from 'fastify'
import { TwilioService } from '../services/twilioService'
import { ResponseHandler } from '../utils/response'
import { PrismaClient } from '@prisma/client'
import axios from 'axios'

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
      return ResponseHandler.error(reply, 'Invalid server credentials', 401)
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

      await prisma.twilioSettings.updateMany({
        where: { integrationId },
        data: { isActive: true }
      })

      return ResponseHandler.success(reply, { isActive: true }, 'Twilio integration activated')

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

      if (integrationId === 'test-integration') {
        console.log('🧪 Test webhook - echoing message back')
        const from = body.From?.replace('whatsapp:', '')
        const message = body.Body
        
        if (from && message) {
          const testService = new TwilioService(
            process.env.TWILIO_ACCOUNT_SID || '',
            process.env.TWILIO_AUTH_TOKEN || '',
            process.env.TWILIO_WHATSAPP_NUMBER || '+14155238886',
            'test-replica'
          )
          
          await testService.sendMessage(from, `Echo: ${message} ✅`)
        }
        
        return reply.status(200).send('OK')
      }

      const twilioService = await TwilioService.getTwilioService(integrationId)
      
      if (twilioService) {
        await twilioService.processMessage(body)
      } else {
        console.log(`⚠️  No Twilio service found for integration: ${integrationId}`)
      }

      return reply.status(200).send('OK')

    } catch (error) {
      console.error('Error handling Twilio webhook:', error)
      return reply.status(500).send('Error')
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
