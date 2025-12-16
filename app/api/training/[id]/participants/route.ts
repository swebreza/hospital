import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db/mongodb'
import TrainingSession from '@/lib/models/TrainingSession'
import TrainingParticipant from '@/lib/models/TrainingParticipant'
import { getUserUuid } from '@/lib/services/userLookup'
import type { TrainingParticipant as ITrainingParticipant } from '@/lib/types'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB()
    const { id } = await params

    // Verify session exists
    const session = await TrainingSession.findById(id)
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Training session not found' },
        { status: 404 }
      )
    }

    const participants = await TrainingParticipant.find({ trainingSessionId: id })
      .sort({ createdAt: -1 })
      .lean()

    // Fetch user details from Prisma
    const { prisma } = await import('@/lib/prisma')
    const userIds = [...new Set(participants.map((p: any) => p.userId).filter(Boolean))]
    const users = userIds.length > 0 ? await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true, email: true, department: true, role: true },
    }) : []
    const userMap = new Map(users.map((u) => [u.id, u]))

    const transformedParticipants: ITrainingParticipant[] = participants.map((p: any) => ({
      id: p._id.toString(),
      trainingSessionId: p.trainingSessionId.toString(),
      userId: p.userId || '',
      user: p.userId && userMap.has(p.userId) ? (() => {
        const u = userMap.get(p.userId)!
        return {
          id: u.id,
          email: u.email || '',
          name: u.name || '',
          role: u.role || 'viewer',
          department: u.department || '',
          createdAt: '',
          updatedAt: '',
        }
      })() : undefined,
      attendanceStatus: p.attendanceStatus,
      certificationStatus: p.certificationStatus,
      certifiedAt: p.certifiedAt?.toISOString(),
      certificationExpiryDate: p.certificationExpiryDate?.toISOString(),
      attendedAt: p.attendedAt?.toISOString(),
      notes: p.notes,
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
    }))

    return NextResponse.json({
      success: true,
      data: transformedParticipants,
    })
  } catch (error: unknown) {
    console.error('Error fetching participants:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch participants'
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB()
    const { id } = await params
    const body = await request.json()

    // Verify session exists
    const session = await TrainingSession.findById(id)
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Training session not found' },
        { status: 404 }
      )
    }

    // Support both single user and bulk add
    const userIds = Array.isArray(body.userIds) ? body.userIds : [body.userId]
    
    if (!userIds.length) {
      return NextResponse.json(
        { success: false, error: 'No users provided' },
        { status: 400 }
      )
    }

    const participants = []
    const errors = []

    for (const userIdentifier of userIds) {
      try {
        // Find user by email or UUID - returns Prisma UUID string
        const userUuid = await getUserUuid(userIdentifier, 'User')

        // Check if participant already exists
        const existing = await TrainingParticipant.findOne({
          trainingSessionId: id,
          userId: userUuid,
        })

        if (existing) {
          errors.push({ userId: userIdentifier, error: 'Participant already registered' })
          continue
        }

        const participant = await TrainingParticipant.create({
          trainingSessionId: id,
          userId: userUuid,
          attendanceStatus: 'Registered',
          certificationStatus: 'NotCertified',
        })

        const populatedParticipant = await TrainingParticipant.findById(participant._id).lean()

        // Fetch user details from Prisma
        const { prisma } = await import('@/lib/prisma')
        const user = await prisma.user.findUnique({
          where: { id: userUuid },
          select: { id: true, name: true, email: true, department: true, role: true },
        })

        participants.push({
          id: populatedParticipant!._id.toString(),
          trainingSessionId: populatedParticipant!.trainingSessionId.toString(),
          userId: populatedParticipant!.userId || '',
          user: user ? {
            id: user.id,
            email: user.email || '',
            name: user.name || '',
            role: user.role || 'viewer',
            department: user.department || '',
            createdAt: '',
            updatedAt: '',
          } : undefined,
          attendanceStatus: populatedParticipant!.attendanceStatus,
          certificationStatus: populatedParticipant!.certificationStatus,
          certifiedAt: populatedParticipant!.certifiedAt?.toISOString(),
          certificationExpiryDate: populatedParticipant!.certificationExpiryDate?.toISOString(),
          attendedAt: populatedParticipant!.attendedAt?.toISOString(),
          notes: populatedParticipant!.notes,
          createdAt: populatedParticipant!.createdAt.toISOString(),
          updatedAt: populatedParticipant!.updatedAt.toISOString(),
        })
      } catch (err) {
        errors.push({ userId: userIdentifier, error: err instanceof Error ? err.message : 'Unknown error' })
      }
    }

    return NextResponse.json({
      success: true,
      data: participants,
      errors: errors.length > 0 ? errors : undefined,
    })
  } catch (error: unknown) {
    console.error('Error adding participants:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to add participants'
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB()
    const { id } = await params
    const body = await request.json()

    // Verify session exists
    const session = await TrainingSession.findById(id)
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Training session not found' },
        { status: 404 }
      )
    }

    if (!body.participantId) {
      return NextResponse.json(
        { success: false, error: 'participantId is required' },
        { status: 400 }
      )
    }

    const updateData: Record<string, unknown> = {}
    
    if (body.attendanceStatus) updateData.attendanceStatus = body.attendanceStatus
    if (body.certificationStatus) updateData.certificationStatus = body.certificationStatus
    if (body.certifiedAt) updateData.certifiedAt = new Date(body.certifiedAt)
    if (body.certificationExpiryDate) updateData.certificationExpiryDate = new Date(body.certificationExpiryDate)
    if (body.attendedAt) updateData.attendedAt = new Date(body.attendedAt)
    if (body.notes !== undefined) updateData.notes = body.notes

    // If marking as attended, set attendedAt if not provided
    if (body.attendanceStatus === 'Attended' && !body.attendedAt) {
      updateData.attendedAt = new Date()
    }

    const participant = await TrainingParticipant.findByIdAndUpdate(
      body.participantId,
      updateData,
      { new: true }
    )
      .lean()

    if (!participant) {
      return NextResponse.json(
        { success: false, error: 'Participant not found' },
        { status: 404 }
      )
    }

    // Fetch user details from Prisma
    const { prisma } = await import('@/lib/prisma')
    const user = participant.userId ? await prisma.user.findUnique({
      where: { id: participant.userId },
      select: { id: true, name: true, email: true, department: true, role: true },
    }) : null

    const transformedParticipant: ITrainingParticipant = {
      id: participant._id.toString(),
      trainingSessionId: participant.trainingSessionId.toString(),
      userId: participant.userId || '',
      user: user ? {
        id: user.id,
        email: user.email || '',
        name: user.name || '',
        role: user.role || 'viewer',
        department: user.department || '',
        createdAt: '',
        updatedAt: '',
      } : undefined,
      attendanceStatus: participant.attendanceStatus,
      certificationStatus: participant.certificationStatus,
      certifiedAt: participant.certifiedAt?.toISOString(),
      certificationExpiryDate: participant.certificationExpiryDate?.toISOString(),
      attendedAt: participant.attendedAt?.toISOString(),
      notes: participant.notes,
      createdAt: participant.createdAt.toISOString(),
      updatedAt: participant.updatedAt.toISOString(),
    }

    return NextResponse.json({
      success: true,
      data: transformedParticipant,
    })
  } catch (error: unknown) {
    console.error('Error updating participant:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to update participant'
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    )
  }
}

