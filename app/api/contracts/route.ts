// Contracts API route

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { notificationService } from '@/lib/services/notificationService'
import { differenceInDays } from 'date-fns'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const vendorId = searchParams.get('vendorId')
    const status = searchParams.get('status')

    const where: any = {}
    if (vendorId) {
      where.vendorId = vendorId
    }
    if (status) {
      where.status = status
    }

    const contracts = await prisma.contract.findMany({
      where,
      include: {
        vendor: true,
        contractAssets: {
          include: {
            asset: true,
          },
        },
      },
      orderBy: { endDate: 'asc' },
    })

    return NextResponse.json({
      success: true,
      data: contracts,
    })
  } catch (error: any) {
    console.error('Error fetching contracts:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch contracts' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const contract = await prisma.contract.create({
      data: {
        vendorId: body.vendorId,
        type: body.type,
        startDate: new Date(body.startDate),
        endDate: new Date(body.endDate),
        value: body.value,
        renewalDate: body.renewalDate ? new Date(body.renewalDate) : null,
        status: body.status || 'Active',
      },
      include: {
        vendor: true,
      },
    })

    // Link assets if provided
    if (body.assetIds && Array.isArray(body.assetIds)) {
      await prisma.contractAsset.createMany({
        data: body.assetIds.map((assetId: string) => ({
          contractId: contract.id,
          assetId,
        })),
      })
    }

    return NextResponse.json({
      success: true,
      data: contract,
    })
  } catch (error: any) {
    console.error('Error creating contract:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create contract' },
      { status: 500 }
    )
  }
}
