// Calibrations API route

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import type { PaginatedResponse, Calibration } from '@/lib/types'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status')

    const skip = (page - 1) * limit

    const where: any = {}
    if (status) {
      where.status = status.toUpperCase().replace(' ', '_')
    }

    const [calibrations, total] = await Promise.all([
      prisma.calibration.findMany({
        where,
        include: {
          asset: true,
          vendor: true,
        },
        orderBy: { nextDueDate: 'asc' },
        skip,
        take: limit,
      }),
      prisma.calibration.count({ where }),
    ])

    const response: PaginatedResponse<Calibration> = {
      data: calibrations as any,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    }

    return NextResponse.json(response)
  } catch (error: any) {
    console.error('Error fetching calibrations:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch calibrations' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const calibration = await prisma.calibration.create({
      data: {
        assetId: body.assetId,
        calibrationDate: new Date(body.calibrationDate),
        nextDueDate: new Date(body.nextDueDate),
        vendorId: body.vendorId,
        status: body.status || 'Scheduled',
        notes: body.notes,
      },
      include: {
        asset: true,
        vendor: true,
      },
    })

    return NextResponse.json({
      success: true,
      data: calibration,
    })
  } catch (error: any) {
    console.error('Error creating calibration:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create calibration' },
      { status: 500 }
    )
  }
}





