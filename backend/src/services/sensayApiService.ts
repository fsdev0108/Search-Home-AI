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
  uuid: string
  name: string
  slug: string
  profile_image: string
  short_description: string
  introduction: string
  tags: string[]
  created_at: string
  owner_uuid: string
  voice_enabled: boolean
  video_enabled: boolean
  chat_history_count: number
  system_message: string
  private: boolean
  telegram_integration?: any
  discord_integration?: any
  profileImage: string
  shortDescription: string
  greeting: string
  ownerID: string
  type: 'character' | 'assistant'
  whitelistEmails: string[]
  suggestedQuestions: string[]
  llm: {
    model: string
    systemMessage: string
    tools: string[]
  }
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
  text?: string
  filename?: string
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

  async getAllUsers(): Promise<SensayUser[]> {
    try {
      const response = await this.api.get('/users')
      return response.data.items || response.data || []
    } catch (error: any) {
      console.error('Error getting all users from Sensay:', error.response?.data || error.message)
      throw new Error(`Failed to get users: ${error.response?.data?.message || error.message}`)
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
      // Add default LLM configuration if not provided
      const replicaPayload = {
        ...replicaData,
        llm: replicaData.llm || {}
      }
      
      const response = await this.api.post('/replicas', replicaPayload)
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
    try {
      // Step 1: POST to knowledge-base with filename to get signedURL
      const filename = `${title.replace(/[^a-zA-Z0-9]/g, '_')}.csv`
      const uploadRequest = await this.uploadToKnowledgeBase(replicaId, {
        title: title,
        filename: filename,
        autoRefresh: false
      })

      // Step 2: Upload the actual CSV content to the signedURL
      if (uploadRequest.success && uploadRequest.results && uploadRequest.results.length > 0) {
        const result = uploadRequest.results[0]
        if (result.signedURL) {
          // Create a separate axios instance for external URL upload
          const uploadAxios = axios.create()
          
          // Upload CSV content to signedURL using PUT
          const uploadResponse = await uploadAxios.put(result.signedURL, csvContent, {
            headers: {
              'Content-Type': 'text/csv'
            }
          })
          
          return {
            ...uploadRequest,
            uploadResponse: uploadResponse.data
          }
        }
      }
      
      return uploadRequest
    } catch (error: any) {
      console.error('Error uploading CSV to knowledge base:', error.response?.data || error.message)
      throw new Error(`Failed to upload CSV to knowledge base: ${error.response?.data?.message || error.message}`)
    }
  }

  async uploadTextToKnowledgeBase(replicaId: string, textContent: string, title: string = 'Text Document'): Promise<any> {
    try {
      // Upload text content directly using the text field
      const uploadRequest = await this.uploadToKnowledgeBase(replicaId, {
        title: title,
        text: textContent,
        autoRefresh: false
      })
      
      return uploadRequest
    } catch (error: any) {
      console.error('Error uploading text to knowledge base:', error.response?.data || error.message)
      throw new Error(`Failed to upload text to knowledge base: ${error.response?.data?.message || error.message}`)
    }
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

  async getKnowledgeBaseEntry(replicaId: string, entryId: string): Promise<any> {
    try {
      const response = await this.api.get(`/replicas/${replicaId}/knowledge-base/${entryId}`)
      return response.data
    } catch (error: any) {
      console.error('Error getting knowledge base entry:', error.response?.data || error.message)
      throw new Error(`Failed to get knowledge base entry: ${error.response?.data?.message || error.message}`)
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
      // Test connection by trying to get replicas (organization-level endpoint)
      await this.getReplicas()
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

  async getKnowledgeBase(replicaUUID: string): Promise<any> {
    try {
      const response = await this.api.get(`/replicas/${replicaUUID}/knowledge-base`)
      return response.data
    } catch (error: any) {
      console.error('Error getting knowledge base:', error.response?.data || error.message)
      throw new Error(`Failed to get knowledge base: ${error.response?.data?.message || error.message}`)
    }
  }
}
