import { FastifyError, FastifyReply, FastifyRequest } from 'fastify'
import { ResponseHandler } from '../utils/response'

export const errorHandler = (
  error: FastifyError,
  request: FastifyRequest,
  reply: FastifyReply
) => {
  const statusCode = error.statusCode || 500
  const message = error.message || 'Internal Server Error'

  request.log.error(error)

  return ResponseHandler.error(reply, message, statusCode)
}
