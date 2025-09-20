import { FastifyRequest, FastifyReply } from 'fastify'
import { TwilioService } from '../services/twilioService'
import { ResponseHandler } from '../utils/response'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export class TwilioController {
  
  static async createIntegration(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { integrationId, accountSid, authToken, phoneNumber, replicaId } = request.body as any

      if (!integrationId || !accountSid || !authToken || !phoneNumber || !replicaId) {
        return ResponseHandler.error(reply, 'Missing required fields', 400)
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
      }, 'Twilio integration created successfully')

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
