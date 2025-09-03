import { FastifyRequest, FastifyReply } from 'fastify'
import { SensayService } from '../services/sensayService'
import { UserService } from '../services/userService'
import { ReplicaService } from '../services/replicaService'
import { UploadService } from '../services/uploadService'
import { ResponseHandler } from '../utils/response'
import { ReplicaCreationRequest, FileUploadRequest } from '../types'
import { v4 as uuidv4 } from 'uuid'
import fs from 'fs'
import path from 'path'
import { config } from '../config'

interface CreateUserRequest {
  Body: {
    name: string
    email: string
  }
}

interface CreateReplicaRequest {
  Body: ReplicaCreationRequest
}

interface UploadFileRequest {
  Params: { replicaUuid: string }
  Body: {
    file: any
  }
}

interface ScheduleUploadRequest {
  Body: {
    replicaId: string
    filePath: string
    schedule: 'daily' | 'on-demand'
  }
}

export class SensayController {
  private sensayService: SensayService
  private userService: UserService
  private replicaService: ReplicaService
  private uploadService: UploadService

  constructor() {
    this.sensayService = new SensayService()
    this.userService = new UserService()
    this.replicaService = new ReplicaService()
    this.uploadService = new UploadService()
  }

  async createUser(request: FastifyRequest<CreateUserRequest>, reply: FastifyReply) {
    try {
      const { name, email } = request.body
      
      // Check if user already exists in local database
      const existingUser = await this.userService.getUserByEmail(email)
      if (existingUser) {
        return ResponseHandler.error(reply, 'User with this email already exists', 409)
      }

      // Create user in Sensay first (following hierarchical structure)
      const sensayUser = await this.sensayService.createUser(name, email)
      
      // Save user to local database with Sensay ID
      const user = await this.userService.createUser(name, email, sensayUser.id)
      
      return ResponseHandler.success(reply, {
        ...user,
        sensayId: sensayUser.id
      }, 'User created successfully in Sensay and local database', 201)
    } catch (error) {
      return ResponseHandler.error(reply, 'Failed to create user')
    }
  }

  async createReplica(request: FastifyRequest<CreateReplicaRequest>, reply: FastifyReply) {
    try {
      const replicaData = request.body
      
      const user = await this.userService.getUserById(replicaData.ownerID)
      if (!user) {
        return ResponseHandler.error(reply, 'User not found', 404)
      }

      // Create replica in Sensay API
      const sensayReplica = await this.sensayService.createReplica(replicaData)
      
      // Save replica to local database
      const replica = await this.replicaService.createReplica(replicaData, sensayReplica.id)
      
      // Update local replica with Sensay ID
      await this.replicaService.updateReplicaSensayId(replica.id, sensayReplica.id)

      return ResponseHandler.success(reply, replica, 'Replica created successfully', 201)
    } catch (error) {
      return ResponseHandler.error(reply, 'Failed to create replica')
    }
  }

  async uploadFile(request: FastifyRequest<UploadFileRequest>, reply: FastifyReply) {
    try {
      const { replicaUuid } = request.params
      const file = request.body.file

      if (!file) {
        return ResponseHandler.error(reply, 'No file provided', 400)
      }

      // Validate file type
      const fileExtension = path.extname(file.filename).toLowerCase()
      if (!config.upload.allowedTypes.includes(fileExtension)) {
        return ResponseHandler.error(reply, 'Invalid file type. Only Excel files are allowed', 400)
      }

      // Save file to upload directory
      const fileName = `${uuidv4()}_${file.filename}`
      const filePath = path.join(config.upload.uploadDir, fileName)
      
      await fs.promises.writeFile(filePath, file.data)

      // Upload to Sensay
      const uploadResult = await this.uploadService.uploadFileToReplica(replicaUuid, {
        filename: file.filename,
        filePath
      })

      // Schedule daily upload
      await this.uploadService.scheduleUpload(replicaUuid, filePath, 'daily')

      return ResponseHandler.success(reply, {
        knowledgeBaseId: uploadResult.knowledgeBaseId,
        fileName,
        filePath
      }, 'File uploaded successfully')
    } catch (error) {
      return ResponseHandler.error(reply, 'Failed to upload file')
    }
  }

  async scheduleUpload(request: FastifyRequest<ScheduleUploadRequest>, reply: FastifyReply) {
    try {
      const { replicaId, filePath, schedule } = request.body

      const uploadSchedule = await this.uploadService.scheduleUpload(replicaId, filePath, schedule)
      return ResponseHandler.success(reply, uploadSchedule, 'Upload scheduled successfully')
    } catch (error) {
      return ResponseHandler.error(reply, 'Failed to schedule upload')
    }
  }

  async getUploadSchedules(request: FastifyRequest, reply: FastifyReply) {
    try {
      const schedules = await this.uploadService.getUploadSchedules()
      return ResponseHandler.success(reply, schedules, 'Upload schedules retrieved successfully')
    } catch (error) {
      return ResponseHandler.error(reply, 'Failed to retrieve upload schedules')
    }
  }

  async processScheduledUploads(request: FastifyRequest, reply: FastifyReply) {
    try {
      await this.uploadService.processScheduledUploads()
      return ResponseHandler.success(reply, null, 'Scheduled uploads processed successfully')
    } catch (error) {
      return ResponseHandler.error(reply, 'Failed to process scheduled uploads')
    }
  }

  async getReplicasByUser(request: FastifyRequest<{ Params: { userId: string } }>, reply: FastifyReply) {
    try {
      const { userId } = request.params
      
      const user = await this.userService.getUserById(userId)
      if (!user) {
        return ResponseHandler.error(reply, 'User not found', 404)
      }

      const replicas = await this.replicaService.getReplicasByUserId(userId)
      return ResponseHandler.success(reply, replicas, 'Replicas retrieved successfully')
    } catch (error) {
      return ResponseHandler.error(reply, 'Failed to retrieve replicas')
    }
  }
}
