import { SensayReplica, ReplicaCreationRequest } from '../types'
import { prisma } from '../lib/prisma'

export class ReplicaService {
  async createReplica(replicaData: ReplicaCreationRequest, sensayId: string): Promise<SensayReplica> {
    const replica = await prisma.replica.create({
      data: {
        name: replicaData.name,
        purpose: 'Real Estate Assistant',
        shortDescription: replicaData.shortDescription,
        greeting: replicaData.greeting,
        ownerID: replicaData.ownerID,
        slug: replicaData.slug,
        tags: JSON.stringify([]),
        profileImage: null,
        suggestedQuestions: JSON.stringify([]),
        llm: JSON.stringify({
          model: 'gpt-4o',
          memoryMode: 'rag-search',
          systemMessage: 'Concise, knowledgeable, empathetic and cheerful.',
          tools: ['getTokenInfo']
        }),
        voicePreviewText: 'Hi, I\'m your Real Estate AI assistant! How can I help you today?',
        sensayId,
        status: 'active',
        type: 'character',
        private: false,
        isAccessibleByCustomerSupport: true,
        isEveryConversationAccessibleBySupport: true,
        isPrivateConversationsEnabled: false
      }
    })

    return this.mapToSensayReplica(replica)
  }

  async getReplicaById(id: string): Promise<SensayReplica | null> {
    const replica = await prisma.replica.findUnique({
      where: { id }
    })

    if (!replica) return null

    return this.mapToSensayReplica(replica)
  }

  async getReplicasByUserId(userId: string): Promise<SensayReplica[]> {
    const replicas = await prisma.replica.findMany({
      where: { ownerID: userId }
    })

    return replicas.map(replica => this.mapToSensayReplica(replica))
  }

  async updateReplicaSensayId(id: string, sensayId: string): Promise<void> {
    await prisma.replica.update({
      where: { id },
      data: { sensayId }
    })
  }

  private mapToSensayReplica(replica: any): SensayReplica {
    return {
      id: replica.id,
      name: replica.name,
      purpose: replica.purpose,
      shortDescription: replica.shortDescription,
      greeting: replica.greeting,
      type: replica.type,
      ownerID: replica.ownerID,
      private: replica.private,
      slug: replica.slug,
      tags: JSON.parse(replica.tags),
      profileImage: replica.profileImage || undefined,
      suggestedQuestions: JSON.parse(replica.suggestedQuestions),
      llm: JSON.parse(replica.llm),
      voicePreviewText: replica.voicePreviewText,
      isAccessibleByCustomerSupport: replica.isAccessibleByCustomerSupport,
      isEveryConversationAccessibleBySupport: replica.isEveryConversationAccessibleBySupport,
      isPrivateConversationsEnabled: replica.isPrivateConversationsEnabled,
      introductionAudioID: replica.introductionAudioID || undefined,
      sensayId: replica.sensayId,
      status: replica.status,
      createdAt: replica.createdAt,
      updatedAt: replica.updatedAt
    }
  }
}
