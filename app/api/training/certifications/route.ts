import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db/mongodb'
import TrainingCertification from '@/lib/models/TrainingCertification'
import TrainingParticipant from '@/lib/models/TrainingParticipant'
import TrainingAssessment from '@/lib/models/TrainingAssessment'
import { getUserUuid } from '@/lib/services/userLookup'
import type { TrainingCertification as ITrainingCertification, PaginatedResponse } from '@/lib/types'

export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const userId = searchParams.get('userId') || ''
    const assetId = searchParams.get('assetId') || ''
    const status = searchParams.get('status') || ''
    const expiringSoon = searchParams.get('expiringSoon') === 'true'

    const query: Record<string, unknown> = {}

    if (userId) {
      // Find user by email or UUID - returns Prisma UUID string
      const userUuid = await getUserUuid(userId, 'User')
      // Find participant IDs for this user
      const participants = await TrainingParticipant.find({ userId: userUuid }).select('_id').lean()
      const participantIds = participants.map((p: any) => p._id)
      query.participantId = { $in: participantIds }
    }

    if (assetId) {
      query.assetId = assetId
    }

    if (status) {
      query.status = status
    }

    if (expiringSoon) {
      const thirtyDaysFromNow = new Date()
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)
      query.expiryDate = {
        $gte: new Date(),
        $lte: thirtyDaysFromNow,
      }
      query.status = 'Active'
    }

    const total = await TrainingCertification.countDocuments(query)

    const certifications = await TrainingCertification.find(query)
      .populate('assetId', 'id name model manufacturer department')
      .populate('participantId')
      .sort({ issuedDate: -1 })
      .limit(limit)
      .skip((page - 1) * limit)
      .lean()

    // Fetch user details from Prisma for participants and issuers
    const { prisma } = await import('@/lib/prisma')
    const allParticipantIds = certifications.map((c: any) => c.participantId?._id?.toString() || c.participantId?.toString()).filter(Boolean)
    const allParticipants = allParticipantIds.length > 0 ? await TrainingParticipant.find({
      _id: { $in: allParticipantIds },
    }).lean() : []
    const userIds = [...new Set([
      ...allParticipants.map((p: any) => p.userId),
      ...certifications.map((c: any) => c.issuedBy),
    ].filter(Boolean))]
    const users = userIds.length > 0 ? await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true, email: true, department: true, role: true },
    }) : []
    const userMap = new Map(users.map((u) => [u.id, u]))
    const participantMap = new Map(allParticipants.map((p: any) => [p._id.toString(), p]))

    const transformedCertifications: ITrainingCertification[] = certifications.map((c: any) => ({
      id: c._id.toString(),
      participantId: c.participantId?._id?.toString() || c.participantId?.toString() || '',
      participant: (() => {
        const participantId = c.participantId?._id?.toString() || c.participantId?.toString()
        if (!participantId) return undefined
        const participant = participantMap.get(participantId)
        if (!participant) return undefined
        const user = participant.userId && userMap.has(participant.userId) ? userMap.get(participant.userId)! : null
        return {
          id: participant._id.toString(),
          trainingSessionId: participant.trainingSessionId?.toString() || '',
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
          createdAt: participant.createdAt?.toISOString() || '',
          updatedAt: participant.updatedAt?.toISOString() || '',
        }
      })(),
      assetId: c.assetId?._id?.toString() || c.assetId?.toString() || '',
      asset: c.assetId?._id ? {
        id: c.assetId.id || c.assetId._id.toString(),
        name: c.assetId.name || '',
        model: c.assetId.model || '',
        manufacturer: c.assetId.manufacturer || '',
        department: c.assetId.department || '',
        status: c.assetId.status || 'Active',
        serialNumber: c.assetId.serialNumber || '',
        location: c.assetId.location || '',
        purchaseDate: c.assetId.purchaseDate?.toISOString() || '',
        nextPmDate: c.assetId.nextPmDate?.toISOString() || '',
        value: c.assetId.value || 0,
        createdAt: c.assetId.createdAt?.toISOString() || '',
        updatedAt: c.assetId.updatedAt?.toISOString() || '',
      } : undefined,
      certificationNumber: c.certificationNumber,
      issuedDate: c.issuedDate.toISOString(),
      expiryDate: c.expiryDate?.toISOString(),
      status: c.status,
      certificateUrl: c.certificateUrl,
      issuedBy: c.issuedBy || '',
      issuer: c.issuedBy && userMap.has(c.issuedBy) ? (() => {
        const u = userMap.get(c.issuedBy)!
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
      preTestScore: c.preTestScore,
      postTestScore: c.postTestScore,
      improvementPercentage: c.improvementPercentage,
      createdAt: c.createdAt.toISOString(),
      updatedAt: c.updatedAt.toISOString(),
    }))

    const response: PaginatedResponse<ITrainingCertification> = {
      data: transformedCertifications,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    }

    return NextResponse.json(response)
  } catch (error: unknown) {
    console.error('Error fetching certifications:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch certifications'
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB()
    const body = await request.json()

    // Validate required fields
    if (!body.participantId || !body.assetId || !body.issuedBy) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: participantId, assetId, issuedBy' },
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

    // Find asset by custom ID to get MongoDB ObjectId
    const Asset = (await import('@/lib/models/Asset')).default
    const asset = await Asset.findOne({ id: body.assetId })
    if (!asset) {
      return NextResponse.json(
        { success: false, error: `Asset with ID ${body.assetId} not found` },
        { status: 404 }
      )
    }

    // Find issuer by email or UUID - returns Prisma UUID string
    const issuerUuid = await getUserUuid(body.issuedBy, 'Issuer')

    // Get assessment scores if available
    const [preTest, postTest] = await Promise.all([
      TrainingAssessment.findOne({
        participantId: body.participantId,
        assessmentType: 'PreTest',
      }).lean(),
      TrainingAssessment.findOne({
        participantId: body.participantId,
        assessmentType: 'PostTest',
      }).lean(),
    ])

    const preTestScore = body.preTestScore !== undefined ? body.preTestScore : preTest?.score
    const postTestScore = body.postTestScore !== undefined ? body.postTestScore : postTest?.score

    // Calculate improvement percentage
    let improvementPercentage: number | undefined
    if (preTestScore !== undefined && postTestScore !== undefined && preTestScore > 0) {
      improvementPercentage = Math.round(((postTestScore - preTestScore) / preTestScore) * 100 * 100) / 100
    }

    const certification = await TrainingCertification.create({
      participantId: body.participantId,
      assetId: asset._id,
      issuedDate: body.issuedDate ? new Date(body.issuedDate) : new Date(),
      expiryDate: body.expiryDate ? new Date(body.expiryDate) : undefined,
      status: body.status || 'Active',
      certificateUrl: body.certificateUrl,
      issuedBy: issuerUuid,
      preTestScore,
      postTestScore,
      improvementPercentage,
    })

    // Update participant certification status
    await TrainingParticipant.findByIdAndUpdate(body.participantId, {
      certificationStatus: 'Certified',
      certifiedAt: new Date(),
      certificationExpiryDate: body.expiryDate ? new Date(body.expiryDate) : undefined,
    })

    const populatedCertification = await TrainingCertification.findById(certification._id)
      .populate('assetId', 'id name model manufacturer department')
      .populate('participantId')
      .lean()

    // Fetch participant and issuer details from Prisma
    const { prisma } = await import('@/lib/prisma')
    const participant = populatedCertification!.participantId?._id ? await TrainingParticipant.findById(populatedCertification!.participantId._id).lean() : null
    const participantUser = participant && participant.userId ? await prisma.user.findUnique({
      where: { id: participant.userId },
      select: { id: true, name: true, email: true, department: true, role: true },
    }) : null
    const issuer = populatedCertification!.issuedBy ? await prisma.user.findUnique({
      where: { id: populatedCertification!.issuedBy },
      select: { id: true, name: true, email: true, department: true, role: true },
    }) : null

    const transformedCertification: ITrainingCertification = {
      id: populatedCertification!._id.toString(),
      participantId: populatedCertification!.participantId?._id?.toString() || populatedCertification!.participantId?.toString() || '',
      assetId: populatedCertification!.assetId?._id?.toString() || populatedCertification!.assetId?.toString() || '',
      asset: populatedCertification!.assetId?._id ? {
        id: populatedCertification!.assetId.id || populatedCertification!.assetId._id.toString(),
        name: populatedCertification!.assetId.name || '',
        model: populatedCertification!.assetId.model || '',
        manufacturer: populatedCertification!.assetId.manufacturer || '',
        department: populatedCertification!.assetId.department || '',
        status: populatedCertification!.assetId.status || 'Active',
        serialNumber: populatedCertification!.assetId.serialNumber || '',
        location: populatedCertification!.assetId.location || '',
        purchaseDate: populatedCertification!.assetId.purchaseDate?.toISOString() || '',
        nextPmDate: populatedCertification!.assetId.nextPmDate?.toISOString() || '',
        value: populatedCertification!.assetId.value || 0,
        createdAt: populatedCertification!.assetId.createdAt?.toISOString() || '',
        updatedAt: populatedCertification!.assetId.updatedAt?.toISOString() || '',
      } : undefined,
      certificationNumber: populatedCertification!.certificationNumber,
      issuedDate: populatedCertification!.issuedDate.toISOString(),
      expiryDate: populatedCertification!.expiryDate?.toISOString(),
      status: populatedCertification!.status,
      certificateUrl: populatedCertification!.certificateUrl,
      issuedBy: populatedCertification!.issuedBy || '',
      issuer: issuer ? {
        id: issuer.id,
        email: issuer.email || '',
        name: issuer.name || '',
        role: issuer.role || 'viewer',
        department: issuer.department || '',
        createdAt: '',
        updatedAt: '',
      } : undefined,
      preTestScore: populatedCertification!.preTestScore,
      postTestScore: populatedCertification!.postTestScore,
      improvementPercentage: populatedCertification!.improvementPercentage,
      createdAt: populatedCertification!.createdAt.toISOString(),
      updatedAt: populatedCertification!.updatedAt.toISOString(),
    }

    return NextResponse.json({
      success: true,
      data: transformedCertification,
    })
  } catch (error: unknown) {
    console.error('Error creating certification:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to create certification'
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    await connectDB()
    const body = await request.json()

    if (!body.id) {
      return NextResponse.json(
        { success: false, error: 'Certification id is required' },
        { status: 400 }
      )
    }

    const updateData: Record<string, unknown> = {}
    
    if (body.expiryDate !== undefined) updateData.expiryDate = body.expiryDate ? new Date(body.expiryDate) : null
    if (body.status) updateData.status = body.status
    if (body.certificateUrl !== undefined) updateData.certificateUrl = body.certificateUrl

    // If renewing, update status and issued date
    if (body.status === 'Renewed') {
      updateData.issuedDate = new Date()
      if (body.expiryDate) {
        updateData.expiryDate = new Date(body.expiryDate)
      }
    }

    const certification = await TrainingCertification.findByIdAndUpdate(
      body.id,
      updateData,
      { new: true }
    )
      .populate('assetId', 'id name model manufacturer department')
      .populate('participantId')
      .lean()

    // Fetch participant and issuer details from Prisma
    const { prisma } = await import('@/lib/prisma')
    const participant = certification.participantId?._id ? await TrainingParticipant.findById(certification.participantId._id).lean() : null
    const participantUser = participant && participant.userId ? await prisma.user.findUnique({
      where: { id: participant.userId },
      select: { id: true, name: true, email: true, department: true, role: true },
    }) : null
    const issuer = certification.issuedBy ? await prisma.user.findUnique({
      where: { id: certification.issuedBy },
      select: { id: true, name: true, email: true, department: true, role: true },
    }) : null

    if (!certification) {
      return NextResponse.json(
        { success: false, error: 'Certification not found' },
        { status: 404 }
      )
    }

    const transformedCertification: ITrainingCertification = {
      id: certification._id.toString(),
      participantId: certification.participantId?._id?.toString() || certification.participantId?.toString() || '',
      assetId: certification.assetId?._id?.toString() || certification.assetId?.toString() || '',
      asset: certification.assetId?._id ? {
        id: certification.assetId.id || certification.assetId._id.toString(),
        name: certification.assetId.name || '',
        model: certification.assetId.model || '',
        manufacturer: certification.assetId.manufacturer || '',
        department: certification.assetId.department || '',
        status: certification.assetId.status || 'Active',
        serialNumber: certification.assetId.serialNumber || '',
        location: certification.assetId.location || '',
        purchaseDate: certification.assetId.purchaseDate?.toISOString() || '',
        nextPmDate: certification.assetId.nextPmDate?.toISOString() || '',
        value: certification.assetId.value || 0,
        createdAt: certification.assetId.createdAt?.toISOString() || '',
        updatedAt: certification.assetId.updatedAt?.toISOString() || '',
      } : undefined,
      certificationNumber: certification.certificationNumber,
      issuedDate: certification.issuedDate.toISOString(),
      expiryDate: certification.expiryDate?.toISOString(),
      status: certification.status,
      certificateUrl: certification.certificateUrl,
      issuedBy: certification.issuedBy || '',
      issuer: issuer ? {
        id: issuer.id,
        email: issuer.email || '',
        name: issuer.name || '',
        role: issuer.role || 'viewer',
        department: issuer.department || '',
        createdAt: '',
        updatedAt: '',
      } : undefined,
      preTestScore: certification.preTestScore,
      postTestScore: certification.postTestScore,
      improvementPercentage: certification.improvementPercentage,
      createdAt: certification.createdAt.toISOString(),
      updatedAt: certification.updatedAt.toISOString(),
    }

    return NextResponse.json({
      success: true,
      data: transformedCertification,
    })
  } catch (error: unknown) {
    console.error('Error updating certification:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to update certification'
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    )
  }
}

