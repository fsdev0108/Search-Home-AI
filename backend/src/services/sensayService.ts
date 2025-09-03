import { config } from '../config'
import { SensayReplica, SensayUploadResponse, ReplicaCreationRequest, SensayUser } from '../types'
import { v4 as uuidv4 } from 'uuid'
import fs from 'fs'
import path from 'path'

export class SensayService {
  private baseUrl: string
  private organizationSecret: string
  private apiVersion: string

  constructor() {
    this.baseUrl = config.sensay.baseUrl
    this.organizationSecret = config.sensay.organizationSecret
    this.apiVersion = config.sensay.apiVersion
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
    const url = `${this.baseUrl}${endpoint}`
    const headers = {
      'X-ORGANIZATION-SECRET': this.organizationSecret,
      'X-API-Version': this.apiVersion,
      'Content-Type': 'application/json',
      ...options.headers
    }

    const response = await fetch(url, {
      ...options,
      headers
    })

    if (!response.ok) {
      throw new Error(`Sensay API error: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  async createUser(name: string, email: string): Promise<SensayUser> {
    const payload = {
      name,
      email,
      role: 'user'
    }

    const response = await this.makeRequest('/users', {
      method: 'POST',
      body: JSON.stringify(payload)
    })

    return response
  }

  async createReplica(replicaData: ReplicaCreationRequest): Promise<SensayReplica> {
    const payload = {
      name: replicaData.name,
      shortDescription: replicaData.shortDescription,
      greeting: replicaData.greeting,
      ownerID: replicaData.ownerID,
      slug: replicaData.slug,
      llm: {
        model: "gpt-4o",
        memoryMode: "rag-search",
        systemMessage: "Concise, knowledgeable, empathetic and cheerful.",
        tools: ["getTokenInfo"]
      }
    }

    const response = await this.makeRequest('/replicas', {
      method: 'POST',
      body: JSON.stringify(payload)
    })

    return response
  }

  async getSignedUploadUrl(replicaUuid: string, filename: string): Promise<SensayUploadResponse> {
    const endpoint = `/replicas/${replicaUuid}/training/files/upload?filename=${encodeURIComponent(filename)}`
    
    const response = await this.makeRequest(endpoint, {
      method: 'GET'
    })

    return response
  }

  async uploadFileToSignedUrl(signedUrl: string, filePath: string): Promise<void> {
    const fileBuffer = fs.readFileSync(filePath)
    
    const response = await fetch(signedUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/octet-stream'
      },
      body: fileBuffer
    })

    if (!response.ok) {
      throw new Error(`File upload failed: ${response.status} ${response.statusText}`)
    }
  }

  async deleteKnowledgeBaseEntry(replicaUuid: string, knowledgeBaseId: number): Promise<void> {
    const endpoint = `/replicas/${replicaUuid}/training/${knowledgeBaseId}`
    
    await this.makeRequest(endpoint, {
      method: 'DELETE'
    })
  }

  async getReplica(replicaUuid: string): Promise<SensayReplica> {
    const endpoint = `/replicas/${replicaUuid}`
    
    const response = await this.makeRequest(endpoint, {
      method: 'GET'
    })

    return response
  }
}
