import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db/mongodb'
import TrainingSession from '@/lib/models/TrainingSession'
import TrainingParticipant from '@/lib/models/TrainingParticipant'
import TrainingAssessment from '@/lib/models/TrainingAssessment'
import { getUserUuid } from '@/lib/services/userLookup'
import type { TrainingAssessment as ITrainingAssessment } from '@/lib/types'

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

    const assessments = await TrainingAssessment.find({ trainingSessionId: id })
      .populate('participantId')
      .sort({ assessmentType: 1, createdAt: -1 })
      .lean()

    // Fetch grader details from Prisma
    const { prisma } = await import('@/lib/prisma')
    const graderIds = assessments.map((a: any) => a.gradedBy).filter(Boolean)
    const graders = graderIds.length > 0 ? await prisma.user.findMany({
      where: { id: { in: graderIds } },
      select: { id: true, name: true, email: true, department: true, role: true },
    }) : []
    const graderMap = new Map(graders.map((g) => [g.id, g]))

    const transformedAssessments: ITrainingAssessment[] = assessments.map((a: any) => ({
      id: a._id.toString(),
      trainingSessionId: a.trainingSessionId.toString(),
      participantId: a.participantId?._id?.toString() || a.participantId?.toString() || '',
      participant: a.participantId?._id ? {
        id: a.participantId._id.toString(),
        trainingSessionId: a.participantId.trainingSessionId.toString(),
        userId: a.participantId.userId?.toString() || '',
        attendanceStatus: a.participantId.attendanceStatus,
        certificationStatus: a.participantId.certificationStatus,
        createdAt: a.participantId.createdAt?.toISOString() || '',
        updatedAt: a.participantId.updatedAt?.toISOString() || '',
      } : undefined,
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
    }))

    return NextResponse.json({
      success: true,
      data: transformedAssessments,
    })
  } catch (error: unknown) {
    console.error('Error fetching assessments:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch assessments'
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

    // Validate required fields
    if (!body.participantId || !body.assessmentType) {
      return NextResponse.json(
        { success: false, error: 'participantId and assessmentType are required' },
        { status: 400 }
      )
    }

    // Verify participant exists
    const participant = await TrainingParticipant.findById(body.participantId)
    if (!participant) {
      return NextResponse.json(
        { success: false, error: 'Participant not found' },
        { status: 404 }
      )
    }

    // Check if assessment already exists
    const existing = await TrainingAssessment.findOne({
      trainingSessionId: id,
      participantId: body.participantId,
      assessmentType: body.assessmentType,
    })

    if (existing) {
      return NextResponse.json(
        { success: false, error: `${body.assessmentType} already exists for this participant` },
        { status: 400 }
      )
    }

    // Calculate score if answers and questions are provided
    let calculatedScore: number | undefined
    if (body.questions && body.answers) {
      let totalPoints = 0
      let earnedPoints = 0

      body.questions.forEach((q: any, index: number) => {
        totalPoints += q.points || 0
        const answer = body.answers.find((a: any) => a.questionIndex === index)
        if (answer) {
          earnedPoints += answer.pointsEarned || 0
        }
      })

      if (totalPoints > 0) {
        calculatedScore = Math.round((earnedPoints / totalPoints) * 100 * 100) / 100
      }
    }

    const assessment = await TrainingAssessment.create({
      trainingSessionId: id,
      participantId: body.participantId,
      assessmentType: body.assessmentType,
      score: body.score !== undefined ? body.score : calculatedScore,
      maxScore: body.maxScore || 100,
      questions: body.questions,
      answers: body.answers,
      documentUrl: body.documentUrl,
      completedAt: body.completedAt ? new Date(body.completedAt) : new Date(),
      gradedBy: body.gradedBy ? await getUserUuid(body.gradedBy, 'Grader') : undefined,
      notes: body.notes,
    })

    const populatedAssessment = await TrainingAssessment.findById(assessment._id)
      .populate('participantId')
      .lean()

    // Fetch grader details from Prisma if gradedBy exists
    const { prisma } = await import('@/lib/prisma')
    const grader = populatedAssessment!.gradedBy ? await prisma.user.findUnique({
      where: { id: populatedAssessment!.gradedBy },
      select: { id: true, name: true, email: true, department: true, role: true },
    }) : null

    const transformedAssessment: ITrainingAssessment = {
      id: populatedAssessment!._id.toString(),
      trainingSessionId: populatedAssessment!.trainingSessionId.toString(),
      participantId: populatedAssessment!.participantId?._id?.toString() || populatedAssessment!.participantId?.toString() || '',
      participant: populatedAssessment!.participantId?._id ? {
        id: populatedAssessment!.participantId._id.toString(),
        trainingSessionId: populatedAssessment!.participantId.trainingSessionId.toString(),
        userId: populatedAssessment!.participantId.userId?.toString() || '',
        attendanceStatus: populatedAssessment!.participantId.attendanceStatus,
        certificationStatus: populatedAssessment!.participantId.certificationStatus,
        createdAt: populatedAssessment!.participantId.createdAt?.toISOString() || '',
        updatedAt: populatedAssessment!.participantId.updatedAt?.toISOString() || '',
      } : undefined,
      assessmentType: populatedAssessment!.assessmentType,
      score: populatedAssessment!.score,
      maxScore: populatedAssessment!.maxScore,
      questions: populatedAssessment!.questions,
      answers: populatedAssessment!.answers,
      documentUrl: populatedAssessment!.documentUrl,
      completedAt: populatedAssessment!.completedAt?.toISOString(),
      gradedBy: populatedAssessment!.gradedBy || undefined,
      grader: grader ? {
        id: grader.id,
        email: grader.email || '',
        name: grader.name || '',
        role: grader.role || 'viewer',
        department: grader.department || '',
        createdAt: '',
        updatedAt: '',
      } : undefined,
      notes: populatedAssessment!.notes,
      createdAt: populatedAssessment!.createdAt.toISOString(),
      updatedAt: populatedAssessment!.updatedAt.toISOString(),
    }

    return NextResponse.json({
      success: true,
      data: transformedAssessment,
    })
  } catch (error: unknown) {
    console.error('Error creating assessment:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to create assessment'
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    )
  }
}

