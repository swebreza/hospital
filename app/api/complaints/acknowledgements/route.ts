// Complaint Acknowledgements API route

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { complaintId, userId } = body

    // Create acknowledgement request
    const acknowledgement = await prisma.userAcknowledgement.create({
      data: {
        entityType: 'complaint',
        entityId: complaintId,
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

    // If acknowledged, check if complaint can be closed
    if (status === 'Acknowledged') {
      const acknowledgement = await prisma.userAcknowledgement.findUnique({
        where: { id },
      })

      if (acknowledgement) {
        const allAcknowledgements = await prisma.userAcknowledgement.findMany({
          where: {
            entityType: 'complaint',
            entityId: acknowledgement.entityId,
          },
        })

        // If all required acknowledgements are received, allow complaint closure
        // This logic can be customized based on requirements
      }
    }

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





