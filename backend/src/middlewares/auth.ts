import { FastifyRequest, FastifyReply } from 'fastify'
import jwt from 'jsonwebtoken'
import { User } from '../types'

interface AuthenticatedRequest extends FastifyRequest {
  user?: User
  organizationId?: string
}

export interface JWTPayload {
  userId: string
  email: string
  role: string
  organizationId?: string
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
    
    // Set organization ID if present
    if (decoded.organizationId) {
      request.organizationId = decoded.organizationId
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

export const requireOrganizationAccess = async (request: AuthenticatedRequest, reply: FastifyReply) => {
  if (!request.user) {
    return reply.status(401).send({
      success: false,
      error: 'Authentication required'
    })
  }

  // Extract organization ID from URL params
  const organizationId = (request.params as any)?.organizationId
  
  if (!organizationId) {
    return reply.status(400).send({
      success: false,
      error: 'Organization ID required'
    })
  }

  // For now, allow access if user is admin or has organization access
  // TODO: Implement proper organization membership validation
  if (request.user.role === 'admin' || request.organizationId === organizationId) {
    request.organizationId = organizationId
    return
  }

  return reply.status(403).send({
    success: false,
    error: 'Access denied to this organization'
  })
}
