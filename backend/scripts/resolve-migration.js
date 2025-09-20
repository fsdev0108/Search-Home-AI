const { PrismaClient } = require('@prisma/client')

async function resolveMigration() {
  const prisma = new PrismaClient()
  
  try {
    console.log('🔧 Resolving failed migration...')
    
    // Mark the failed migration as resolved
    await prisma.$executeRaw`
      UPDATE "_prisma_migrations" 
      SET "finished_at" = NOW(), "logs" = 'Resolved manually' 
      WHERE "migration_name" = '20250920160000_init_postgresql'
    `
    
    console.log('✅ Migration marked as resolved')
    
    // Check if twilio_settings table exists
    const tableExists = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'twilio_settings'
      )
    `
    
    if (!tableExists[0].exists) {
      console.log('📋 Creating twilio_settings table...')
      
      await prisma.$executeRaw`
        CREATE TABLE "twilio_settings" (
          "id" TEXT NOT NULL,
          "integrationId" TEXT NOT NULL,
          "accountSid" TEXT NOT NULL,
          "authToken" TEXT NOT NULL,
          "phoneNumber" TEXT NOT NULL,
          "isActive" BOOLEAN NOT NULL DEFAULT false,
          "replicaId" TEXT,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL,
          CONSTRAINT "twilio_settings_pkey" PRIMARY KEY ("id")
        )
      `
      
      await prisma.$executeRaw`
        CREATE UNIQUE INDEX "twilio_settings_integrationId_key" ON "twilio_settings"("integrationId")
      `
      
      await prisma.$executeRaw`
        ALTER TABLE "twilio_settings" ADD CONSTRAINT "twilio_settings_integrationId_fkey" 
        FOREIGN KEY ("integrationId") REFERENCES "integration_settings"("id") ON DELETE RESTRICT ON UPDATE CASCADE
      `
      
      console.log('✅ twilio_settings table created')
    } else {
      console.log('✅ twilio_settings table already exists')
    }
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

resolveMigration()
