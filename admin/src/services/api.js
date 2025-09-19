// API Configuration - ONLY Backend calls
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'https://sensay-search-home-ai-production.up.railway.app/api'
}

// Generic API call function to backend only
async function apiCall(endpoint, options = {}) {
  try {
    // Get auth token from localStorage
    const token = localStorage.getItem('authToken')
    
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    }
    
    // Add Authorization header if token exists
    if (token) {
      headers.Authorization = `Bearer ${token}`
    }

    const response = await fetch(`${API_CONFIG.BASE_URL}/v1${endpoint}`, {
      headers,
      ...options
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('API Error:', error)
    throw error
  }
}

// Integrations API - Backend only
export const integrationsAPI = {
  // Get all integrations
  getAll: () => apiCall('/integrations'),
  
  // Get integration by ID
  getById: (id) => apiCall(`/integrations/${id}`),
  
  // Create new integration
  create: (integrationData) => apiCall('/integrations', {
    method: 'POST',
    body: JSON.stringify(integrationData)
  }),
  
  // Update integration
  update: (id, integrationData) => apiCall(`/integrations/${id}`, {
    method: 'PUT',
    body: JSON.stringify(integrationData)
  }),
  
  // Delete integration
  delete: (id) => apiCall(`/integrations/${id}`, {
    method: 'DELETE'
  })
}

// Users API - Backend only (via integrations)
export const usersAPI = {
  // Get all users for an integration
  getAll: (integrationId) => apiCall(`/integrations/${integrationId}/users`),
  
  // Get user by ID (not available in Sensay API)
  getById: (integrationId, userId) => apiCall(`/integrations/${integrationId}/users/${userId}`),
  
  // Create new user (backend handles Sensay integration)
  create: (integrationId, userData) => apiCall(`/integrations/${integrationId}/users`, {
    method: 'POST',
    body: JSON.stringify(userData)
  }),
  
  // Update user (not available in Sensay API)
  update: (integrationId, userId, userData) => apiCall(`/integrations/${integrationId}/users/${userId}`, {
    method: 'PUT',
    body: JSON.stringify(userData)
  }),
  
  // Delete user (not available in Sensay API)
  delete: (integrationId, userId) => apiCall(`/integrations/${integrationId}/users/${userId}`, {
    method: 'DELETE'
  })
}

// Replicas API - Backend only (via integrations)
export const replicasAPI = {
  // Get all replicas for an integration
  getAll: (integrationId) => apiCall(`/integrations/${integrationId}/replicas`),
  
  // Get replica by UUID (not available in Sensay API)
  getByUuid: (integrationId, uuid) => apiCall(`/integrations/${integrationId}/replicas/${uuid}`),
  
  // Create new replica (backend handles Sensay integration)
  create: (integrationId, replicaData) => apiCall(`/integrations/${integrationId}/replicas`, {
    method: 'POST',
    body: JSON.stringify(replicaData)
  }),
  
  // Update replica (not available in Sensay API)
  update: (integrationId, uuid, replicaData) => apiCall(`/integrations/${integrationId}/replicas/${uuid}`, {
    method: 'PUT',
    body: JSON.stringify(replicaData)
  }),
  
  // Delete replica (not available in Sensay API)
  delete: (integrationId, uuid) => apiCall(`/integrations/${integrationId}/replicas/${uuid}`, {
    method: 'DELETE'
  })
}

// HubSpot API - Backend only (via integrations)
export const hubspotAPI = {
  // Connect HubSpot to integration
  connect: (integrationId, apiKey) => apiCall(`/integrations/${integrationId}/hubspot/connect`, {
    method: 'POST',
    body: JSON.stringify({ apiKey })
  }),
  
  // Get HubSpot connection status
  getStatus: (integrationId) => apiCall(`/integrations/${integrationId}/hubspot/status`),
  
  // Sync HubSpot data
  sync: (integrationId, data) => apiCall(`/integrations/${integrationId}/hubspot/sync`, {
    method: 'POST',
    body: JSON.stringify(data)
  })
}

// Sync Logs API - Backend only (via integrations)
export const syncLogsAPI = {
  // Get sync logs for an integration
  getAll: (integrationId) => apiCall(`/integrations/${integrationId}/logs`)
}

// Files API - Backend only
export const filesAPI = {
  // Get all files
  getAll: () => apiCall('/files'),
  
  // Get file by ID
  getById: (id) => apiCall(`/files/${id}`),
  
  // Upload file (backend handles Sensay integration)
  upload: (formData) => fetch(`${API_CONFIG.BASE_URL}/files/upload`, {
    method: 'POST',
    body: formData
  }),
  
  // Delete file
  delete: (id) => apiCall(`/files/${id}`, {
    method: 'DELETE'
  }),
  
  // Download file
  download: (id) => apiCall(`/files/${id}/download`),
  
  // Get files count
  getCount: () => apiCall('/files/count')
}

// Dashboard API - Backend only
// Knowledge Base API
export const knowledgeBaseAPI = {
  getKnowledgeBase: (replicaUUID) => apiCall(`/replicas/${replicaUUID}/knowledge-base`),
  getKnowledgeBaseEntry: (replicaUUID, knowledgeBaseID) => apiCall(`/replicas/${replicaUUID}/knowledge-base/${knowledgeBaseID}`),
  deleteKnowledgeBaseEntry: (replicaUUID, knowledgeBaseID) => apiCall(`/replicas/${replicaUUID}/knowledge-base/${knowledgeBaseID}`, {
    method: 'DELETE'
  })
}

// Auth API - Backend only
export const authAPI = {
  login: (email, password) => apiCall('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  })
}



export const dashboardAPI = {
  // Get dashboard statistics for an integration
  getStats: async (integrationId) => {
    try {
      const [users, replicas, syncLogs] = await Promise.all([
        usersAPI.getAll(integrationId),
        replicasAPI.getAll(integrationId),
        syncLogsAPI.getAll(integrationId)
      ])
      
      return {
        users: users.data?.length || 0,
        replicas: replicas.data?.length || 0,
        syncLogs: syncLogs.data?.length || 0,
        lastSync: syncLogs.data?.[0]?.createdAt || null
      }
    } catch (error) {
      console.error('Error loading dashboard stats:', error)
      return { users: 0, replicas: 0, syncLogs: 0, lastSync: null }
    }
  }
}

// Telegram API
export const telegramAPI = {
  // Test bot token
  testBot: (botToken) => apiCall('/telegram/test', {
    method: 'POST',
    body: JSON.stringify({ botToken })
  }),

  // Create Telegram integration
  createIntegration: (integrationId, botToken, replicaId) => apiCall('/telegram/integrations', {
    method: 'POST',
    body: JSON.stringify({ integrationId, botToken, replicaId })
  }),

  // Get Telegram integration
  getIntegration: (integrationId) => apiCall(`/telegram/integrations/${integrationId}`),

  // Update Telegram integration
  updateIntegration: (integrationId, data) => apiCall(`/telegram/integrations/${integrationId}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),

  // Activate bot (set webhook)
  activateBot: (integrationId, webhookUrl) => apiCall(`/telegram/integrations/${integrationId}/activate`, {
    method: 'POST',
    body: JSON.stringify({ webhookUrl })
  }),

  // Delete Telegram integration
  deleteIntegration: (integrationId) => apiCall(`/telegram/integrations/${integrationId}`, {
    method: 'DELETE'
  })
}

export default {
  integrations: integrationsAPI,
  users: usersAPI,
  replicas: replicasAPI,
  hubspot: hubspotAPI,
  telegram: telegramAPI,
  syncLogs: syncLogsAPI,
  files: filesAPI,
  knowledgeBase: knowledgeBaseAPI,
  dashboard: dashboardAPI
}
