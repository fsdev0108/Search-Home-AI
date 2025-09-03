import { FastifyRequest, FastifyReply } from 'fastify'
import jwt from 'jsonwebtoken'
import { User } from '../types'

interface AuthenticatedRequest extends FastifyRequest {
  user?: User
}

export interface JWTPayload {
  userId: string
  email: string
  role: string
}

export const authMiddleware = async (request: AuthenticatedRequest, reply: FastifyReply) => {
  try {
    const authHeader = request.headers.authorization
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return reply.status(401).send({
        success: false,
        error: 'Access token required'
      })
    }

    const token = authHeader.substring(7)
    const secret = process.env.JWT_SECRET || 'your-secret-key-change-in-production'
    
    const decoded = jwt.verify(token, secret) as JWTPayload
    request.user = {
      id: decoded.userId,
      email: decoded.email,
      role: decoded.role as 'admin' | 'user',
      name: '',
      createdAt: new Date(),
      updatedAt: new Date()
    }

    return
  } catch (error) {
    return reply.status(401).send({
      success: false,
      error: 'Invalid or expired token'
    })
  }
}

export const requireRole = (allowedRoles: string[]) => {
  return async (request: AuthenticatedRequest, reply: FastifyReply) => {
    if (!request.user) {
      return reply.status(401).send({
        success: false,
        error: 'Authentication required'
      })
    }

    if (!allowedRoles.includes(request.user.role)) {
      return reply.status(403).send({
        success: false,
        error: 'Insufficient permissions'
      })
    }

    return
  }
}

export const requireAdmin = requireRole(['admin'])
export const requireUser = requireRole(['admin', 'user'])
