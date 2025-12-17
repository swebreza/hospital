// Individual PM API routes

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const pm = await prisma.preventiveMaintenance.findUnique({
      where: { id },
      include: {
        asset: true,
        technician: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        checklist: {
          orderBy: { orderIndex: 'asc' },
        },
      },
    })

    if (!pm) {
      return NextResponse.json(
        { success: false, error: 'PM not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: pm,
    })
  } catch (error: any) {
    console.error('Error fetching PM:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch PM' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const updateData: any = {}

    if (body.scheduledDate) {
      updateData.scheduledDate = new Date(body.scheduledDate)
    }
    if (body.completedDate) {
      updateData.completedDate = new Date(body.completedDate)
    }
    if (body.technicianId !== undefined) {
      updateData.technicianId = body.technicianId
    }
    if (body.status) {
      updateData.status = body.status.toUpperCase().replace(' ', '_')
    }
    if (body.notes !== undefined) {
      updateData.notes = body.notes
    }

    const pm = await prisma.preventiveMaintenance.update({
      where: { id },
      data: updateData,
      include: {
        asset: true,
        technician: true,
        checklist: {
          orderBy: { orderIndex: 'asc' },
        },
      },
    })

    return NextResponse.json({
      success: true,
      data: pm,
    })
  } catch (error: any) {
    console.error('Error updating PM:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update PM' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    await prisma.preventiveMaintenance.delete({
      where: { id },
    })

    return NextResponse.json({
      success: true,
      message: 'PM deleted successfully',
    })
  } catch (error: any) {
    console.error('Error deleting PM:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete PM' },
      { status: 500 }
    )
  }
}







