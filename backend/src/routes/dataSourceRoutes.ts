import { FastifyInstance } from 'fastify'
import { DataSourceController } from '../controllers/dataSourceController'

export async function dataSourceRoutes(fastify: FastifyInstance) {
  const dataSourceController = new DataSourceController()

  // Data source management
  fastify.post('/', dataSourceController.createDataSource.bind(dataSourceController))
  fastify.get('/', dataSourceController.getAllDataSources.bind(dataSourceController))
  fastify.get('/:id', dataSourceController.getDataSourceById.bind(dataSourceController))
  
  // Data synchronization
  fastify.post('/:id/sync', dataSourceController.syncDataSourceToSensay.bind(dataSourceController))
}
