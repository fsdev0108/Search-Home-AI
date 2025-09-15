import axios, { AxiosInstance } from 'axios'

export interface SensayUser {
  id: string
  email: string
  name: string
  linkedAccounts?: Array<{
    accountID: string
    accountType: 'discord' | 'telegram' | 'embed'
  }>
}

export interface SensayReplica {
  id: string
  name: string
  purpose: string
  shortDescription: string
  greeting: string
  type: 'character' | 'assistant'
  ownerID: string
  private: boolean
  slug: string
  tags: string[]
  profileImage?: string
  suggestedQuestions: string[]
  llm: {
    model: string
    memoryMode: string
    systemMessage: string
    tools: string[]
  }
  voicePreviewText: string
  isEveryConversationAccessibleBySupport: boolean
}

export interface CreateUserRequest {
  email: string
  name: string
  id?: string
  linkedAccounts?: Array<{
    accountID: string
    accountType: 'discord' | 'telegram' | 'embed'
  }>
}

export interface CreateReplicaRequest {
  name: string
  purpose: string
  shortDescription: string
  greeting: string
  type?: 'character' | 'assistant'
  ownerID: string
  private?: boolean
  whitelistEmails?: string[]
  slug: string
  tags?: string[]
  profileImage?: string
  suggestedQuestions?: string[]
  llm: {
    model: string
    memoryMode: string
    systemMessage: string
    tools?: string[]
  }
  voicePreviewText: string
  isEveryConversationAccessibleBySupport?: boolean
}

export interface KnowledgeBaseUploadRequest {
  title: string
  text: string
  filename: string
  url?: string
  autoRefresh?: boolean
}

export class SensayApiService {
  private api: AxiosInstance
  private organizationSecret: string

  constructor(organizationSecret: string) {
    this.organizationSecret = organizationSecret
    this.api = axios.create({
      baseURL: 'https://api.sensay.io/v1',
      headers: {
        'X-ORGANIZATION-SECRET': organizationSecret,
        'Content-Type': 'application/json',
        'X-API-Version': '2025-03-25'
      }
    })
  }

  // User Management
  async createUser(userData: CreateUserRequest): Promise<SensayUser> {
    try {
      const response = await this.api.post('/users', userData)
      return response.data
    } catch (error: any) {
      console.error('Error creating user in Sensay:', error.response?.data || error.message)
      throw new Error(`Failed to create user: ${error.response?.data?.message || error.message}`)
    }
  }

  async getUser(userId: string): Promise<SensayUser> {
    try {
      const response = await this.api.get(`/users/${userId}`)
      return response.data
    } catch (error: any) {
      console.error('Error getting user from Sensay:', error.response?.data || error.message)
      throw new Error(`Failed to get user: ${error.response?.data?.message || error.message}`)
    }
  }

  async getCurrentUser(): Promise<SensayUser> {
    try {
      const response = await this.api.get('/users/me')
      return response.data
    } catch (error: any) {
      console.error('Error getting current user from Sensay:', error.response?.data || error.message)
      throw new Error(`Failed to get current user: ${error.response?.data?.message || error.message}`)
    }
  }

  async updateUser(userId: string, updates: Partial<CreateUserRequest>): Promise<SensayUser> {
    try {
      const response = await this.api.put(`/users/${userId}`, updates)
      return response.data
    } catch (error: any) {
      console.error('Error updating user in Sensay:', error.response?.data || error.message)
      throw new Error(`Failed to update user: ${error.response?.data?.message || error.message}`)
    }
  }

  async deleteUser(userId: string): Promise<void> {
    try {
      await this.api.delete(`/users/${userId}`)
    } catch (error: any) {
      console.error('Error deleting user from Sensay:', error.response?.data || error.message)
      throw new Error(`Failed to delete user: ${error.response?.data?.message || error.message}`)
    }
  }

  // Replica Management
  async createReplica(replicaData: CreateReplicaRequest): Promise<SensayReplica> {
    try {
      const response = await this.api.post('/replicas', replicaData)
      return response.data
    } catch (error: any) {
      console.error('Error creating replica in Sensay:', error.response?.data || error.message)
      throw new Error(`Failed to create replica: ${error.response?.data?.message || error.message}`)
    }
  }

  async getReplica(replicaId: string): Promise<SensayReplica> {
    try {
      const response = await this.api.get(`/replicas/${replicaId}`)
      return response.data
    } catch (error: any) {
      console.error('Error getting replica from Sensay:', error.response?.data || error.message)
      throw new Error(`Failed to get replica: ${error.response?.data?.message || error.message}`)
    }
  }

