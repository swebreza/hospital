import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db/mongodb'
import TrainingCertification from '@/lib/models/TrainingCertification'
import TrainingParticipant from '@/lib/models/TrainingParticipant'
import type { TrainingCertification as ITrainingCertification } from '@/lib/types'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB()
    const { id } = await params

    const certification = await TrainingCertification.findById(id)
      .populate('assetId', 'id name model manufacturer department location status')
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
      participant: participant ? {
        id: participant._id.toString(),
        trainingSessionId: participant.trainingSessionId?.toString() || '',
        userId: participant.userId || '',
        user: participantUser ? {
          id: participantUser.id,
          email: participantUser.email || '',
          name: participantUser.name || '',
          role: participantUser.role || 'viewer',
          department: participantUser.department || '',
          createdAt: '',
          updatedAt: '',
        } : undefined,
        attendanceStatus: participant.attendanceStatus,
        certificationStatus: participant.certificationStatus,
        createdAt: participant.createdAt?.toISOString() || '',
        updatedAt: participant.updatedAt?.toISOString() || '',
      } : undefined,
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
    console.error('Error fetching certification:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch certification'
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
      id,
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
      participant: participant ? {
        id: participant._id.toString(),
        trainingSessionId: participant.trainingSessionId?.toString() || '',
        userId: participant.userId || '',
        user: participantUser ? {
          id: participantUser.id,
          email: participantUser.email || '',
          name: participantUser.name || '',
          role: participantUser.role || 'viewer',
          department: participantUser.department || '',
          createdAt: '',
          updatedAt: '',
        } : undefined,
        attendanceStatus: participant.attendanceStatus,
        certificationStatus: participant.certificationStatus,
        createdAt: participant.createdAt?.toISOString() || '',
        updatedAt: participant.updatedAt?.toISOString() || '',
      } : undefined,
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

