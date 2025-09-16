import { PrismaClient } from '@prisma/client'
import { SensayApiService } from './sensayApiService'

const prisma = new PrismaClient()

export class InitializationService {
  static async initializeDefaultIntegration() {
    try {
      console.log('🔧 Initializing default integration...')

      // Check if integration already exists
      const existingIntegration = await prisma.integrationSettings.findFirst({
        where: {
          organizationSecret: process.env.SENSAY_ORGANIZATION_SECRET
        }
      })

      if (existingIntegration) {
        console.log('✅ Default integration already exists:', existingIntegration.organizationName)
        return existingIntegration
      }

      // Create default integration
      const organizationSecret = process.env.SENSAY_ORGANIZATION_SECRET
      const organizationName = process.env.ORGANIZATION_NAME || 'Default Organization'

      if (!organizationSecret) {
        console.log('⚠️ No SENSAY_ORGANIZATION_SECRET found in environment variables')
        return null
      }

      // Test connection to Sensay
      const sensayService = new SensayApiService(organizationSecret)
      const isConnected = await sensayService.testConnection()

      if (!isConnected) {
        console.log('❌ Failed to connect to Sensay API with provided secret')
        return null
      }

      // Create integration
      const integration = await prisma.integrationSettings.create({
        data: {
          organizationSecret,
          organizationName,
          settings: JSON.stringify({
            autoCreated: true,
            createdAt: new Date().toISOString()
          })
        }
      })

      console.log('✅ Default integration created successfully:', integration.organizationName)
      return integration

    } catch (error) {
      console.error('❌ Error initializing default integration:', error)
      return null
    }
  }

  static async initialize() {
    console.log('🚀 Starting application initialization...')
    
    // Initialize default integration
    await this.initializeDefaultIntegration()
    
    console.log('✅ Application initialization completed')
  }
}
