
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Start seeding...')

  // Create test users with password: password123
  const hashedPassword = await bcrypt.hash('password123', 10)
  
  const alice = await prisma.user.upsert({
    where: { email: 'alice@test.com' },
    update: { password: hashedPassword },
    create: {
      email: 'alice@test.com',
      password: hashedPassword,
      name: 'Alice',
      username: 'alice',
    },
  })
  console.log(`Created test user: ${alice.email}`)

  const bob = await prisma.user.upsert({
    where: { email: 'bob@test.com' },
    update: { password: hashedPassword },
    create: {
      email: 'bob@test.com',
      password: hashedPassword,
      name: 'Bob',
      username: 'bob',
    },
  })
  console.log(`Created test user: ${bob.email}`)

  const charlie = await prisma.user.upsert({
    where: { email: 'charlie@test.com' },
    update: { password: hashedPassword },
    create: {
      email: 'charlie@test.com',
      password: hashedPassword,
      name: 'Charlie',
      username: 'charlie',
    },
  })
  console.log(`Created test user: ${charlie.email}`)

  console.log('Seeding finished.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
