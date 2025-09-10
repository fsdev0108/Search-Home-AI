export const config = {
  port: process.env.PORT || 3000,
  host: process.env.HOST || '0.0.0.0',
  nodeEnv: process.env.NODE_ENV || 'development',
  cors: {
    origin: process.env.CORS_ORIGIN 
      ? process.env.CORS_ORIGIN.split(',') 
      : true, // Permite qualquer origem
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  },
  api: {
    prefix: '/api/v1'
  },
  sensay: {
    baseUrl: process.env.SENSAY_BASE_URL || 'https://api.sensay.io/v1',
    organizationSecret: process.env.SENSAY_ORGANIZATION_SECRET || '',
    apiVersion: process.env.SENSAY_API_VERSION || '2025-03-25'
  },
  upload: {
    maxFileSize: 50 * 1024 * 1024, // 50MB
    allowedTypes: ['.xlsx', '.xls', '.csv'],
    uploadDir: process.env.UPLOAD_DIR || './uploads'
  }
}

export type Config = typeof config
