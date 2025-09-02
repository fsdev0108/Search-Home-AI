import { prisma } from '../lib/prisma'
import { v4 as uuidv4 } from 'uuid'

interface DataSource {
  id: string
  clientId: string
  name: string
  type: string
  config: any
  schedule: string
  lastSync: Date
  status: string
}

interface CreateDataSourceRequest {
  clientId: string
  name: string
  type: string
  config: any
  schedule: string
}

export class DataSourceService {
  async createDataSource(data: CreateDataSourceRequest): Promise<DataSource> {
    const dataSource = await prisma.dataConnector.create({
      data: {
        name: data.name,
        type: data.type,
        config: JSON.stringify(data.config),
        status: 'active',
        lastSync: new Date(),
        syncCount: 0,
        errorCount: 0
      }
    })

    return {
      id: dataSource.id,
      clientId: data.clientId,
      name: dataSource.name,
      type: dataSource.type,
      config: JSON.parse(dataSource.config),
      schedule: data.schedule,
      lastSync: dataSource.lastSync || new Date(),
      status: dataSource.status
    }
  }

  async getDataSourceById(id: string): Promise<DataSource | null> {
    const dataSource = await prisma.dataConnector.findUnique({
      where: { id }
    })

    if (!dataSource) return null

    return {
      id: dataSource.id,
      clientId: 'default', // For now, single client
      name: dataSource.name,
      type: dataSource.type,
      config: JSON.parse(dataSource.config),
      schedule: 'daily', // Default schedule
      lastSync: dataSource.lastSync || new Date(),
      status: dataSource.status
    }
  }

  async getAllDataSources(): Promise<DataSource[]> {
    const dataSources = await prisma.dataConnector.findMany()

    return dataSources.map((ds: any) => ({
      id: ds.id,
      clientId: 'default',
      name: ds.name,
      type: ds.type,
      config: JSON.parse(ds.config),
      schedule: 'daily',
      lastSync: ds.lastSync || new Date(),
      status: ds.status
    }))
  }

  async syncDataSourceToSensay(dataSourceId: string, replicaUuid: string): Promise<{ success: boolean; dataCount: number }> {
    const dataSource = await this.getDataSourceById(dataSourceId)
    if (!dataSource) throw new Error('Data source not found')

    try {
      // Fetch raw data from source
      const rawData = await this.fetchRawData(dataSource)
      
      // Convert to file (CSV/JSON) for Sensay
      const filePath = await this.createDataFile(rawData, dataSource.name)
      
      // For now, we'll just create the file and return success
      // The actual upload to Sensay can be handled by the existing flow

      // Update sync status
      await this.updateSyncStatus(dataSourceId, true)

      return {
        success: true,
        dataCount: Array.isArray(rawData) ? rawData.length : 1
      }
    } catch (error) {
      await this.updateSyncStatus(dataSourceId, false)
      throw error
    }
  }

  private async fetchRawData(dataSource: DataSource): Promise<any> {
    switch (dataSource.type) {
      case 'api':
        return await this.fetchFromAPI(dataSource.config)
      case 'database':
        return await this.fetchFromDatabase(dataSource.config)
      case 'file':
        return await this.fetchFromFile(dataSource.config)
      case 'webhook':
        return await this.fetchFromWebhook(dataSource.config)
      default:
        throw new Error(`Unsupported data source type: ${dataSource.type}`)
    }
  }

  private async fetchFromAPI(config: any): Promise<any> {
    const { url, method = 'GET', headers = {} } = config
    
    if (!url) throw new Error('API URL not configured')

    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    })

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`)
    }

    return await response.json()
  }

  private async fetchFromDatabase(config: any): Promise<any> {
    // For database connections, we would execute queries
    // This is a placeholder for future implementation
    throw new Error('Database sync not implemented yet')
  }

  private async fetchFromFile(config: any): Promise<any> {
    // For file imports, we would read and parse files
    // This is a placeholder for future implementation
    throw new Error('File sync not implemented yet')
  }

  private async fetchFromWebhook(config: any): Promise<any> {
    // For webhooks, we would process queued events
    // This is a placeholder for future implementation
    throw new Error('Webhook sync not implemented yet')
  }

  private async createDataFile(data: any, name: string): Promise<string> {
    // Create a temporary file with the raw data
    // For now, we'll create a JSON file
    const fs = require('fs')
    const path = require('path')
    
    const fileName = `${name}_${Date.now()}.json`
    const filePath = path.join(process.env.UPLOAD_DIR || './uploads', fileName)
    
    // Ensure directory exists
    const dir = path.dirname(filePath)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    
    // Write data to file
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2))
    
    return filePath
  }

  private async updateSyncStatus(dataSourceId: string, success: boolean): Promise<void> {
    await prisma.dataConnector.update({
      where: { id: dataSourceId },
      data: {
        lastSync: new Date(),
        syncCount: { increment: 1 },
        errorCount: success ? undefined : { increment: 1 },
        status: success ? 'active' : 'error'
      }
    })
  }
}
