import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db/mongodb'
import TrainingSession from '@/lib/models/TrainingSession'
import TrainingParticipant from '@/lib/models/TrainingParticipant'
import TrainingAssessment from '@/lib/models/TrainingAssessment'
import { getUserUuid } from '@/lib/services/userLookup'
import type { TrainingSession as ITrainingSession } from '@/lib/types'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB()
    const { id } = await params

    const session = await TrainingSession.findById(id)
      .populate('assetId', 'id name model manufacturer department location status')
      .lean()

    // Fetch trainer details from Prisma
    let trainer = null
    if (session && session.trainerId) {
      const { prisma } = await import('@/lib/prisma')
      trainer = await prisma.user.findUnique({
        where: { id: session.trainerId },
        select: { id: true, name: true, email: true, department: true, role: true },
      })
    }

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Training session not found' },
        { status: 404 }
      )
    }

    // Get participants
    const participants = await TrainingParticipant.find({ trainingSessionId: id })
      .lean()

    // Fetch user details for participants from Prisma
    const { prisma } = await import('@/lib/prisma')
    const participantUserIds = [...new Set(participants.map((p: any) => p.userId).filter(Boolean))]
    const participantUsers = await prisma.user.findMany({
      where: { id: { in: participantUserIds } },
      select: { id: true, name: true, email: true, department: true, role: true },
    })
    const participantUserMap = new Map(participantUsers.map((u) => [u.id, u]))

    // Get assessments
    const assessments = await TrainingAssessment.find({ trainingSessionId: id })
      .populate('participantId')
      .lean()

    // Fetch grader details from Prisma if needed
    const graderIds = assessments.map((a: any) => a.gradedBy).filter(Boolean)
    const graders = graderIds.length > 0 ? await prisma.user.findMany({
      where: { id: { in: graderIds } },
      select: { id: true, name: true, email: true, department: true, role: true },
    }) : []
    const graderMap = new Map(graders.map((g) => [g.id, g]))

    const transformedSession: ITrainingSession = {
      id: session._id.toString(),
      assetId: session.assetId?._id?.toString() || session.assetId?.toString() || '',
      asset: session.assetId?._id && typeof (session.assetId as any).name !== 'undefined' ? {
        id: String((session.assetId as any).id || session.assetId._id),
        name: (session.assetId as any).name || '',
        model: (session.assetId as any).model || '',
        manufacturer: (session.assetId as any).manufacturer || '',
        department: (session.assetId as any).department || '',
        status: (session.assetId as any).status || 'Active',
        serialNumber: (session.assetId as any).serialNumber || '',
        location: (session.assetId as any).location || '',
        purchaseDate: (session.assetId as any).purchaseDate?.toISOString() || '',
        nextPmDate: (session.assetId as any).nextPmDate?.toISOString() || '',
        value: (session.assetId as any).value || 0,
        createdAt: (session.assetId as any).createdAt?.toISOString() || '',
        updatedAt: (session.assetId as any).updatedAt?.toISOString() || '',
      } : undefined,
      sessionDate: session.sessionDate.toISOString(),
      trainerId: (session.trainerId as any)?._id?.toString() || (typeof session.trainerId === 'string' ? session.trainerId : '') || '',
      trainer: (session.trainerId as any)?._id && typeof (session.trainerId as any).name !== 'undefined' ? {
        id: (session.trainerId as any)._id.toString(),
        email: (session.trainerId as any).email || '',
        name: (session.trainerId as any).name || '',
        role: (session.trainerId as any).role || 'viewer',
        department: (session.trainerId as any).department || '',
        createdAt: (session.trainerId as any).createdAt?.toISOString() || '',
        updatedAt: (session.trainerId as any).updatedAt?.toISOString() || '',
      } : undefined,
      title: session.title,
      description: session.description,
      department: session.department,
      location: session.location,
      durationMinutes: session.durationMinutes,
      status: session.status,
      notes: session.notes,
      documents: session.documents,
      participants: participants.map((p: any) => ({
        id: p._id.toString(),
        trainingSessionId: p.trainingSessionId.toString(),
        userId: p.userId || '',
        user: p.userId && participantUserMap.has(p.userId) ? (() => {
          const u = participantUserMap.get(p.userId)!
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
      })),
      assessments: assessments.map((a: any) => ({
        id: a._id.toString(),
        trainingSessionId: a.trainingSessionId.toString(),
        participantId: a.participantId.toString(),
        assessmentType: a.assessmentType,
        score: a.score,
        maxScore: a.maxScore,
        questions: a.questions,
        answers: a.answers,
        documentUrl: a.documentUrl,
        completedAt: a.completedAt?.toISOString(),
        gradedBy: a.gradedBy || undefined,
        grader: a.gradedBy && graderMap.has(a.gradedBy) ? (() => {
          const g = graderMap.get(a.gradedBy)!
          return {
            id: g.id,
            email: g.email || '',
            name: g.name || '',
            role: g.role || 'viewer',
            department: g.department || '',
            createdAt: '',
            updatedAt: '',
          }
        })() : undefined,
        notes: a.notes,
        createdAt: a.createdAt.toISOString(),
        updatedAt: a.updatedAt.toISOString(),
      })),
      createdAt: session.createdAt.toISOString(),
      updatedAt: session.updatedAt.toISOString(),
    }

    return NextResponse.json({
      success: true,
      data: transformedSession,
    })
  } catch (error: unknown) {
    console.error('Error fetching training session:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch training session'
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

    const updateData: Record<string, unknown> = {}
    
    if (body.sessionDate) updateData.sessionDate = new Date(body.sessionDate)
    if (body.trainerId) {
      // Find trainer by email or UUID
      const trainerUuid = await getUserUuid(body.trainerId, 'Trainer')
      updateData.trainerId = trainerUuid
    }
    if (body.assetId) {
      // Find asset by custom ID to get MongoDB ObjectId
      const Asset = (await import('@/lib/models/Asset')).default
      const asset = await Asset.findOne({ id: body.assetId })
      if (!asset) {
        return NextResponse.json(
          { success: false, error: `Asset with ID ${body.assetId} not found` },
          { status: 404 }
        )
      }
      updateData.assetId = asset._id
    }
    if (body.title) updateData.title = body.title
    if (body.description !== undefined) updateData.description = body.description
    if (body.department) updateData.department = body.department
    if (body.location !== undefined) updateData.location = body.location
    if (body.durationMinutes !== undefined) updateData.durationMinutes = body.durationMinutes
    if (body.status) updateData.status = body.status
    if (body.notes !== undefined) updateData.notes = body.notes
    if (body.documents !== undefined) updateData.documents = body.documents

    const session = await TrainingSession.findByIdAndUpdate(id, updateData, { new: true })
      .populate('assetId', 'id name model manufacturer department')
      .lean()

    // Fetch trainer details from Prisma
    let trainer = null
    if (session && session.trainerId) {
      const { prisma } = await import('@/lib/prisma')
      trainer = await prisma.user.findUnique({
        where: { id: session.trainerId },
        select: { id: true, name: true, email: true, department: true, role: true },
      })
    }

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Training session not found' },
        { status: 404 }
      )
    }

    const transformedSession: ITrainingSession = {
      id: session._id.toString(),
      assetId: session.assetId?._id?.toString() || session.assetId?.toString() || '',
      asset: session.assetId?._id && typeof (session.assetId as any).name !== 'undefined' ? {
        id: String((session.assetId as any).id || session.assetId._id),
        name: (session.assetId as any).name || '',
        model: (session.assetId as any).model || '',
        manufacturer: (session.assetId as any).manufacturer || '',
        department: (session.assetId as any).department || '',
        status: (session.assetId as any).status || 'Active',
        serialNumber: (session.assetId as any).serialNumber || '',
        location: (session.assetId as any).location || '',
        purchaseDate: (session.assetId as any).purchaseDate?.toISOString() || '',
        nextPmDate: (session.assetId as any).nextPmDate?.toISOString() || '',
        value: (session.assetId as any).value || 0,
        createdAt: (session.assetId as any).createdAt?.toISOString() || '',
        updatedAt: (session.assetId as any).updatedAt?.toISOString() || '',
      } : undefined,
      sessionDate: session.sessionDate.toISOString(),
      trainerId: (session.trainerId as any)?._id?.toString() || (typeof session.trainerId === 'string' ? session.trainerId : '') || '',
      trainer: (session.trainerId as any)?._id && typeof (session.trainerId as any).name !== 'undefined' ? {
        id: (session.trainerId as any)._id.toString(),
        email: (session.trainerId as any).email || '',
        name: (session.trainerId as any).name || '',
        role: (session.trainerId as any).role || 'viewer',
        department: (session.trainerId as any).department || '',
        createdAt: (session.trainerId as any).createdAt?.toISOString() || '',
        updatedAt: (session.trainerId as any).updatedAt?.toISOString() || '',
      } : undefined,
      title: session.title,
      description: session.description,
      department: session.department,
      location: session.location,
      durationMinutes: session.durationMinutes,
      status: session.status,
      notes: session.notes,
      documents: session.documents,
      createdAt: session.createdAt.toISOString(),
      updatedAt: session.updatedAt.toISOString(),
    }

    return NextResponse.json({
      success: true,
      data: transformedSession,
    })
  } catch (error: unknown) {
    console.error('Error updating training session:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to update training session'
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB()
    const { id } = await params

    // Delete associated participants, assessments, and certifications
    await TrainingParticipant.deleteMany({ trainingSessionId: id })
    await TrainingAssessment.deleteMany({ trainingSessionId: id })

    const session = await TrainingSession.findByIdAndDelete(id)

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Training session not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Training session deleted successfully',
    })
  } catch (error: unknown) {
    console.error('Error deleting training session:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to delete training session'
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    )
  }
}

