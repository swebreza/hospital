// Work Orders API route

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import type { WorkOrder } from '@/lib/api/workorders'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status')
    const assetId = searchParams.get('assetId')

    const skip = (page - 1) * limit

    const where: any = {}
    if (status) {
      where.status = status.toUpperCase().replace(' ', '_')
    }
    if (assetId) {
      where.assetId = assetId
    }

    const [workOrders, total] = await Promise.all([
      prisma.workOrder.findMany({
        where,
        include: {
          asset: true,
          assignee: true,
          vendor: true,
          activities: {
            orderBy: { createdAt: 'desc' },
          },
          spareParts: {
            include: {
              inventoryItem: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.workOrder.count({ where }),
    ])

    return NextResponse.json({
      success: true,
      data: workOrders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error: any) {
    console.error('Error fetching work orders:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch work orders' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const workOrder = await prisma.workOrder.create({
      data: {
        id: body.id || `WO-${Date.now()}`,
        complaintId: body.complaintId,
        assetId: body.assetId,
        assignedTo: body.assignedTo,
        assignedVendorId: body.assignedVendorId,
        status: body.status || 'Created',
        laborHours: body.laborHours,
        totalCost: body.totalCost,
      },
      include: {
        asset: true,
        assignee: true,
        vendor: true,
      },
    })

    return NextResponse.json({
      success: true,
      data: workOrder,
    })
  } catch (error: any) {
    console.error('Error creating work order:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create work order' },
      { status: 500 }
    )
  }
}







