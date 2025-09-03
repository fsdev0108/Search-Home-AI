import { FastifyInstance } from 'fastify'
import { SensayController } from '../controllers/sensayController'

export async function sensayRoutes(fastify: FastifyInstance) {
  const sensayController = new SensayController()

  // User management
  fastify.post('/sensay/users', sensayController.createUser.bind(sensayController))

  // Replica management
  fastify.post('/replicas', sensayController.createReplica.bind(sensayController))
  fastify.get('/users/:userId/replicas', sensayController.getReplicasByUser.bind(sensayController))

  // File upload
  fastify.post('/replicas/:replicaUuid/upload', sensayController.uploadFile.bind(sensayController))

  // Upload scheduling
  fastify.post('/uploads/schedule', sensayController.scheduleUpload.bind(sensayController))
  fastify.get('/uploads/schedules', sensayController.getUploadSchedules.bind(sensayController))
  fastify.post('/uploads/process', sensayController.processScheduledUploads.bind(sensayController))
}
