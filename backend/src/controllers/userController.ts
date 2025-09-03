import { FastifyRequest, FastifyReply } from 'fastify'
import { UserService } from '../services/userService'
import { CreateUserRequest, UpdateUserRequest } from '../types'
import { ResponseHandler } from '../utils/response'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'

export class UserController {
  private userService: UserService

  constructor() {
    this.userService = new UserService()
  }

  async login(request: FastifyRequest<{ Body: { email: string; password: string } }>, reply: FastifyReply) {
    try {
      const { email, password } = request.body

      const user = await this.userService.getUserByEmail(email)
      if (!user) {
        return ResponseHandler.error(reply, 'Invalid credentials', 401)
      }

      // Verificar se o usuário tem senha (usuários criados via Sensay podem não ter)
      if (!user.password) {
        return ResponseHandler.error(reply, 'Invalid credentials', 401)
      }

      const isValidPassword = await bcrypt.compare(password, user.password)
      if (!isValidPassword) {
        return ResponseHandler.error(reply, 'Invalid credentials', 401)
      }

      // Gerar JWT token
      const secret = process.env.JWT_SECRET || 'your-secret-key-change-in-production'
      const token = jwt.sign(
        { 
          userId: user.id, 
          email: user.email, 
          role: user.role 
        },
        secret,
        { expiresIn: '24h' }
      )

      return ResponseHandler.success(reply, {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        },
        token
      }, 'Login successful')
    } catch (error: any) {
      request.log.error('Error during login:', error)
      return ResponseHandler.error(reply, 'Internal server error')
    }
  }

  async register(request: FastifyRequest<{ Body: { name: string; email: string; password: string; role: string } }>, reply: FastifyReply) {
    try {
      const { name, email, password, role } = request.body

      // Verificar se o usuário já existe
      const existingUser = await this.userService.getUserByEmail(email)
      if (existingUser) {
        return ResponseHandler.error(reply, 'User with this email already exists', 409)
      }

      // Hash da senha
      const saltRounds = 10
      const hashedPassword = await bcrypt.hash(password, saltRounds)

      // Criar usuário com senha
      const user = await this.userService.createUserWithPassword(name, email, hashedPassword, role as 'admin' | 'user')

      return ResponseHandler.success(reply, {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }, 'User created successfully', 201)
    } catch (error: any) {
      request.log.error('Error creating user:', error)
      return ResponseHandler.error(reply, 'Internal server error')
    }
  }

  async getCurrentUser(request: FastifyRequest, reply: FastifyReply) {
    try {
      const user = (request as any).user
      if (!user) {
        return ResponseHandler.error(reply, 'User not found', 404)
      }

      return ResponseHandler.success(reply, {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      })
    } catch (error: any) {
      request.log.error('Error getting current user:', error)
      return ResponseHandler.error(reply, 'Internal server error')
    }
  }

  async logout(request: FastifyRequest, reply: FastifyReply) {
    try {
      // Em uma implementação mais robusta, você pode invalidar o token
      // Por enquanto, apenas retornamos sucesso
      return ResponseHandler.success(reply, null, 'Logout successful')
    } catch (error: any) {
      request.log.error('Error during logout:', error)
      return ResponseHandler.error(reply, 'Internal server error')
    }
  }

  async createUser(request: FastifyRequest<{ Body: CreateUserRequest }>, reply: FastifyReply) {
    try {
      const { name, email } = request.body

      // Verificar se o usuário já existe
      const existingUser = await this.userService.getUserByEmail(email)
      if (existingUser) {
        return ResponseHandler.error(reply, 'User with this email already exists', 409)
      }

      const user = await this.userService.createUser(name, email)

      return ResponseHandler.success(reply, user, 'User created successfully', 201)
    } catch (error: any) {
      request.log.error('Error creating user:', error)
      return ResponseHandler.error(reply, 'Internal server error')
    }
  }

  async getUserById(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    try {
      const { id } = request.params
      const user = await this.userService.getUserById(id)

      if (!user) {
        return ResponseHandler.error(reply, 'User not found', 404)
      }

      return ResponseHandler.success(reply, user)
    } catch (error: any) {
      request.log.error('Error getting user:', error)
      return ResponseHandler.error(reply, 'Internal server error')
    }
  }

  async getAllUsers(request: FastifyRequest, reply: FastifyReply) {
    try {
      const users = await this.userService.getAllUsers()

      return ResponseHandler.success(reply, users)
    } catch (error: any) {
      request.log.error('Error getting users:', error)
      return ResponseHandler.error(reply, 'Internal server error')
    }
  }

  async updateUser(request: FastifyRequest<{ Params: { id: string }, Body: UpdateUserRequest }>, reply: FastifyReply) {
    try {
      const { id } = request.params
      const updates = request.body

      const user = await this.userService.updateUser(id, updates)

      if (!user) {
        return ResponseHandler.error(reply, 'User not found', 404)
      }

      return ResponseHandler.success(reply, user, 'User updated successfully')
    } catch (error: any) {
      request.log.error('Error updating user:', error)
      return ResponseHandler.error(reply, 'Internal server error')
    }
  }

  async deleteUser(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    try {
      const { id } = request.params
      const deleted = await this.userService.deleteUser(id)

      if (!deleted) {
        return ResponseHandler.error(reply, 'User not found', 404)
      }

      return ResponseHandler.success(reply, null, 'User deleted successfully')
    } catch (error: any) {
      request.log.error('Error deleting user:', error)
      return ResponseHandler.error(reply, 'Internal server error')
    }
  }

  async getUsersCount(request: FastifyRequest, reply: FastifyReply) {
    try {
      const count = await this.userService.getUsersCount()
      return ResponseHandler.success(reply, { count })
    } catch (error: any) {
      request.log.error('Error getting users count:', error)
      return ResponseHandler.error(reply, 'Internal server error')
    }
  }
}
