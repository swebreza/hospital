import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db/mongodb'
import TrainingSession from '@/lib/models/TrainingSession'
import { getUserUuid } from '@/lib/services/userLookup'
import type { PaginatedResponse, TrainingSession as ITrainingSession, FilterOptions } from '@/lib/types'

export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''
    const department = searchParams.get('department') || ''
    const assetId = searchParams.get('assetId') || ''
    const dateFrom = searchParams.get('dateFrom') || ''
    const dateTo = searchParams.get('dateTo') || ''

    // Build query
    const query: Record<string, unknown> = {}

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ]
    }

    if (status) {
      query.status = status
    }

    if (department) {
      query.department = department
    }

    if (assetId) {
      // Find asset by custom ID to get MongoDB ObjectId
      const Asset = (await import('@/lib/models/Asset')).default
      const asset = await Asset.findOne({ id: assetId })
      if (asset) {
        query.assetId = asset._id
      } else {
        // Asset not found, return empty results
        query.assetId = null
      }
    }

    if (dateFrom || dateTo) {
      query.sessionDate = {}
      if (dateFrom) {
        query.sessionDate.$gte = new Date(dateFrom)
      }
      if (dateTo) {
        query.sessionDate.$lte = new Date(dateTo)
      }
    }

    // Get total count
    const total = await TrainingSession.countDocuments(query)

    // Get paginated results
    const sessions = await TrainingSession.find(query)
      .populate('assetId', 'id name model manufacturer department')
      .sort({ sessionDate: -1 })
      .limit(limit)
      .skip((page - 1) * limit)
      .lean()

    // Fetch trainer details for all sessions from Prisma
    const { prisma } = await import('@/lib/prisma')
    const trainerIds = [...new Set(sessions.map((s: any) => s.trainerId).filter(Boolean))]
    const trainers = await prisma.user.findMany({
      where: { id: { in: trainerIds } },
      select: { id: true, name: true, email: true, department: true, role: true },
    })
    const trainerMap = new Map(trainers.map((t) => [t.id, t]))

    // Transform to match ITrainingSession interface
    const transformedSessions: ITrainingSession[] = sessions.map((session: any) => ({
      id: session._id.toString(),
      assetId: session.assetId?._id?.toString() || session.assetId?.toString() || '',
      asset: session.assetId?._id ? {
        id: session.assetId.id || session.assetId._id.toString(),
        name: session.assetId.name || '',
        model: session.assetId.model || '',
        manufacturer: session.assetId.manufacturer || '',
        department: session.assetId.department || '',
        status: session.assetId.status || 'Active',
        serialNumber: session.assetId.serialNumber || '',
        location: session.assetId.location || '',
        purchaseDate: session.assetId.purchaseDate?.toISOString() || '',
        nextPmDate: session.assetId.nextPmDate?.toISOString() || '',
        value: session.assetId.value || 0,
        createdAt: session.assetId.createdAt?.toISOString() || '',
        updatedAt: session.assetId.updatedAt?.toISOString() || '',
      } : undefined,
      sessionDate: session.sessionDate.toISOString(),
      trainerId: session.trainerId || '',
      trainer: session.trainerId && trainerMap.has(session.trainerId) ? (() => {
        const t = trainerMap.get(session.trainerId)!
        return {
          id: t.id,
          email: t.email || '',
          name: t.name || '',
          role: t.role || 'viewer',
          department: t.department || '',
          createdAt: '',
          updatedAt: '',
        }
      })() : undefined,
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
    }))

    const response: PaginatedResponse<ITrainingSession> = {
      data: transformedSessions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    }

    return NextResponse.json(response)
  } catch (error: unknown) {
    console.error('Error fetching training sessions:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch training sessions'
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
    if (!body.assetId || !body.sessionDate || !body.trainerId || !body.title || !body.department) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: assetId, sessionDate, trainerId, title, department' },
        { status: 400 }
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

    // Find trainer by email or UUID - returns Prisma UUID string
    const trainerUuid = await getUserUuid(body.trainerId, 'Trainer')

    // Ensure trainerId is a plain string, not an ObjectId-like value
    const trainerIdString = String(trainerUuid).trim()
    
    if (!trainerIdString || trainerIdString.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid trainer ID' },
        { status: 400 }
      )
    }

    const session = await TrainingSession.create({
      assetId: asset._id,
      sessionDate: new Date(body.sessionDate),
      trainerId: trainerIdString, // Explicit string, not ObjectId
      title: body.title,
      description: body.description,
      department: body.department,
      location: body.location,
      durationMinutes: body.durationMinutes,
      status: body.status || 'Scheduled',
      notes: body.notes,
      documents: body.documents || [],
    })

    const populatedSession = await TrainingSession.findById(session._id)
      .populate('assetId', 'id name model manufacturer department')
      .lean()

    // Fetch trainer details from Prisma
    const { prisma } = await import('@/lib/prisma')
    const trainer = await prisma.user.findUnique({
      where: { id: trainerUuid },
      select: { id: true, name: true, email: true, department: true, role: true },
    })

    const transformedSession: ITrainingSession = {
      id: populatedSession!._id.toString(),
      assetId: populatedSession!.assetId?._id?.toString() || populatedSession!.assetId?.toString() || '',
      asset: populatedSession!.assetId?._id ? {
        id: populatedSession!.assetId.id || populatedSession!.assetId._id.toString(),
        name: populatedSession!.assetId.name || '',
        model: populatedSession!.assetId.model || '',
        manufacturer: populatedSession!.assetId.manufacturer || '',
        department: populatedSession!.assetId.department || '',
        status: populatedSession!.assetId.status || 'Active',
        serialNumber: populatedSession!.assetId.serialNumber || '',
        location: populatedSession!.assetId.location || '',
        purchaseDate: populatedSession!.assetId.purchaseDate?.toISOString() || '',
        nextPmDate: populatedSession!.assetId.nextPmDate?.toISOString() || '',
        value: populatedSession!.assetId.value || 0,
        createdAt: populatedSession!.assetId.createdAt?.toISOString() || '',
        updatedAt: populatedSession!.assetId.updatedAt?.toISOString() || '',
      } : undefined,
      sessionDate: populatedSession!.sessionDate.toISOString(),
      trainerId: populatedSession!.trainerId || '',
      trainer: trainer ? {
        id: trainer.id,
        email: trainer.email || '',
        name: trainer.name || '',
        role: trainer.role || 'viewer',
        department: trainer.department || '',
        createdAt: '', // Prisma doesn't return timestamps in select
        updatedAt: '',
      } : undefined,
      title: populatedSession!.title,
      description: populatedSession!.description,
      department: populatedSession!.department,
      location: populatedSession!.location,
      durationMinutes: populatedSession!.durationMinutes,
      status: populatedSession!.status,
      notes: populatedSession!.notes,
      documents: populatedSession!.documents,
      createdAt: populatedSession!.createdAt.toISOString(),
      updatedAt: populatedSession!.updatedAt.toISOString(),
    }

    return NextResponse.json({
      success: true,
      data: transformedSession,
    })
  } catch (error: unknown) {
    console.error('Error creating training session:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to create training session'
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    )
  }
}

