// Demo Equipment API route

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const department = searchParams.get('department')
    const status = searchParams.get('status') // 'in' or 'out'

    const where: any = {}
    if (department) {
      where.department = department
    }
    if (status === 'in') {
      where.outDate = null
    } else if (status === 'out') {
      where.outDate = { not: null }
    }

    const demoEquipment = await prisma.demoEquipment.findMany({
      where,
      include: {
        asset: true,
        vendor: true,
      },
      orderBy: { inDate: 'desc' },
    })

    return NextResponse.json({
      success: true,
      data: demoEquipment,
    })
  } catch (error: any) {
    console.error('Error fetching demo equipment:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch demo equipment' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Generate demo sticker ID
    const demoSticker = `DEMO-${Date.now()}`

    const demoEquipment = await prisma.demoEquipment.create({
      data: {
        assetId: body.assetId,
        vendorId: body.vendorId,
        department: body.department,
        inDate: new Date(body.inDate),
        demoSticker,
        notes: body.notes,
      },
      include: {
        asset: true,
        vendor: true,
      },
    })

    return NextResponse.json({
      success: true,
      data: demoEquipment,
    })
  } catch (error: any) {
    console.error('Error creating demo equipment record:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create demo equipment record' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, outDate, demoFormUrl } = body

    const demoEquipment = await prisma.demoEquipment.update({
      where: { id },
      data: {
        outDate: outDate ? new Date(outDate) : null,
        demoFormUrl,
      },
      include: {
        asset: true,
        vendor: true,
      },
    })

    return NextResponse.json({
      success: true,
      data: demoEquipment,
    })
  } catch (error: any) {
    console.error('Error updating demo equipment:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update demo equipment' },
      { status: 500 }
    )
  }
}



