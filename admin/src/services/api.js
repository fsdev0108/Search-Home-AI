// API Configuration - ONLY Backend calls
const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'
}

// Generic API call function to backend only
async function apiCall(endpoint, options = {}) {
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
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

// Users API - Backend only
export const usersAPI = {
  // Get all users
  getAll: () => apiCall('/users'),
  
  // Get user by ID
  getById: (id) => apiCall(`/users/${id}`),
  
  // Create new user (backend handles Sensay integration)
  create: (userData) => apiCall('/users', {
    method: 'POST',
    body: JSON.stringify(userData)
  }),
  
  // Update user
  update: (id, userData) => apiCall(`/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(userData)
  }),
  
  // Delete user
  delete: (id) => apiCall(`/users/${id}`, {
    method: 'DELETE'
  }),
  
  // Get users count
  getCount: () => apiCall('/users/count')
}

// Replicas API - Backend only
export const replicasAPI = {
  // Get all replicas
  getAll: () => apiCall('/replicas'),
  
  // Get replica by UUID
  getByUuid: (uuid) => apiCall(`/replicas/${uuid}`),
  
  // Create new replica (backend handles Sensay integration)
  create: (replicaData) => apiCall('/replicas', {
    method: 'POST',
    body: JSON.stringify(replicaData)
  }),
  
  // Update replica
  update: (uuid, replicaData) => apiCall(`/replicas/${uuid}`, {
    method: 'PUT',
    body: JSON.stringify(replicaData)
  }),
  
  // Delete replica
  delete: (uuid) => apiCall(`/replicas/${uuid}`, {
    method: 'DELETE'
  }),
  
  // Get replicas count
  getCount: () => apiCall('/replicas/count')
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
export const dashboardAPI = {
  // Get dashboard statistics
  getStats: async () => {
    try {
      const [usersCount, replicasCount, filesCount] = await Promise.all([
        usersAPI.getCount(),
        replicasAPI.getCount(),
        filesAPI.getCount()
      ])
      
      return {
        users: usersCount.count || 0,
        replicas: replicasCount.count || 0,
        files: filesCount.count || 0,
        storage: (filesCount.count || 0) * 2.5 // 2.5MB per file average
      }
    } catch (error) {
      console.error('Error loading dashboard stats:', error)
      return { users: 0, replicas: 0, files: 0, storage: 0 }
    }
  }
}

export default {
  users: usersAPI,
  replicas: replicasAPI,
  files: filesAPI,
  dashboard: dashboardAPI
}
