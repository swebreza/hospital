import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

// Simple hash function for demo purposes
function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex')
}

export async function POST(request: NextRequest) {
  try {
    // Remove the check - we'll handle duplicates gracefully

    // Default password for all demo users: "demo123"
    const defaultPasswordHash = hashPassword('demo123')

    const dummyUsers = [
      {
        email: 'john.doe@hospital.com',
        passwordHash: defaultPasswordHash,
        name: 'John Doe',
        role: 'admin' as const,
        department: 'Administration',
        isActive: true,
      },
      {
        email: 'sarah.smith@hospital.com',
        passwordHash: defaultPasswordHash,
        name: 'Sarah Smith',
        role: 'biomedical_engineer' as const,
        department: 'Biomedical Engineering',
        isActive: true,
      },
      {
        email: 'michael.chen@hospital.com',
        passwordHash: defaultPasswordHash,
        name: 'Michael Chen',
        role: 'biomedical_engineer' as const,
        department: 'Biomedical Engineering',
        isActive: true,
      },
      {
        email: 'emily.jones@hospital.com',
        passwordHash: defaultPasswordHash,
        name: 'Emily Jones',
        role: 'technician' as const,
        department: 'Maintenance',
        isActive: true,
      },
      {
        email: 'david.williams@hospital.com',
        passwordHash: defaultPasswordHash,
        name: 'David Williams',
        role: 'technician' as const,
        department: 'ICU',
        isActive: true,
      },
      {
        email: 'lisa.brown@hospital.com',
        passwordHash: defaultPasswordHash,
        name: 'Lisa Brown',
        role: 'manager' as const,
        department: 'Operations',
        isActive: true,
      },
      {
        email: 'robert.taylor@hospital.com',
        passwordHash: defaultPasswordHash,
        name: 'Robert Taylor',
        role: 'biomedical_engineer' as const,
        department: 'Radiology',
        isActive: true,
      },
      {
        email: 'jennifer.wilson@hospital.com',
        passwordHash: defaultPasswordHash,
        name: 'Jennifer Wilson',
        role: 'technician' as const,
        department: 'Emergency',
        isActive: true,
      },
      {
        email: 'james.moore@hospital.com',
        passwordHash: defaultPasswordHash,
        name: 'James Moore',
        role: 'viewer' as const,
        department: 'Administration',
        isActive: true,
      },
      {
        email: 'patricia.anderson@hospital.com',
        passwordHash: defaultPasswordHash,
        name: 'Patricia Anderson',
        role: 'biomedical_engineer' as const,
        department: 'Laboratory',
        isActive: true,
      },
    ]

    // MongoDB doesn't support skipDuplicates, so we'll create users individually
    // and handle duplicates gracefully
    let createdCount = 0
    const errors: string[] = []

    for (const userData of dummyUsers) {
      try {
        await prisma.user.create({
          data: userData,
        })
        createdCount++
      } catch (error: any) {
        // If user already exists (unique constraint violation), skip it
        // P2002 is Prisma's unique constraint error code
        // For MongoDB, we also check for duplicate key errors
        if (
          error.code === 'P2002' || 
          error.message?.includes('Unique constraint') ||
          error.message?.includes('duplicate key') ||
          error.message?.includes('E11000')
        ) {
          // User already exists, skip silently
          continue
        }
        errors.push(`${userData.email}: ${error.message}`)
      }
    }

    if (errors.length > 0) {
      console.warn('Some users failed to create:', errors)
    }

    return NextResponse.json({
      success: true,
      message: `Successfully created ${createdCount} dummy users${errors.length > 0 ? ` (${errors.length} skipped)` : ''}`,
      users: createdCount,
      errors: errors.length > 0 ? errors : undefined,
    })
  } catch (error: unknown) {
    console.error('Error seeding users:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to seed users'
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Delete all users (be careful with this in production!)
    const deletedUsers = await prisma.user.deleteMany({})

    return NextResponse.json({
      success: true,
      message: `Successfully deleted ${deletedUsers.count} users`,
    })
  } catch (error: unknown) {
    console.error('Error deleting users:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to delete users'
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    )
  }
}
