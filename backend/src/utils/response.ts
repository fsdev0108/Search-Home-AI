import { FastifyReply } from 'fastify'
import { ApiResponse } from '../types'

export class ResponseHandler {
  static success<T>(reply: FastifyReply, data: T, message?: string, statusCode: number = 200) {
    const response: ApiResponse<T> = {
      success: true,
      data,
      message
    }
    return reply.status(statusCode).send(response)
  }

  static error(reply: FastifyReply, error: string, statusCode: number = 400) {
    const response: ApiResponse = {
      success: false,
      error
    }
    return reply.status(statusCode).send(response)
  }
}
