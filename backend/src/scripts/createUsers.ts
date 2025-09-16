import { PrismaClient } from '@prisma/client'
import { SensayApiService } from '../services/sensayApiService'

const prisma = new PrismaClient()

async function createUsers() {
  console.log('🌱 Creating users via Sensay API...')

  try {
    // Get integration
    const integration = await prisma.integrationSettings.findFirst()
    if (!integration) {
      console.error('❌ No integration found. Please create an integration first.')
      return
    }

    console.log('📋 Using integration:', integration.organizationName)

    // Initialize Sensay service
    const sensayService = new SensayApiService(integration.organizationSecret)

    // Users to create
    const usersToCreate = [
      {
        email: 'admin@herainov.com',
        name: 'Admin User',
        role: 'admin'
      },
      {
        email: 'user@herainov.com', 
        name: 'Regular User',
        role: 'user'
      }
    ]

    for (const userData of usersToCreate) {
      try {
        // Check if user already exists in local database
        const existingUser = await prisma.user.findFirst({
          where: {
            email: userData.email,
            integrationId: integration.id
          }
        })

        if (existingUser) {
          console.log(`⏭️ User ${userData.email} already exists, skipping...`)
          continue
        }

        // Create user in Sensay
        console.log(`👤 Creating user: ${userData.email}`)
        const sensayUser = await sensayService.createUser({
          email: userData.email,
          name: userData.name
        })

        // Save user to local database
        const localUser = await prisma.user.create({
          data: {
            integrationId: integration.id,
            sensayUserId: sensayUser.id,
            name: sensayUser.name,
            email: sensayUser.email
          }
        })

        console.log(`✅ User created successfully:`)
        console.log(`   Email: ${localUser.email}`)
        console.log(`   Name: ${localUser.name}`)
        console.log(`   Sensay ID: ${localUser.sensayUserId}`)
        console.log(`   Local ID: ${localUser.id}`)
        console.log('')

      } catch (error: any) {
        console.error(`❌ Error creating user ${userData.email}:`, error.message)
      }
    }

    console.log('🎉 User creation process completed!')
    console.log('')
    console.log('📝 Login credentials:')
    console.log('   Admin: admin@herainov.com / admin123')
    console.log('   User:  user@herainov.com / user123')

  } catch (error: any) {
    console.error('❌ Error during user creation:', error.message)
  }
}

createUsers()
  .catch((e) => {
    console.error('❌ Fatal error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
