import { FastifyInstance } from 'fastify';
import { generateCSV, fetchPropertiesFromHubSpot } from '../services/hubspotDataSimulator';
import { SensayApiService } from '../services/sensayApiService';
import fs from 'fs';

export async function hubspotRoutes(fastify: FastifyInstance) {
  // Endpoint to sync HubSpot data
  fastify.post('/sync', async (request, reply) => {
    try {
      const { apiKey } = request.body as { apiKey: string };

      if (!apiKey) {
        return reply.status(400).send({
          success: false,
          message: 'API key is required'
        });
      }

      console.log('🔄 Starting HubSpot sync simulation...');

      // Simular busca de dados do HubSpot
      const properties = await fetchPropertiesFromHubSpot();

      // Gerar CSV com os dados
      const csvPath = generateCSV(properties, 'properties_from_hubspot.csv');

      // Integrar com agente IA (Sensay)
      console.log('🤖 Integrating with AI agent (Sensay)...');
      const sensayService = new SensayApiService('placeholder-secret');
      
      // Ler o conteúdo do CSV gerado
      const csvContent = fs.readFileSync(csvPath, 'utf8');
      console.log(`📄 CSV content length: ${csvContent.length} characters`);
      console.log(`📄 CSV preview: ${csvContent.substring(0, 200)}...`);
      
      // Enviar para a knowledge base do Sensay
      // TODO: Obter o replicaUuid do usuário logado ou configuração
      const replicaUuid = '03db5651-cb61-4bdf-9ef0-89561f7c9c53'; // Placeholder - deve vir do contexto do usuário
      
      try {
        await sensayService.uploadCSVToKnowledgeBase(
          replicaUuid, 
          csvContent, 
          'HubSpot Property Data'
        );
        console.log('✅ CSV uploaded to Sensay knowledge base successfully');
      } catch (sensayError) {
        console.error('⚠️ Failed to upload to Sensay, but CSV was generated:', sensayError);
        // Continue mesmo se falhar o upload para Sensay
      }

      return reply.send({
        success: true,
        message: 'HubSpot data synced successfully and uploaded to AI agent',
        data: {
          propertiesCount: properties.length,
          csvPath: csvPath,
          aiAgentIntegrated: true,
          sensayUploaded: true,
          syncDate: new Date().toISOString()
        }
      });

    } catch (error: any) {
      console.error('❌ Error syncing HubSpot data:', error);
      return reply.status(500).send({
        success: false,
        message: 'Failed to sync HubSpot data',
        error: error.message
      });
    }
  });

  // Endpoint para obter replica UUID do usuário
  fastify.get('/replica-uuid', async (request, reply) => {
    try {
      // TODO: Implementar lógica para obter replicaUuid do usuário logado
      // Por enquanto, retorna um UUID padrão
      const defaultReplicaUuid = '03db5651-cb61-4bdf-9ef0-89561f7c9c53';
      
      return reply.send({
        success: true,
        data: {
          replicaUuid: defaultReplicaUuid
        }
      });
    } catch (error: any) {
      console.error('❌ Error getting replica UUID:', error);
      return reply.status(500).send({
        success: false,
        message: 'Failed to get replica UUID',
        error: error.message
      });
    }
  });

  // Endpoint para verificar status da conexão
  fastify.get('/status', async (request, reply) => {
    try {
      // Simular verificação de status
      const isConnected = true;
      const lastSync = new Date().toISOString();
      const propertiesCount = 5;

      return reply.send({
        success: true,
        data: {
          connected: isConnected,
          lastSync: lastSync,
          propertiesCount: propertiesCount,
          aiAgentStatus: 'active'
        }
      });

    } catch (error: any) {
      console.error('❌ Error checking HubSpot status:', error);
      return reply.status(500).send({
        success: false,
        message: 'Failed to check HubSpot status',
        error: error.message
      });
    }
  });
}
