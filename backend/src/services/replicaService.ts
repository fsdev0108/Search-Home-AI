import { SensayReplica, ReplicaCreationRequest } from '../types'
import { prisma } from '../lib/prisma'

export class ReplicaService {
  async createReplica(replicaData: ReplicaCreationRequest, sensayId?: string): Promise<SensayReplica> {
    const replica = await prisma.replica.create({
      data: {
        name: replicaData.name,
        purpose: replicaData.purpose,
        shortDescription: replicaData.shortDescription,
        greeting: replicaData.greeting,
        ownerID: replicaData.ownerID,
        slug: replicaData.slug,
        tags: JSON.stringify(replicaData.tags || []),
        profileImage: replicaData.profileImage,
        suggestedQuestions: JSON.stringify(replicaData.suggestedQuestions || []),
        llm: JSON.stringify({
          model: 'gpt-4o',
          memoryMode: 'rag-search',
          systemMessage: 'Concise, knowledgeable, empathetic and cheerful.',
          tools: ['getTokenInfo']
        }),
        voicePreviewText: 'Hi, I\'m your Sensay replica! How can I assist you today?',
        sensayId
      }
    })

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
      introductionAudioID: replica.introductionAudioID || undefined
    }
  }

  async getReplicaById(id: string): Promise<SensayReplica | null> {
    const replica = await prisma.replica.findUnique({
      where: { id }
    })

    if (!replica) return null

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
      introductionAudioID: replica.introductionAudioID || undefined
    }
  }

  async getReplicasByUserId(userId: string): Promise<SensayReplica[]> {
    const replicas = await prisma.replica.findMany({
      where: { ownerID: userId }
    })

    return replicas.map((replica: any) => ({
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
      introductionAudioID: replica.introductionAudioID || undefined
    }))
  }

  async updateReplicaSensayId(id: string, sensayId: string): Promise<void> {
    await prisma.replica.update({
      where: { id },
      data: { sensayId }
    })
  }
}
