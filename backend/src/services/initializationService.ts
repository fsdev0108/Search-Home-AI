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

  static async createDefaultUser(integration: any) {
    try {
      console.log('👤 Creating default user...')

      // Check if user already exists
      const existingUser = await prisma.user.findFirst({
        where: { email: 'testUser@herainov.com' }
      })

      if (existingUser) {
        console.log('✅ Default user already exists:', existingUser.email)
        return existingUser
      }

      // Create user in Sensay
      const sensayService = new SensayApiService(integration.organizationSecret)
      const sensayUser = await sensayService.createUser({
        email: 'testUser@herainov.com',
        name: 'Test User'
      })

      // Save user to local database
      const localUser = await prisma.user.create({
        data: {
          integrationId: integration.id,
          sensayUserId: sensayUser.id,
          name: sensayUser.name,
          email: sensayUser.email,
          password: 'herainov123' // Default password for test user
        } as any
      })

      console.log('✅ Default user created successfully:')
      console.log(`   Email: ${localUser.email}`)
      console.log(`   Password: herainov123`)
      console.log(`   Sensay ID: ${localUser.sensayUserId}`)

      return localUser

    } catch (error) {
      console.error('❌ Error creating default user:', error)
      return null
    }
  }

  static async initialize() {
    console.log('🚀 Starting application initialization...')
    
    // Initialize default integration
    const integration = await this.initializeDefaultIntegration()
    
    // Create default user if integration exists
    if (integration) {
      await this.createDefaultUser(integration)
    }
    
    console.log('✅ Application initialization completed')
  }
}
