
const API_CONFIG = {
  // URL base da API (backend)
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
  
  // Versão da API
  VERSION: import.meta.env.VITE_API_VERSION || 'v1',
  
  ENDPOINTS: {
    AUTH: {
      LOGIN: '/auth/login',
      REGISTER: '/auth/register',
      ME: '/auth/me',
      LOGOUT: '/auth/logout'
    },
    USERS: '/users',
    REPLICAS: '/replicas',
    UPLOADS: '/uploads'
  }
}

export const buildApiUrl = (endpoint) => {
  let url
  if (API_CONFIG.BASE_URL.includes('/api')) {
    url = `${API_CONFIG.BASE_URL}/v1${endpoint}`
  } else {
    url = `${API_CONFIG.BASE_URL}/api/v1${endpoint}`
  }
  
  return url
}

export const apiRequest = async (endpoint, options = {}) => {
  const url = buildApiUrl(endpoint)
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    }
  }

  const token = localStorage.getItem('authToken')
  if (token) {
    defaultOptions.headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(url, {
    ...defaultOptions,
    ...options
  })

  return response
}

export default API_CONFIG
