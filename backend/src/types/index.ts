export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
  timestamp: string
  requestId: string
}

export interface User {
  id: string
  name: string
  email: string
  role: 'admin' | 'user' | 'viewer'
  createdAt: Date
  updatedAt: Date
}

export interface SensayReplica {
  id: string
  name: string
  purpose: string
  shortDescription: string
  greeting: string
  type: string
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
  isAccessibleByCustomerSupport: boolean
  isEveryConversationAccessibleBySupport: boolean
  isPrivateConversationsEnabled: boolean
  introductionAudioID?: string
  sensayId: string
  status: 'active' | 'inactive' | 'training'
  createdAt: Date
  updatedAt: Date
}

export interface SensayUploadResponse {
  success: boolean
  signedURL: string
  knowledgeBaseID: number
}

export interface FileUploadRequest {
  filename: string
  filePath: string
}

export interface ReplicaCreationRequest {
  name: string
  purpose: string
  shortDescription: string
  greeting: string
  ownerID: string
  slug: string
  tags?: string[]
  profileImage?: string
  suggestedQuestions?: string[]
}

export interface UploadSchedule {
  id: string
  replicaId: string
  filePath: string
  schedule: 'daily' | 'weekly' | 'on-demand'
  lastUpload: Date
  nextUpload: Date
  isActive: boolean
}

export interface Property {
  id: string
  externalId: string
  title: string
  description: string
  price: number
  location: string
  bedrooms: number
  bathrooms: number
  area: number
  type: 'rent' | 'sale'
  status: 'available' | 'sold' | 'rented'
  metadata: Record<string, any>
  lastSync: Date
  createdAt: Date
  updatedAt: Date
}

export interface DataConnector {
  id: string
  name: string
  type: 'api' | 'webhook' | 'database' | 'file'
  config: {
    url?: string
    method?: string
    headers?: Record<string, string>
    credentials?: any
    schedule: 'realtime' | 'hourly' | 'daily' | 'weekly'
  }
  status: 'active' | 'inactive' | 'error'
  lastSync: Date
  syncCount: number
  errorCount: number
  createdAt: Date
  updatedAt: Date
}

// Future SaaS ready fields (commented for now)
// export interface Tenant {
//   id: string
//   name: string
//   slug: string
//   status: 'active' | 'suspended' | 'trial'
//   subscription: Subscription
//   sensayConfig: SensayConfig
//   apiConfig: ApiConfig
// }
