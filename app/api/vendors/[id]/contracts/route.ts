// Vendor contracts API route

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status')
    const type = searchParams.get('type')

    const where: any = {
      vendorId: id,
    }

    if (status) {
      where.status = status
    }

    if (type) {
      where.type = type
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
      orderBy: {
        endDate: 'desc',
      },
    })

    const contractsResponse = contracts.map((contract) => ({
      ...contract,
      id: contract.id,
      vendorId: contract.vendorId,
      vendor: contract.vendor,
      assetIds: contract.contractAssets.map((ca) => ca.assetId),
      assets: contract.contractAssets.map((ca) => ca.asset),
      startDate: contract.startDate.toISOString(),
      endDate: contract.endDate.toISOString(),
      renewalDate: contract.renewalDate?.toISOString(),
      createdAt: contract.createdAt.toISOString(),
      updatedAt: contract.updatedAt.toISOString(),
    }))

    return NextResponse.json({
      success: true,
      data: contractsResponse,
    })
  } catch (error: any) {
    console.error('Error fetching vendor contracts:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch vendor contracts' },
      { status: 500 }
    )
  }
}
