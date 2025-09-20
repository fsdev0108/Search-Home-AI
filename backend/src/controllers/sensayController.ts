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
      const { replicaId } = request.body as { replicaId?: string }

      console.log('Starting HubSpot sync for integration:', integrationId)
      console.log('Target replica:', replicaId)

      await prisma.hubSpotSettings.upsert({
        where: { integrationId },
        update: { syncStatus: 'syncing' },
        create: {
          integrationId,
          apiKey: '', 
          isConnected: false,
          syncStatus: 'syncing',
          propertiesCount: 0
        }
      })

      const integration = await prisma.integrationSettings.findUnique({
        where: { id: integrationId }
      })

      if (!integration) {
        throw new Error('Integration not found')
      }

      const result = await fetchPropertiesFromHubSpot()
      
      let csvPath: string
      let csvContent: string
      let recordCount: number
      
      if (typeof result === 'object' && 'csvPath' in result) {
        // Using existing CSV file
        csvPath = result.csvPath
        csvContent = fs.readFileSync(csvPath, 'utf8')
        recordCount = result.recordCount
      } else {
        // Fallback: generate CSV from simulated data
        const properties = result as any[]
        csvPath = generateCSV(properties, `properties_integration_${integrationId}.csv`) || ''
        csvContent = fs.readFileSync(csvPath, 'utf8')
        recordCount = properties.length
      }

      // ALWAYS use environment variable
      const envOrgSecret = process.env.SENSAY_ORGANIZATION_SECRET
      if (!envOrgSecret) {
        return reply.status(500).send({
          success: false,
          error: 'SENSAY_ORGANIZATION_SECRET environment variable is required'
        })
      }
      const sensayService = new SensayApiService(envOrgSecret)
      let uploadResults = []

      if (replicaId) {
        // Send to specific replica only
        try {
          // Validate UUID format
          const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
          if (!uuidRegex.test(replicaId)) {
            throw new Error(`Invalid replica UUID format: "${replicaId}"`)
          }

          // Get replica info for the title
          const replicas = await sensayService.getReplicas()
          const targetReplica = replicas.find(r => r.uuid === replicaId)
          const replicaName = targetReplica?.name || 'Unknown Replica'

          // Upload CSV with properties
          await sensayService.uploadCSVToKnowledgeBase(
            replicaId,
            csvContent,
            `HubSpot Properties - ${replicaName}`
          )

          // Upload real estate agent instructions
          const fs = require('fs')
          const path = require('path')
          const instructionsPath = path.join(__dirname, '../templates/real-estate-agent-instructions.txt')
          
          if (fs.existsSync(instructionsPath)) {
            const instructionsContent = fs.readFileSync(instructionsPath, 'utf8')
            await sensayService.uploadTextToKnowledgeBase(
              replicaId,
              instructionsContent,
              'Real Estate Agent Instructions'
            )
          }

          uploadResults.push({
            replicaId: replicaId,
            replicaName: replicaName,
            status: 'success'
          })
        } catch (uploadError: any) {
          uploadResults.push({
            replicaId: replicaId,
            replicaName: 'Unknown',
            status: 'error',
            error: uploadError.message
          })
        }
      } else {
        // Fallback: send to all replicas (for backward compatibility)
        const replicas = await sensayService.getReplicas()
        console.log('No specific replica provided, sending to all replicas:', replicas.length)

        for (const replica of replicas) {
          try {
            // Check if UUID exists and is not empty
            if (!replica.uuid || replica.uuid.trim() === '') {
              uploadResults.push({
                replicaId: replica.uuid || 'empty',
                replicaName: replica.name,
                status: 'error',
                error: 'Empty or missing replica UUID'
              })
              continue
            }
            
            // Validate UUID format
            const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
            if (!uuidRegex.test(replica.uuid)) {
              uploadResults.push({
                replicaId: replica.uuid,
                replicaName: replica.name,
                status: 'error',
                error: `Invalid UUID format: "${replica.uuid}"`
              })
              continue
            }
            
            // Upload CSV with properties
            await sensayService.uploadCSVToKnowledgeBase(
              replica.uuid,
              csvContent,
              `HubSpot Properties - ${replica.name}`
            )

            // Upload real estate agent instructions
            const fs = require('fs')
            const path = require('path')
            const instructionsPath = path.join(__dirname, '../templates/real-estate-agent-instructions.txt')
            
            if (fs.existsSync(instructionsPath)) {
              const instructionsContent = fs.readFileSync(instructionsPath, 'utf8')
              await sensayService.uploadTextToKnowledgeBase(
                replica.uuid,
                instructionsContent,
                'Real Estate Agent Instructions'
              )
            }

            uploadResults.push({
              replicaId: replica.uuid,
              replicaName: replica.name,
              status: 'success'
            })
          } catch (uploadError: any) {
            uploadResults.push({
              replicaId: replica.uuid,
              replicaName: replica.name,
              status: 'error',
              error: uploadError.message
            })
          }
        }
      }

      await prisma.hubSpotSettings.upsert({
        where: { integrationId },
        update: {
          lastSync: new Date(),
          propertiesCount: recordCount,
          syncStatus: 'success'
        },
        create: {
          integrationId,
          apiKey: '', // Will be set when connecting
          isConnected: false,
          syncStatus: 'success',
          lastSync: new Date(),
          propertiesCount: recordCount
        }
      })

      return reply.send({
        success: true,
        message: 'HubSpot data synced successfully',
        data: {
          propertiesCount: recordCount,
          replicasUpdated: uploadResults.length,
          uploadResults: uploadResults
        }
      })

    } catch (error: any) {
      console.error('Error syncing HubSpot data:', error)
      
      const { integrationId } = request.params as { integrationId: string }
      await prisma.hubSpotSettings.upsert({
        where: { integrationId },
        update: {
          syncStatus: 'error',
          errorMessage: error.message
        },
        create: {
          integrationId,
          apiKey: '', // Will be set when connecting
          isConnected: false,
          syncStatus: 'error',
          errorMessage: error.message,
          propertiesCount: 0
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

      // ALWAYS use environment variable
      const envOrgSecret = process.env.SENSAY_ORGANIZATION_SECRET
      if (!envOrgSecret) {
        return reply.status(500).send({
          success: false,
          error: 'SENSAY_ORGANIZATION_SECRET environment variable is required'
        })
      }
      const sensayService = new SensayApiService(envOrgSecret)
      const sensayUser = await sensayService.createUser(userData)

      // Save user to local database
      const localUser = await prisma.user.create({
        data: {
          integrationId: integrationId,
          sensayUserId: sensayUser.id,
          name: sensayUser.name,
          email: sensayUser.email
        }
      })

      return reply.status(201).send({
        success: true,
        data: {
          ...sensayUser,
          localId: localUser.id
        },
        message: 'User created successfully in Sensay and saved locally'
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

      // Get users from local database
      const localUsers = await prisma.user.findMany({
        where: { integrationId: integrationId }
      })

      // Fetch details from Sensay API for each user
      // ALWAYS use environment variable
      const envOrgSecret = process.env.SENSAY_ORGANIZATION_SECRET
      if (!envOrgSecret) {
        return reply.status(500).send({
          success: false,
          error: 'SENSAY_ORGANIZATION_SECRET environment variable is required'
        })
      }
      const sensayService = new SensayApiService(envOrgSecret)
      const usersWithDetails = await Promise.all(
        localUsers.map(async (localUser) => {
          try {
            const sensayUser = await sensayService.getUser(localUser.sensayUserId)
            return {
              ...sensayUser,
              localId: localUser.id,
              createdAt: localUser.createdAt
            }
          } catch (error) {
            console.error(`Error fetching user ${localUser.sensayUserId} from Sensay:`, error)
            // Return local data if Sensay fetch fails
            return {
              id: localUser.sensayUserId,
              name: localUser.name,
              email: localUser.email,
              localId: localUser.id,
              createdAt: localUser.createdAt,
              error: 'Failed to fetch from Sensay'
            }
          }
        })
      )

      return reply.send({
        success: true,
        data: usersWithDetails,
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

      // ALWAYS use environment variable (consistent with getReplicas)
      const envOrgSecret = process.env.SENSAY_ORGANIZATION_SECRET
      if (!envOrgSecret) {
        return reply.status(500).send({
          success: false,
          error: 'SENSAY_ORGANIZATION_SECRET environment variable is required'
        })
      }

      console.log('🔍 Creating replica with org secret:', envOrgSecret.substring(0, 8) + '...')
      
      const sensayService = new SensayApiService(envOrgSecret)
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
      const user = (request as any).user

      const integration = await prisma.integrationSettings.findUnique({
        where: { id: integrationId }
      })

      if (!integration) {
        return reply.status(404).send({
          success: false,
          error: 'Integration not found'
        })
      }

      // Require authentication
      if (!user) {
        return reply.status(401).send({
          success: false,
          error: 'Authentication required'
        })
      }

      // Debug logging (without exposing secrets)
      console.log('🔍 Integration found:', {
        id: integration.id,
        organizationName: integration.organizationName,
        secretPrefix: integration.organizationSecret.substring(0, 8) + '...',
        createdAt: integration.createdAt,
        updatedAt: integration.updatedAt
      })

      // ALWAYS use environment variable (force override for production)
      const envOrgSecret = process.env.SENSAY_ORGANIZATION_SECRET
      const orgSecretToUse = envOrgSecret // Force env var, ignore database

      console.log('🔍 Organization secret source:', {
        fromEnv: !!envOrgSecret,
        envPrefix: envOrgSecret ? envOrgSecret.substring(0, 8) + '...' : 'not set',
        dbPrefix: integration.organizationSecret.substring(0, 8) + '...',
        usingPrefix: orgSecretToUse ? orgSecretToUse.substring(0, 8) + '...' : 'not set',
        forcedEnvVar: true
      })

      if (!orgSecretToUse) {
        return reply.status(500).send({
          success: false,
          error: 'SENSAY_ORGANIZATION_SECRET environment variable is required'
        })
      }

      const sensayService = new SensayApiService(orgSecretToUse)
      let replicas = await sensayService.getReplicas()

      console.log(`📊 Retrieved ${replicas.length} replicas from Sensay API`)

      // Filter replicas based on user role
      if (user.role !== 'admin') {
        // For regular users, only show replicas they own
        const currentUserId = user.id
        replicas = replicas.filter(replica => 
          replica.owner_uuid === currentUserId || replica.ownerID === currentUserId
        )
        console.log(`🔒 Filtered to ${replicas.length} replicas for user ${currentUserId}`)
      }

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

  async getKnowledgeBase(request: any, reply: any) {
    try {
      const { replicaUUID } = request.params

      if (!replicaUUID) {
        return reply.status(400).send({
          success: false,
          error: 'Replica UUID is required'
        })
      }

      // Get organization secret from environment
      const organizationSecret = process.env.SENSAY_ORGANIZATION_SECRET
      if (!organizationSecret) {
        return reply.status(500).send({
          success: false,
          error: 'Organization secret not configured'
        })
      }

      const sensayService = new SensayApiService(organizationSecret)
      const knowledgeBase = await sensayService.getKnowledgeBaseEntries(replicaUUID)

      return reply.send({
        success: true,
        data: knowledgeBase,
        message: 'Knowledge base retrieved successfully'
      })
    } catch (error: any) {
      console.error('Error getting knowledge base:', error)
      return reply.status(500).send({
        success: false,
        error: 'Failed to retrieve knowledge base'
      })
    }
  }

  async getKnowledgeBaseEntry(request: any, reply: any) {
    try {
      const { replicaUUID, knowledgeBaseID } = request.params

      if (!replicaUUID || !knowledgeBaseID) {
        return reply.status(400).send({
          success: false,
          error: 'Replica UUID and Knowledge Base ID are required'
        })
      }

      // Get organization secret from environment
      const organizationSecret = process.env.SENSAY_ORGANIZATION_SECRET
      if (!organizationSecret) {
        return reply.status(500).send({
          success: false,
          error: 'Organization secret not configured'
        })
      }

      const sensayService = new SensayApiService(organizationSecret)
      const entry = await sensayService.getKnowledgeBaseEntry(replicaUUID, knowledgeBaseID)

      return reply.send({
        success: true,
        data: entry,
        message: 'Knowledge base entry retrieved successfully'
      })
    } catch (error: any) {
      console.error('Error getting knowledge base entry:', error)
      return reply.status(500).send({
        success: false,
        error: 'Failed to retrieve knowledge base entry'
      })
    }
  }

  async deleteKnowledgeBaseEntry(request: any, reply: any) {
    try {
      const { replicaUUID, knowledgeBaseID } = request.params

      if (!replicaUUID || !knowledgeBaseID) {
        return reply.status(400).send({
          success: false,
          error: 'Replica UUID and Knowledge Base ID are required'
        })
      }

      const organizationSecret = process.env.SENSAY_ORGANIZATION_SECRET
      if (!organizationSecret) {
        return reply.status(500).send({
          success: false,
          error: 'Organization secret not configured'
        })
      }

      const sensayService = new SensayApiService(organizationSecret)
      await sensayService.deleteKnowledgeBaseEntry(replicaUUID, knowledgeBaseID)

      return reply.send({
        success: true,
        message: 'Knowledge base entry deleted successfully'
      })
    } catch (error: any) {
      console.error('Error deleting knowledge base entry:', error)
      return reply.status(500).send({
        success: false,
        error: 'Failed to delete knowledge base entry'
      })
    }
  }
}