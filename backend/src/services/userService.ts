import { User } from '../types'
import { prisma } from '../lib/prisma'

export class UserService {
  async createUser(name: string, email: string, sensayId?: string): Promise<User> {
    const user = await prisma.user.create({
      data: {
        name,
        email,
        role: 'user', // Default role
        sensayId: sensayId || null
      }
    })

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role as 'admin' | 'user' | 'viewer',
      sensayId: user.sensayId || undefined,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    }
  }

  async getUserById(id: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: { id }
    })

    if (!user) return null

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role as 'admin' | 'user' | 'viewer',
      sensayId: user.sensayId || undefined,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    }
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) return null

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role as 'admin' | 'user' | 'viewer',
      sensayId: user.sensayId || undefined,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    }
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | null> {
    const user = await prisma.user.update({
      where: { id },
      data: {
        name: updates.name,
        email: updates.email,
        role: updates.role
      }
    })

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role as 'admin' | 'user' | 'viewer',
      sensayId: user.sensayId || undefined,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    }
  }

  async getAllUsers(): Promise<User[]> {
    const users = await prisma.user.findMany()
    
    return users.map((user: any) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role as 'admin' | 'user' | 'viewer',
      sensayId: user.sensayId || undefined,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    }))
  }

  async deleteUser(id: string): Promise<boolean> {
    try {
      await prisma.user.delete({
        where: { id }
      })
      return true
    } catch (error) {
      return false
    }
  }
}
