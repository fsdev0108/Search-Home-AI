import { FastifyRequest, FastifyReply } from 'fastify'
import { DataSourceService } from '../services/dataSourceService'
import { ResponseHandler } from '../utils/response'

interface CreateDataSourceRequest {
  Body: {
    clientId: string
    name: string
    type: string
    config: any
    schedule: string
  }
}

interface SyncDataSourceRequest {
  Params: { id: string }
  Body: {
    replicaUuid: string
  }
}

export class DataSourceController {
  private dataSourceService: DataSourceService

  constructor() {
    this.dataSourceService = new DataSourceService()
  }

  async createDataSource(request: FastifyRequest<CreateDataSourceRequest>, reply: FastifyReply) {
    try {
      const { clientId, name, type, config, schedule } = request.body

      const dataSource = await this.dataSourceService.createDataSource({
        clientId,
        name,
        type,
        config,
        schedule
      })

      return ResponseHandler.success(reply, dataSource, 'Data source created successfully', 201)
    } catch (error) {
      return ResponseHandler.error(reply, 'Failed to create data source')
    }
  }

  async getDataSourceById(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    try {
      const { id } = request.params
      const dataSource = await this.dataSourceService.getDataSourceById(id)

      if (!dataSource) {
        return ResponseHandler.error(reply, 'Data source not found', 404)
      }

      return ResponseHandler.success(reply, dataSource, 'Data source retrieved successfully')
    } catch (error) {
      return ResponseHandler.error(reply, 'Failed to retrieve data source')
    }
  }

  async getAllDataSources(request: FastifyRequest, reply: FastifyReply) {
    try {
      const dataSources = await this.dataSourceService.getAllDataSources()
      return ResponseHandler.success(reply, dataSources, 'Data sources retrieved successfully')
    } catch (error) {
      return ResponseHandler.error(reply, 'Failed to retrieve data sources')
    }
  }

  async syncDataSourceToSensay(request: FastifyRequest<SyncDataSourceRequest>, reply: FastifyReply) {
    try {
      const { id } = request.params
      const { replicaUuid } = request.body

      const result = await this.dataSourceService.syncDataSourceToSensay(id, replicaUuid)
      return ResponseHandler.success(reply, result, 'Data source synchronized successfully')
    } catch (error) {
      return ResponseHandler.error(reply, 'Failed to synchronize data source')
    }
  }
}
