// Work Order Activities API route

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const activity = await prisma.workOrderActivity.create({
      data: {
        workOrderId: id,
        activity: body.activity,
        performedBy: body.performedBy,
      },
    })

    return NextResponse.json({
      success: true,
      data: activity,
    })
  } catch (error: any) {
    console.error('Error adding activity:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to add activity' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const activities = await prisma.workOrderActivity.findMany({
      where: { workOrderId: id },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({
      success: true,
      data: activities,
    })
  } catch (error: any) {
    console.error('Error fetching activities:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch activities' },
      { status: 500 }
    )
  }
}







