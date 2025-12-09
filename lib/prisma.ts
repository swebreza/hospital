import { PrismaClient } from '@prisma/client'

// Ensure DATABASE_URL is set - Next.js loads .env.local automatically
// But we provide a fallback just in case
const DATABASE_URL =
  process.env.DATABASE_URL ||
  'mongodb+srv://swebreza_db_user:FVcpTVpbigdWu4pS@cluster0.j23odu6.mongodb.net/hospital?retryWrites=true&w=majority'

// Set it in process.env so Prisma can read it
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = DATABASE_URL
}

// Verify DATABASE_URL is set
if (!process.env.DATABASE_URL) {
  throw new Error(
    'DATABASE_URL is not set. Please create a .env.local file with DATABASE_URL="your-connection-string"'
  )
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'error', 'warn']
        : ['error'],
  })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

export default prisma