  async getReplicas(): Promise<SensayReplica[]> {
    try {
      const response = await this.api.get('/replicas')
      return response.data.items || []
    } catch (error: any) {
      console.error('Error getting replicas from Sensay:', error.response?.data || error.message)
      throw new Error(`Failed to get replicas: ${error.response?.data?.message || error.message}`)
    }
  }

  async updateReplica(replicaId: string, updates: Partial<CreateReplicaRequest>): Promise<SensayReplica> {
    try {
      const response = await this.api.put(`/replicas/${replicaId}`, updates)
      return response.data
    } catch (error: any) {
      console.error('Error updating replica in Sensay:', error.response?.data || error.message)
      throw new Error(`Failed to update replica: ${error.response?.data?.message || error.message}`)
    }
  }

  async deleteReplica(replicaId: string): Promise<void> {
    try {
      await this.api.delete(`/replicas/${replicaId}`)
    } catch (error: any) {
      console.error('Error deleting replica from Sensay:', error.response?.data || error.message)
      throw new Error(`Failed to delete replica: ${error.response?.data?.message || error.message}`)
    }
  }

  // Knowledge Base Management
  async uploadToKnowledgeBase(replicaId: string, data: KnowledgeBaseUploadRequest): Promise<any> {
    try {
      const response = await this.api.post(`/replicas/${replicaId}/knowledge-base`, data)
      return response.data
    } catch (error: any) {
      console.error('Error uploading to knowledge base:', error.response?.data || error.message)
      throw new Error(`Failed to upload to knowledge base: ${error.response?.data?.message || error.message}`)
    }
  }

  async uploadCSVToKnowledgeBase(replicaId: string, csvContent: string, title: string = 'Property Data'): Promise<any> {
    return this.uploadToKnowledgeBase(replicaId, {
      title: title,
      text: csvContent,
      filename: 'properties.csv',
      autoRefresh: false
    })
  }

  async getKnowledgeBaseEntries(replicaId: string): Promise<any[]> {
    try {
      const response = await this.api.get(`/replicas/${replicaId}/knowledge-base`)
      return response.data.items || []
    } catch (error: any) {
      console.error('Error getting knowledge base entries:', error.response?.data || error.message)
      throw new Error(`Failed to get knowledge base entries: ${error.response?.data?.message || error.message}`)
    }
  }

  async deleteKnowledgeBaseEntry(replicaId: string, entryId: string): Promise<void> {
    try {
      await this.api.delete(`/replicas/${replicaId}/knowledge-base/${entryId}`)
    } catch (error: any) {
      console.error('Error deleting knowledge base entry:', error.response?.data || error.message)
      throw new Error(`Failed to delete knowledge base entry: ${error.response?.data?.message || error.message}`)
    }
  }

  // Authentication helpers
  async authenticateAsUser(userId: string): Promise<AxiosInstance> {
    return axios.create({
      baseURL: 'https://api.sensay.io/v1',
      headers: {
        'X-ORGANIZATION-SECRET': this.organizationSecret,
        'X-USER-ID': userId,
        'Content-Type': 'application/json',
        'X-API-Version': '2025-03-25'
      }
    })
  }

  async authenticateAsUserByAccountId(userId: string, accountType: string): Promise<AxiosInstance> {
    return axios.create({
      baseURL: 'https://api.sensay.io/v1',
      headers: {
        'X-ORGANIZATION-SECRET': this.organizationSecret,
        'X-USER-ID': userId,
        'X-USER-ID-TYPE': accountType,
        'Content-Type': 'application/json',
        'X-API-Version': '2025-03-25'
      }
    })
  }

  // Utility methods
  async testConnection(): Promise<boolean> {
    try {
      await this.getCurrentUser()
      return true
    } catch (error) {
      console.error('Sensay API connection test failed:', error)
      return false
    }
  }

  async getOrganizationInfo(): Promise<any> {
    try {
      // This would need to be implemented based on Sensay's organization endpoints
      // For now, we'll use the current user as a proxy
      const currentUser = await this.getCurrentUser()
      return {
        organizationSecret: this.organizationSecret,
        currentUser: currentUser
      }
    } catch (error: any) {
      console.error('Error getting organization info:', error.response?.data || error.message)
      throw new Error(`Failed to get organization info: ${error.response?.data?.message || error.message}`)
    }
  }
}
