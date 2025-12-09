/**
 * Helper functions to find users by email or ID and return their UUID
 * Users are stored in Prisma with UUID IDs, and we store UUID strings (not ObjectIds) for user references
 */

import connectDB from '@/lib/db/mongodb'

/**
 * Find user by email or UUID and return user UUID string
 * Accepts either email (string) or user ID (UUID string from Prisma)
 * Returns the Prisma user UUID (string) to be stored in MongoDB documents
 */
export async function findUserUuid(
  identifier: string
): Promise<string | null> {
  await connectDB()

  try {
    // Try Prisma (users are stored via Prisma with UUIDs)
    const { prisma } = await import('@/lib/prisma')
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: identifier },
          { id: identifier },
        ],
      },
      select: {
        id: true,
        email: true,
        name: true,
      },
    })

    if (user) {
      return user.id // Return Prisma UUID string
    }

    return null
  } catch (error) {
    console.error('Error finding user:', error)
    return null
  }
}

/**
 * Validate and get user UUID, throw error if not found
 */
export async function getUserUuid(
  identifier: string,
  fieldName = 'user'
): Promise<string> {
  const uuid = await findUserUuid(identifier)
  if (!uuid) {
    throw new Error(
      `${fieldName} not found. Please provide a valid user email or ID. Received: ${identifier}`
    )
  }
  return uuid
}

