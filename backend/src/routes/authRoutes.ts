import { FastifyInstance } from 'fastify'
import { prisma } from '../lib/prisma'
import { SensayApiService } from '../services/sensayApiService'
import bcrypt from 'bcrypt'

export async function authRoutes(fastify: FastifyInstance) {

  // Login
  fastify.post('/auth/login', {
    schema: {
      body: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string', minLength: 6 }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const { email, password } = request.body as any

      // Find user in database across all integrations
      const dbUser = await prisma.user.findFirst({
        where: {
          email: email
        }
      })

      if (!dbUser) {
        return reply.status(401).send({
          success: false,
          error: 'User not found. Please contact administrator to create your account.'
        })
      }

      const isValidPassword = await bcrypt.compare(password, dbUser.password)
      
      if (!isValidPassword) {
        return reply.status(401).send({
          success: false,
          error: 'Invalid password'
        })
      }

      // Determine role based on email or other criteria
      // In production, this should be stored in the database
      const role = email.includes('admin') ? 'admin' : 'user'

      // Generate JWT token
      const jwt = require('jsonwebtoken')
      const secret = process.env.JWT_SECRET || 'your-secret-key-change-in-production'
      
      const payload = {
        userId: dbUser.sensayUserId,
        email: dbUser.email,
        role: role
      }
      
      const token = jwt.sign(payload, secret, { expiresIn: '24h' })

      return reply.send({
        success: true,
        data: {
          token,
          user: {
            id: dbUser.sensayUserId, // Use the real Sensay UUID
            sensayUserId: dbUser.sensayUserId,
            email: dbUser.email,
            name: dbUser.name,
            role: role
          }
        }
      })
    } catch (error: any) {
      request.log.error('Login error:', error)
      return reply.status(500).send({
        success: false,
        error: 'Internal server error'
      })
    }
  })


  fastify.post('/auth/register', {
    schema: {
      body: {
        type: 'object',
        required: ['name', 'email', 'password'],
        properties: {
          name: { type: 'string', minLength: 1 },
          email: { type: 'string', format: 'email' },
          password: { type: 'string', minLength: 6 }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const { name, email, password } = request.body as any

      // Check if user already exists
      const existingUser = await prisma.user.findFirst({
        where: { email: email }
      })

      if (existingUser) {
        return reply.status(400).send({
          success: false,
          error: 'User with this email already exists'
        })
      }

      // Create individual integration for this user
      // Same organization, but separate integration settings
      const envOrgSecret = process.env.SENSAY_ORGANIZATION_SECRET
      if (!envOrgSecret) {
        return reply.status(500).send({
          success: false,
          error: 'SENSAY_ORGANIZATION_SECRET environment variable is required'
        })
      }

      // Create new integration for this user (same org, different settings)
      const integration = await prisma.integrationSettings.create({
        data: {
          organizationSecret: envOrgSecret, // Same organization
          organizationName: `${name}'s Integration`,
          settings: JSON.stringify({ 
            createdBy: email,
            userType: 'individual',
            description: `Integration for ${name}`,
            userId: email // Track which user owns this integration
          })
        }
      })

      // Create user in Sensay
      console.log('🔍 Creating user in Sensay...')
      const sensayService = new SensayApiService(integration.organizationSecret)
      const sensayUser = await sensayService.createUser({
        name,
        email
      })
      console.log('✅ Sensay user created:', sensayUser)

      const saltRounds = 10
      const hashedPassword = await bcrypt.hash(password, saltRounds)
      console.log('✅ Password hashed successfully')

      // Validate required data before saving
      console.log('🔍 Validating Sensay user data...')
      if (!sensayUser?.id) {
        console.error('❌ Sensay user ID is missing:', sensayUser)
        throw new Error('Sensay user ID is missing')
      }
      if (!sensayUser?.name) {
        console.error('❌ Sensay user name is missing:', sensayUser)
        throw new Error('Sensay user name is missing')
      }
      if (!sensayUser?.email) {
        console.error('❌ Sensay user email is missing:', sensayUser)
        throw new Error('Sensay user email is missing')
      }
      console.log('✅ Sensay user data validated')

      // Save user to local database
      console.log('🔍 Saving user to local database...')
      console.log('Integration ID:', integration.id)
      console.log('Sensay User ID:', sensayUser.id)
      console.log('User Name:', sensayUser.name)
      console.log('User Email:', sensayUser.email)
      
      const localUser = await prisma.user.create({
        data: {
          integrationId: integration.id,
          sensayUserId: sensayUser.id,
          name: sensayUser.name,
          email: sensayUser.email,
          password: hashedPassword
        }
      })
      console.log('✅ User saved to local database:', localUser.id)

      const jwt = require('jsonwebtoken')
      const secret = process.env.JWT_SECRET || 'your-secret-key-change-in-production'
      
      const payload = {
        userId: localUser.sensayUserId,
        email: localUser.email,
        role: 'user' // New users are regular users by default
      }
      
      const token = jwt.sign(payload, secret, { expiresIn: '24h' })

      return reply.status(201).send({
        success: true,
        data: {
          token,
          user: {
            id: localUser.sensayUserId,
            sensayUserId: localUser.sensayUserId,
            email: localUser.email,
            name: localUser.name,
            role: 'user'
          }
        },
        message: 'User created successfully'
      })

    } catch (error: any) {
      console.error('❌ Error in user creation process:')
      console.error('Error type:', typeof error)
      console.error('Error message:', error.message)
      console.error('Error stack:', error.stack)
      console.error('Full error object:', error)
      
      request.log.error('Error creating user:', error)
      return reply.status(500).send({
        success: false,
        error: 'Failed to create user: ' + error.message
      })
    }
  })

  fastify.get('/auth/me', async (request, reply) => {
    return reply.status(501).send({
      success: false,
      error: 'Get current user not implemented in simplified version'
    })
  })

  fastify.post('/auth/logout', async (request, reply) => {
    return reply.status(501).send({
      success: false,
      error: 'Logout not implemented in simplified version'
    })
  })
}
