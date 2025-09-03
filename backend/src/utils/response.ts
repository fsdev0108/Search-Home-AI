import { FastifyReply, FastifyRequest } from 'fastify'
import { ApiResponse } from '../types'

export class ResponseHandler {
  static success<T>(reply: FastifyReply, data: T, message?: string, statusCode: number = 200, request?: FastifyRequest) {
    const response: ApiResponse<T> = {
      success: true,
      data,
      message,
      timestamp: new Date().toISOString(),
      requestId: request?.id || 'unknown'
    }
    return reply.status(statusCode).send(response)
  }

  static error(reply: FastifyReply, error: string, statusCode: number = 400, request?: FastifyRequest) {
    const response: ApiResponse = {
      success: false,
      error,
      timestamp: new Date().toISOString(),
      requestId: request?.id || 'unknown'
    }
    return reply.status(statusCode).send(response)
  }
}
