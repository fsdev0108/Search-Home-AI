import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Deletar usuário admin existente se existir
  const existingAdmin = await prisma.user.findFirst({
    where: { role: 'admin' }
  })

  if (existingAdmin) {
    console.log('🗑️ Deleting existing admin user...')
    await prisma.user.delete({
      where: { id: existingAdmin.id }
    })
  }

  // Criar usuário admin padrão
  const saltRounds = 10
  const hashedPassword = await bcrypt.hash('admin123', saltRounds)

  const adminUser = await prisma.user.create({
    data: {
      name: 'Admin',
      email: 'admin@sensay.com',
      password: hashedPassword,
      role: 'admin'
    }
  })

  console.log('✅ Admin user created:', adminUser.email)
  console.log('🔑 Default password: admin123')
  console.log('🆔 User ID:', adminUser.id)
}

main()
  .catch((e) => {
    console.error('❌ Error during seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
