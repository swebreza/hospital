// PM API routes

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import type { PaginatedResponse, PreventiveMaintenance } from '@/lib/types'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status')
    const department = searchParams.get('department')
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')

    const skip = (page - 1) * limit

    const where: any = {}

    if (status) {
      where.status = status.toUpperCase().replace(' ', '_')
    }

    if (dateFrom || dateTo) {
      where.scheduledDate = {}
      if (dateFrom) {
        where.scheduledDate.gte = new Date(dateFrom)
      }
      if (dateTo) {
        where.scheduledDate.lte = new Date(dateTo)
      }
    }

    if (search) {
      where.OR = [
        { asset: { name: { contains: search, mode: 'insensitive' } } },
        { asset: { id: { contains: search, mode: 'insensitive' } } },
      ]
    }

    if (department) {
      where.asset = { ...where.asset, department }
    }

    const [pms, total] = await Promise.all([
      prisma.preventiveMaintenance.findMany({
        where,
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
        orderBy: { scheduledDate: 'asc' },
        skip,
        take: limit,
      }),
      prisma.preventiveMaintenance.count({ where }),
    ])

    const response: PaginatedResponse<PreventiveMaintenance> = {
      data: pms as any,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    }

    return NextResponse.json(response)
  } catch (error: any) {
    console.error('Error fetching PMs:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch PMs' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const pm = await prisma.preventiveMaintenance.create({
      data: {
        assetId: body.assetId,
        scheduledDate: new Date(body.scheduledDate),
        technicianId: body.technicianId,
        status: body.status || 'Scheduled',
        notes: body.notes,
      },
      include: {
        asset: true,
        technician: true,
      },
    })

    return NextResponse.json({
      success: true,
      data: pm,
    })
  } catch (error: any) {
    console.error('Error creating PM:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create PM' },
      { status: 500 }
    )
  }
}

