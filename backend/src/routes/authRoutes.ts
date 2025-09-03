import { FastifyInstance } from 'fastify'
import { UserController } from '../controllers/userController'
import { authMiddleware, requireAdmin } from '../middlewares/auth'

export async function authRoutes(fastify: FastifyInstance) {
  const userController = new UserController()

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
  }, userController.login.bind(userController))

  // Register (apenas admin pode criar usuários)
  fastify.post('/auth/register', {
    preHandler: [authMiddleware, requireAdmin],
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

      // Verificar se o usuário já existe
      const existingUser = await userController['userService'].getUserByEmail(email)
      if (existingUser) {
        return reply.status(409).send({
          success: false,
          error: 'User with this email already exists'
        })
      }

      // Hash da senha
      const bcrypt = require('bcrypt')
      const saltRounds = 10
      const hashedPassword = await bcrypt.hash(password, saltRounds)

      // Criar usuário com senha
      const user = await userController['userService'].createUserWithPassword(name, email, hashedPassword, role)

      return reply.status(201).send({
        success: true,
        data: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        },
        message: 'User created successfully'
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
  fastify.get('/auth/me', {
    preHandler: [authMiddleware]
  }, userController.getCurrentUser.bind(userController))

  // Logout (opcional, pode ser feito no frontend)
  fastify.post('/auth/logout', {
    preHandler: [authMiddleware]
  }, userController.logout.bind(userController))
}
