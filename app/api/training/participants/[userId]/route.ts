import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db/mongodb'
import TrainingParticipant from '@/lib/models/TrainingParticipant'
import TrainingSession from '@/lib/models/TrainingSession'
import TrainingCertification from '@/lib/models/TrainingCertification'
import TrainingAssessment from '@/lib/models/TrainingAssessment'
import { getUserUuid } from '@/lib/services/userLookup'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    await connectDB()
    const { userId: userIdentifier } = await params

    // Find user by email or UUID - returns Prisma UUID string
    const userUuid = await getUserUuid(userIdentifier, 'User')

    // Get all training sessions the user participated in
    const participants = await TrainingParticipant.find({ userId: userUuid })
      .populate({
        path: 'trainingSessionId',
        populate: {
          path: 'assetId',
          select: 'id name model manufacturer department',
        },
      })
      .populate({
        path: 'trainingSessionId',
        populate: {
          path: 'trainerId',
          select: 'id name email',
        },
      })
      .sort({ createdAt: -1 })
      .lean()

    // Get all certifications for the user (via participant IDs)
    const participantIds = participants.map((p: any) => p._id)
    const certifications = await TrainingCertification.find({
      participantId: { $in: participantIds },
    })
      .populate('assetId', 'id name model manufacturer department')
      .populate('participantId')
      .sort({ issuedDate: -1 })
      .lean()

    // Get all assessments for the user
    const allParticipantIds = participants.map((p: any) => p._id)
    const assessments = await TrainingAssessment.find({
      participantId: { $in: allParticipantIds },
    })
      .populate('trainingSessionId', 'id title sessionDate')
      .sort({ createdAt: -1 })
      .lean()

    // Transform participants
    const trainingHistory = participants.map((p: any) => ({
      participant: {
        id: p._id.toString(),
        trainingSessionId: p.trainingSessionId?._id?.toString() || '',
        userId: p.userId?.toString() || '',
        attendanceStatus: p.attendanceStatus,
        certificationStatus: p.certificationStatus,
        certifiedAt: p.certifiedAt?.toISOString(),
        certificationExpiryDate: p.certificationExpiryDate?.toISOString(),
        attendedAt: p.attendedAt?.toISOString(),
        notes: p.notes,
        createdAt: p.createdAt.toISOString(),
        updatedAt: p.updatedAt.toISOString(),
      },
      session: p.trainingSessionId?._id ? {
        id: p.trainingSessionId._id.toString(),
        title: p.trainingSessionId.title,
        sessionDate: p.trainingSessionId.sessionDate?.toISOString(),
        status: p.trainingSessionId.status,
        department: p.trainingSessionId.department,
        asset: p.trainingSessionId.assetId?._id ? {
          id: String(p.trainingSessionId.assetId.id || p.trainingSessionId.assetId._id),
          name: p.trainingSessionId.assetId.name || '',
          model: p.trainingSessionId.assetId.model || '',
          manufacturer: p.trainingSessionId.assetId.manufacturer || '',
          department: p.trainingSessionId.assetId.department || '',
        } : undefined,
        trainer: p.trainingSessionId.trainerId?._id ? {
          id: p.trainingSessionId.trainerId._id.toString(),
          name: p.trainingSessionId.trainerId.name || '',
          email: p.trainingSessionId.trainerId.email || '',
        } : undefined,
      } : undefined,
    }))

    // Transform certifications
    const certificationList = certifications.map((c: any) => ({
      id: c._id.toString(),
      certificationNumber: c.certificationNumber,
      asset: c.assetId?._id ? {
        id: String(c.assetId.id || c.assetId._id),
        name: c.assetId.name || '',
        model: c.assetId.model || '',
        manufacturer: c.assetId.manufacturer || '',
        department: c.assetId.department || '',
      } : undefined,
      issuedDate: c.issuedDate.toISOString(),
      expiryDate: c.expiryDate?.toISOString(),
      status: c.status,
      certificateUrl: c.certificateUrl,
      preTestScore: c.preTestScore,
      postTestScore: c.postTestScore,
      improvementPercentage: c.improvementPercentage,
    }))

    // Transform assessments
    const assessmentList = assessments.map((a: any) => ({
      id: a._id.toString(),
      trainingSessionId: a.trainingSessionId?._id?.toString() || '',
      sessionTitle: a.trainingSessionId?.title || '',
      sessionDate: a.trainingSessionId?.sessionDate?.toISOString(),
      assessmentType: a.assessmentType,
      score: a.score,
      maxScore: a.maxScore,
      completedAt: a.completedAt?.toISOString(),
    }))

    return NextResponse.json({
      success: true,
      data: {
        userId: userUuid,
        trainingHistory,
        certifications: certificationList,
        assessments: assessmentList,
        summary: {
          totalSessions: participants.length,
          attendedSessions: participants.filter((p: any) => p.attendanceStatus === 'Attended').length,
          certifiedEquipment: certifications.filter((c: any) => c.status === 'Active').length,
          activeCertifications: certifications.filter((c: any) => c.status === 'Active').length,
          expiringCertifications: certifications.filter((c: any) => {
            if (c.status !== 'Active' || !c.expiryDate) return false
            const expiryDate = new Date(c.expiryDate)
            const daysUntilExpiry = Math.ceil((expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
            return daysUntilExpiry <= 30 && daysUntilExpiry > 0
          }).length,
        },
      },
    })
  } catch (error: unknown) {
    console.error('Error fetching user training profile:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch user training profile'
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    )
  }
}

