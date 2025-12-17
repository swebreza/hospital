// PM Acknowledgements API route

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { pmId, userId } = body

    // Create acknowledgement request
    const acknowledgement = await prisma.userAcknowledgement.create({
      data: {
        entityType: 'preventive_maintenance',
        entityId: pmId,
        userId,
        status: 'Pending',
      },
    })

    return NextResponse.json({
      success: true,
      data: acknowledgement,
    })
  } catch (error: any) {
    console.error('Error creating acknowledgement request:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create acknowledgement request' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const entityType = searchParams.get('entityType') || 'preventive_maintenance'
    const entityId = searchParams.get('entityId')

    const where: any = { entityType }
    if (entityId) {
      where.entityId = entityId
    }

    const acknowledgements = await prisma.userAcknowledgement.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({
      success: true,
      data: acknowledgements,
    })
  } catch (error: any) {
    console.error('Error fetching acknowledgements:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch acknowledgements' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, status, comments } = body

    const acknowledgement = await prisma.userAcknowledgement.update({
      where: { id },
      data: {
        status,
        comments,
        acknowledgedAt: status === 'Acknowledged' ? new Date() : null,
      },
    })

    return NextResponse.json({
      success: true,
      data: acknowledgement,
    })
  } catch (error: any) {
    console.error('Error updating acknowledgement:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update acknowledgement' },
      { status: 500 }
    )
  }
}





