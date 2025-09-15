import { FastifyRequest, FastifyReply } from 'fastify'
import { PrismaClient } from '@prisma/client'
import { SensayApiService, CreateUserRequest, CreateReplicaRequest } from '../services/sensayApiService'
import { generateCSV, fetchPropertiesFromHubSpot } from '../services/hubspotDataSimulator'
import * as fs from 'fs'

const prisma = new PrismaClient()

export class SensayController {
  async getIntegrations(request: FastifyRequest, reply: FastifyReply) {
    try {
      const integrations = await prisma.integrationSettings.findMany({
        include: {
          hubspotSettings: true,
          syncLogs: {
            orderBy: { createdAt: 'desc' },
            take: 10
          }
        }
      })

      return reply.send({
        success: true,
        data: integrations,
        message: 'Integrations retrieved successfully'
      })
    } catch (error: any) {
      console.error('Error getting integrations:', error)
      return reply.status(500).send({
        success: false,
        error: 'Failed to retrieve integrations'
      })
    }
  }

  async createIntegration(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { organizationSecret, organizationName, settings } = request.body as {
        organizationSecret: string
        organizationName: string
        settings?: Record<string, any>
      }

      const sensayService = new SensayApiService(organizationSecret)
      const isConnected = await sensayService.testConnection()

      if (!isConnected) {
        return reply.status(400).send({
          success: false,
          error: 'Invalid organization secret or connection failed'
        })
      }

      const integration = await prisma.integrationSettings.create({
        data: {
          organizationSecret,
          organizationName,
          settings: JSON.stringify(settings || {})
        }
      })

      return reply.status(201).send({
        success: true,
        data: integration,
        message: 'Integration created successfully'
      })
    } catch (error: any) {
      console.error('Error creating integration:', error)
      return reply.status(500).send({
        success: false,
        error: 'Failed to create integration'
      })
    }
  }

  async syncHubSpotData(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { integrationId } = request.params as { integrationId: string }

      console.log('🔄 Starting HubSpot sync for integration:', integrationId)

      await prisma.hubSpotSettings.update({
        where: { integrationId },
        data: { syncStatus: 'syncing' }
      })

      const integration = await prisma.integrationSettings.findUnique({
        where: { id: integrationId }
      })

      if (!integration) {
        throw new Error('Integration not found')
      }

      const properties = await fetchPropertiesFromHubSpot()
      const csvPath = generateCSV(properties, `properties_integration_${integrationId}.csv`)
      const csvContent = fs.readFileSync(csvPath, 'utf8')

      const sensayService = new SensayApiService(integration.organizationSecret)
      const replicas = await sensayService.getReplicas()

      let uploadResults = []

      for (const replica of replicas) {
        try {
          await sensayService.uploadCSVToKnowledgeBase(
            replica.id,
            csvContent,
            `HubSpot Properties - ${replica.name}`
          )

          uploadResults.push({
            replicaId: replica.id,
            replicaName: replica.name,
            status: 'success'
          })
        } catch (uploadError: any) {
          uploadResults.push({
            replicaId: replica.id,
            replicaName: replica.name,
            status: 'error',
            error: uploadError.message
          })
        }
      }

      await prisma.hubSpotSettings.update({
        where: { integrationId },
        data: {
          lastSync: new Date(),
          propertiesCount: properties.length,
          syncStatus: 'success'
        }
      })

      return reply.send({
        success: true,
        message: 'HubSpot data synced successfully',
        data: {
          propertiesCount: properties.length,
          replicasUpdated: uploadResults.length,
          uploadResults: uploadResults
        }
      })

    } catch (error: any) {
      console.error('❌ Error syncing HubSpot data:', error)
      
      const { integrationId } = request.params as { integrationId: string }
      await prisma.hubSpotSettings.update({
        where: { integrationId },
        data: {
          syncStatus: 'error',
          errorMessage: error.message
        }
      })

      return reply.status(500).send({
        success: false,
        message: 'Failed to sync HubSpot data',
        error: error.message
      })
    }
  }

  async connectHubSpot(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { integrationId } = request.params as { integrationId: string }
      const { apiKey } = request.body as { apiKey: string }

      if (!apiKey) {
        return reply.status(400).send({
          success: false,
          error: 'API key is required'
        })
      }

      const hubspotSettings = await prisma.hubSpotSettings.upsert({
        where: { integrationId },
        update: {
          apiKey: apiKey,
          isConnected: true,
          syncStatus: 'idle'
        },
        create: {
          integrationId,
          apiKey: apiKey,
          isConnected: true,
          syncStatus: 'idle',
          propertiesCount: 0
        }
      })

      return reply.send({
        success: true,
        data: hubspotSettings,
        message: 'HubSpot connected successfully'
      })
    } catch (error: any) {
      console.error('Error connecting HubSpot:', error)
      return reply.status(500).send({
        success: false,
        error: 'Failed to connect HubSpot'
      })
    }
  }

  async getHubSpotStatus(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { integrationId } = request.params as { integrationId: string }

      const hubspotSettings = await prisma.hubSpotSettings.findUnique({
        where: { integrationId }
      })

      if (!hubspotSettings) {
        return reply.send({
          success: true,
          data: {
            connected: false,
            lastSync: null,
            propertiesCount: 0,
            syncStatus: 'idle'
          }
        })
      }

      return reply.send({
        success: true,
        data: {
          connected: hubspotSettings.isConnected,
          lastSync: hubspotSettings.lastSync,
          propertiesCount: hubspotSettings.propertiesCount,
          syncStatus: hubspotSettings.syncStatus
        }
      })
    } catch (error: any) {
      console.error('Error getting HubSpot status:', error)
      return reply.status(500).send({
        success: false,
        error: 'Failed to get HubSpot status'
      })
    }
  }

  async createUser(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { integrationId } = request.params as { integrationId: string }
      const userData = request.body as CreateUserRequest

      const integration = await prisma.integrationSettings.findUnique({
        where: { id: integrationId }
      })

      if (!integration) {
        return reply.status(404).send({
          success: false,
          error: 'Integration not found'
        })
      }

      const sensayService = new SensayApiService(integration.organizationSecret)
      const sensayUser = await sensayService.createUser(userData)

      return reply.status(201).send({
        success: true,
        data: sensayUser,
        message: 'User created successfully in Sensay'
      })
    } catch (error: any) {
      console.error('Error creating user:', error)
      return reply.status(500).send({
        success: false,
        error: 'Failed to create user'
      })
    }
  }

  async getUsers(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { integrationId } = request.params as { integrationId: string }

      const integration = await prisma.integrationSettings.findUnique({
        where: { id: integrationId }
      })

      if (!integration) {
        return reply.status(404).send({
          success: false,
          error: 'Integration not found'
        })
      }

      const sensayService = new SensayApiService(integration.organizationSecret)
      const currentUser = await sensayService.getCurrentUser()

      return reply.send({
        success: true,
        data: [currentUser],
        message: 'Users retrieved successfully'
      })
    } catch (error: any) {
      console.error('Error getting users:', error)
      return reply.status(500).send({
        success: false,
        error: 'Failed to retrieve users'
      })
    }
  }

  async createReplica(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { integrationId } = request.params as { integrationId: string }
      const replicaData = request.body as CreateReplicaRequest

      const integration = await prisma.integrationSettings.findUnique({
        where: { id: integrationId }
      })

      if (!integration) {
        return reply.status(404).send({
          success: false,
          error: 'Integration not found'
        })
      }

      const sensayService = new SensayApiService(integration.organizationSecret)
      const sensayReplica = await sensayService.createReplica(replicaData)

      return reply.status(201).send({
        success: true,
        data: sensayReplica,
        message: 'Replica created successfully in Sensay'
      })
    } catch (error: any) {
      console.error('Error creating replica:', error)
      return reply.status(500).send({
        success: false,
        error: 'Failed to create replica'
      })
    }
  }

  async getReplicas(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { integrationId } = request.params as { integrationId: string }

      const integration = await prisma.integrationSettings.findUnique({
        where: { id: integrationId }
      })

      if (!integration) {
        return reply.status(404).send({
          success: false,
          error: 'Integration not found'
        })
      }

      const sensayService = new SensayApiService(integration.organizationSecret)
      const replicas = await sensayService.getReplicas()

      return reply.send({
        success: true,
        data: replicas,
        message: 'Replicas retrieved successfully'
      })
    } catch (error: any) {
      console.error('Error getting replicas:', error)
      return reply.status(500).send({
        success: false,
        error: 'Failed to retrieve replicas'
      })
    }
  }

  async getSyncLogs(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { integrationId } = request.params as { integrationId: string }

      const logs = await prisma.syncLog.findMany({
        where: { integrationId },
        orderBy: { createdAt: 'desc' },
        take: 50
      })

      return reply.send({
        success: true,
        data: logs,
        message: 'Sync logs retrieved successfully'
      })
    } catch (error: any) {
      console.error('Error getting sync logs:', error)
      return reply.status(500).send({
        success: false,
        error: 'Failed to retrieve sync logs'
      })
    }
  }
}