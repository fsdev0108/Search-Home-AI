import { FastifyInstance } from 'fastify'
import { UserController } from '../controllers/userController'

export async function userRoutes(fastify: FastifyInstance) {
  const userController = new UserController()

  // Create new user
  fastify.post('/users', {
    schema: {
      body: {
        type: 'object',
        required: ['name', 'email'],
        properties: {
          name: { type: 'string', minLength: 1 },
          email: { type: 'string', format: 'email' }
        }
      }
    }
  }, userController.createUser.bind(userController))

  // Get user by ID
  fastify.get('/users/:id', {
    schema: {
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string' }
        }
      }
    }
  }, userController.getUserById.bind(userController))

  // Get all users
  fastify.get('/users', userController.getAllUsers.bind(userController))

  // Update user
  fastify.put('/users/:id', {
    schema: {
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string' }
        }
      },
      body: {
        type: 'object',
        properties: {
          name: { type: 'string', minLength: 1 },
          email: { type: 'string', format: 'email' }
        }
      }
    }
  }, userController.updateUser.bind(userController))

  // Delete user
  fastify.delete('/users/:id', {
    schema: {
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string' }
        }
      }
    }
  }, userController.deleteUser.bind(userController))

  // Get users count
  fastify.get('/users/count', userController.getUsersCount.bind(userController))
}
