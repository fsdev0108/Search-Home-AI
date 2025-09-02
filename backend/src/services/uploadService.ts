import { SensayService } from './sensayService'
import { UploadSchedule, FileUploadRequest } from '../types'
import { config } from '../config'
import { v4 as uuidv4 } from 'uuid'
import fs from 'fs'
import path from 'path'
import { prisma } from '../lib/prisma'

export class UploadService {
  private sensayService: SensayService

  constructor() {
    this.sensayService = new SensayService()
    this.ensureUploadDirectory()
  }

  private ensureUploadDirectory(): void {
    if (!fs.existsSync(config.upload.uploadDir)) {
      fs.mkdirSync(config.upload.uploadDir, { recursive: true })
    }
  }

  async uploadFileToReplica(replicaUuid: string, fileRequest: FileUploadRequest): Promise<{ knowledgeBaseId: number }> {
    try {
      // Get signed URL for upload
      const uploadResponse = await this.sensayService.getSignedUploadUrl(replicaUuid, fileRequest.filename)
      
      if (!uploadResponse.success) {
        throw new Error('Failed to get signed upload URL')
      }

      // Upload file to signed URL
      await this.sensayService.uploadFileToSignedUrl(uploadResponse.signedURL, fileRequest.filePath)

      // Record file upload in database
      await prisma.fileUpload.create({
        data: {
          replicaId: replicaUuid,
          fileName: fileRequest.filename,
          filePath: fileRequest.filePath,
          knowledgeBaseId: uploadResponse.knowledgeBaseID,
          fileSize: fs.statSync(fileRequest.filePath).size,
          mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          status: 'uploaded'
        }
      })

      return { knowledgeBaseId: uploadResponse.knowledgeBaseID }
    } catch (error) {
      throw new Error(`Upload failed: ${error}`)
    }
  }

  async deletePreviousUpload(replicaUuid: string, knowledgeBaseId: number): Promise<void> {
    try {
      await this.sensayService.deleteKnowledgeBaseEntry(replicaUuid, knowledgeBaseId)
      
      // Update database record
      await prisma.fileUpload.updateMany({
        where: {
          replicaId: replicaUuid,
          knowledgeBaseId: knowledgeBaseId
        },
        data: {
          status: 'deleted'
        }
      })
    } catch (error) {
      throw new Error(`Failed to delete previous upload: ${error}`)
    }
  }

  async scheduleUpload(
    replicaId: string,
    filePath: string,
    schedule: 'daily' | 'on-demand' = 'daily'
  ): Promise<UploadSchedule> {
    const now = new Date()
    const nextUpload = schedule === 'daily' 
      ? new Date(now.getTime() + 24 * 60 * 60 * 1000) // 24 hours from now
      : now

    const uploadSchedule = await prisma.uploadSchedule.create({
      data: {
        replicaId,
        filePath,
        schedule,
        nextUpload,
        isActive: true
      }
    })

    return {
      id: uploadSchedule.id,
      replicaId: uploadSchedule.replicaId,
      filePath: uploadSchedule.filePath,
      schedule: uploadSchedule.schedule as 'daily' | 'on-demand',
      lastUpload: uploadSchedule.lastUpload,
      nextUpload: uploadSchedule.nextUpload,
      isActive: uploadSchedule.isActive
    }
  }

  async processScheduledUploads(): Promise<void> {
    const now = new Date()
    const dueUploads = await prisma.uploadSchedule.findMany({
      where: {
        isActive: true,
        nextUpload: {
          lte: now
        }
      }
    })

    for (const schedule of dueUploads) {
      try {
        await this.uploadFileToReplica(schedule.replicaId, {
          filename: path.basename(schedule.filePath),
          filePath: schedule.filePath
        })

        // Update schedule
        await prisma.uploadSchedule.update({
          where: { id: schedule.id },
          data: {
            lastUpload: now,
            nextUpload: new Date(now.getTime() + 24 * 60 * 60 * 1000)
          }
        })
      } catch (error) {
        console.error(`Failed to process scheduled upload for ${schedule.id}:`, error)
      }
    }
  }

  async getUploadSchedules(): Promise<UploadSchedule[]> {
    const schedules = await prisma.uploadSchedule.findMany({
      include: {
        replica: true
      }
    })

    return schedules.map((schedule: any) => ({
      id: schedule.id,
      replicaId: schedule.replicaId,
      filePath: schedule.filePath,
      schedule: schedule.schedule as 'daily' | 'on-demand',
      lastUpload: schedule.lastUpload,
      nextUpload: schedule.nextUpload,
      isActive: schedule.isActive
    }))
  }

  async updateUploadSchedule(scheduleId: string, updates: Partial<UploadSchedule>): Promise<UploadSchedule | null> {
    const schedule = await prisma.uploadSchedule.update({
      where: { id: scheduleId },
      data: {
        filePath: updates.filePath,
        schedule: updates.schedule,
        nextUpload: updates.nextUpload,
        isActive: updates.isActive
      }
    })

    return {
      id: schedule.id,
      replicaId: schedule.replicaId,
      filePath: schedule.filePath,
      schedule: schedule.schedule as 'daily' | 'on-demand',
      lastUpload: schedule.lastUpload,
      nextUpload: schedule.nextUpload,
      isActive: schedule.isActive
    }
  }
}
