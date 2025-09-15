import { FastifyInstance } from 'fastify'

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
    return reply.status(501).send({
      success: false,
      error: 'Authentication not implemented in simplified version'
    })
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
