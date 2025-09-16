import { FastifyInstance } from 'fastify'
import { prisma } from '../lib/prisma'

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

      // Get integration to find user in database
      const integration = await prisma.integrationSettings.findFirst()
      if (!integration) {
        return reply.status(500).send({
          success: false,
          error: 'No integration found'
        })
      }

      // Find user in database (users created via Sensay API)
      const dbUser = await prisma.user.findFirst({
        where: {
          email: email,
          integrationId: integration.id
        }
      })

      if (!dbUser) {
        return reply.status(401).send({
          success: false,
          error: 'User not found. Please contact administrator to create your account.'
        })
      }

      // For now, use simple password validation
      // In production, this should use proper password hashing
      // Since we don't store passwords in our local DB, we'll use a simple approach
      // The real authentication should be handled by Sensay or a proper auth system
      
      // Simple password validation (in production, use proper hashing)
      const validPasswords: Record<string, string> = {
        'admin@herainov.com': 'admin123',
        'user@herainov.com': 'user123'
      }
      
      if (validPasswords[email] !== password) {
        return reply.status(401).send({
          success: false,
          error: 'Invalid password'
        })
      }

      // Determine role based on email or other criteria
      // In production, this should be stored in the database
      const role = email.includes('admin') ? 'admin' : 'user'

      // Generate simple token (in production, use JWT)
      const token = 'token-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9)

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

  // Register (apenas admin pode criar usuários)
  fastify.post('/auth/register', {
    schema: {
      body: {
        type: 'object',
        required: ['name', 'email', 'password', 'role'],
        properties: {
          name: { type: 'string', minLength: 1 },
          email: { type: 'string', format: 'email' },
          password: { type: 'string', minLength: 6 },
          role: { type: 'string', enum: ['admin', 'user'] }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const { name, email, password, role } = request.body as any

      return reply.status(501).send({
        success: false,
        error: 'User registration not implemented in simplified version'
      })
    } catch (error: any) {
      request.log.error('Error creating user:', error)
      return reply.status(500).send({
        success: false,
        error: 'Internal server error'
      })
    }
  })

  // Verificar token atual
  fastify.get('/auth/me', async (request, reply) => {
    return reply.status(501).send({
      success: false,
      error: 'Get current user not implemented in simplified version'
    })
  })

  // Logout (opcional, pode ser feito no frontend)
  fastify.post('/auth/logout', async (request, reply) => {
    return reply.status(501).send({
      success: false,
      error: 'Logout not implemented in simplified version'
    })
  })
}
