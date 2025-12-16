// Complaints API route

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import type { PaginatedResponse, Complaint } from '@/lib/types'
import { addHours } from 'date-fns'
import { requireRole } from '@/lib/auth/api-auth'

export async function GET(request: NextRequest) {
  const authResult = await requireRole(['normal', 'full_access'])
  if (authResult.error) return authResult.error

  try {
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status')
    const priority = searchParams.get('priority')

    const skip = (page - 1) * limit

    const where: any = {}
    if (status) {
      where.status = status.toUpperCase().replace(' ', '_')
    }
    if (priority) {
      where.priority = priority
    }

    const [complaints, total] = await Promise.all([
      prisma.complaint.findMany({
        where,
        include: {
          asset: true,
          reporter: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          assignee: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: { reportedAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.complaint.count({ where }),
    ])

    const response: PaginatedResponse<Complaint> = {
      data: complaints as any,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    }

    return NextResponse.json(response)
  } catch (error: any) {
    console.error('Error fetching complaints:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch complaints' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  const authResult = await requireRole(['normal', 'full_access'])
  if (authResult.error) return authResult.error

  try {
    const body = await request.json()

    // Calculate SLA deadline based on priority
    let slaDeadline: Date | null = null
    const now = new Date()
    switch (body.priority) {
      case 'Critical':
        slaDeadline = addHours(now, 2)
        break
      case 'High':
        slaDeadline = addHours(now, 4)
        break
      case 'Medium':
        slaDeadline = addHours(now, 8)
        break
      case 'Low':
        slaDeadline = addHours(now, 24)
        break
    }

    const complaint = await prisma.complaint.create({
      data: {
        id: body.id || `COMP-${Date.now()}`,
        assetId: body.assetId,
        title: body.title,
        description: body.description,
        priority: body.priority,
        status: 'Open',
        reportedBy: body.reportedBy,
        assignedTo: body.assignedTo,
        slaDeadline,
      },
      include: {
        asset: true,
        reporter: true,
        assignee: true,
      },
    })

    return NextResponse.json({
      success: true,
      data: complaint,
    })
  } catch (error: any) {
    console.error('Error creating complaint:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create complaint' },
      { status: 500 }
    )
  }
}



