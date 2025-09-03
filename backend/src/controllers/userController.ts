import { FastifyRequest, FastifyReply } from 'fastify'
import { UserService } from '../services/userService'
import { CreateUserRequest, UpdateUserRequest } from '../types'

export class UserController {
  private userService: UserService

  constructor() {
    this.userService = new UserService()
  }

  async createUser(request: FastifyRequest<{ Body: CreateUserRequest }>, reply: FastifyReply) {
    try {
      const { name, email } = request.body

      // Check if user already exists
      const existingUser = await this.userService.getUserByEmail(email)
      if (existingUser) {
        return reply.status(400).send({
          success: false,
          message: 'User with this email already exists'
        })
      }

      const user = await this.userService.createUser(name, email)

      return reply.status(201).send({
        success: true,
        data: user,
        message: 'User created successfully'
      })
    } catch (error: any) {
      request.log.error('Error creating user:', error)
      return reply.status(500).send({
        success: false,
        message: 'Internal server error'
      })
    }
  }

  async getUserById(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    try {
      const { id } = request.params
      const user = await this.userService.getUserById(id)

      if (!user) {
        return reply.status(404).send({
          success: false,
          message: 'User not found'
        })
      }

      return reply.send({
        success: true,
        data: user
      })
    } catch (error: any) {
      request.log.error('Error getting user:', error)
      return reply.status(500).send({
        success: false,
        message: 'Internal server error'
      })
    }
  }

  async getAllUsers(request: FastifyRequest, reply: FastifyReply) {
    try {
      const users = await this.userService.getAllUsers()

      return reply.send({
        success: true,
        data: users,
        count: users.length
      })
    } catch (error: any) {
      request.log.error('Error getting users:', error)
      return reply.status(500).send({
        success: false,
        message: 'Internal server error'
      })
    }
  }

  async updateUser(request: FastifyRequest<{ Params: { id: string }, Body: UpdateUserRequest }>, reply: FastifyReply) {
    try {
      const { id } = request.params
      const updates = request.body

      const user = await this.userService.updateUser(id, updates)

      if (!user) {
        return reply.status(404).send({
          success: false,
          message: 'User not found'
        })
      }

      return reply.send({
        success: true,
        data: user,
        message: 'User updated successfully'
      })
    } catch (error: any) {
      request.log.error('Error updating user:', error)
      return reply.status(500).send({
        success: false,
        message: 'Internal server error'
      })
    }
  }

  async deleteUser(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    try {
      const { id } = request.params
      
      const deleted = await this.userService.deleteUser(id)
      
      if (!deleted) {
        return reply.status(404).send({
          success: false,
          message: 'User not found'
        })
      }

      return reply.send({
        success: true,
        message: 'User deleted successfully'
      })
    } catch (error: any) {
      request.log.error('Error deleting user:', error)
      return reply.status(500).send({
        success: false,
        message: 'Internal server error'
      })
    }
  }

  async getUsersCount(request: FastifyRequest, reply: FastifyReply) {
    try {
      const users = await this.userService.getAllUsers()

      return reply.send({
        success: true,
        count: users.length
      })
    } catch (error: any) {
      request.log.error('Error getting users count:', error)
      return reply.status(500).send({
        success: false,
        message: 'Internal server error'
      })
    }
  }
}
