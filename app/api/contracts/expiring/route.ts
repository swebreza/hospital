// Expiring contracts API route

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const days = parseInt(searchParams.get('days') || '30')
    const vendorId = searchParams.get('vendorId')

    // Calculate date threshold
    const now = new Date()
    const thresholdDate = new Date()
    thresholdDate.setDate(thresholdDate.getDate() + days)

    const where: any = {
      status: 'Active',
      endDate: {
        gte: now,
        lte: thresholdDate,
      },
    }

    if (vendorId) {
      where.vendorId = vendorId
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
        endDate: 'asc',
      },
    })

    const contractsResponse = contracts.map((contract) => {
      const daysUntilExpiry = Math.ceil(
        (contract.endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      )

      let expiryLevel: 'critical' | 'warning' | 'info' = 'info'
      if (daysUntilExpiry <= 30) {
        expiryLevel = 'critical'
      } else if (daysUntilExpiry <= 60) {
        expiryLevel = 'warning'
      }

      return {
        ...contract,
        id: contract.id,
        vendorId: contract.vendorId,
        vendor: contract.vendor,
        assetIds: contract.contractAssets.map((ca) => ca.assetId),
        assets: contract.contractAssets.map((ca) => ca.asset),
        startDate: contract.startDate.toISOString(),
        endDate: contract.endDate.toISOString(),
        renewalDate: contract.renewalDate?.toISOString(),
        daysUntilExpiry,
        expiryLevel,
        createdAt: contract.createdAt.toISOString(),
        updatedAt: contract.updatedAt.toISOString(),
      }
    })

    return NextResponse.json({
      success: true,
      data: contractsResponse,
      summary: {
        total: contractsResponse.length,
        critical: contractsResponse.filter((c) => c.expiryLevel === 'critical').length,
        warning: contractsResponse.filter((c) => c.expiryLevel === 'warning').length,
        info: contractsResponse.filter((c) => c.expiryLevel === 'info').length,
      },
    })
  } catch (error: any) {
    console.error('Error fetching expiring contracts:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch expiring contracts' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const days = body.days || 30
    const vendorIds = body.vendorIds || []

    // Calculate date threshold
    const now = new Date()
    const thresholdDate = new Date()
    thresholdDate.setDate(thresholdDate.getDate() + days)

    const where: any = {
      status: 'Active',
      endDate: {
        gte: now,
        lte: thresholdDate,
      },
    }

    if (vendorIds.length > 0) {
      where.vendorId = { in: vendorIds }
    }

    const contracts = await prisma.contract.findMany({
      where,
      include: {
        vendor: true,
      },
    })

    // Generate renewal reminders
    const reminders = contracts.map((contract) => {
      const daysUntilExpiry = Math.ceil(
        (contract.endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      )

      return {
        contractId: contract.id,
        vendorId: contract.vendorId,
        vendorName: contract.vendor.name,
        vendorEmail: contract.vendor.email,
        contractType: contract.type,
        endDate: contract.endDate.toISOString(),
        daysUntilExpiry,
        renewalDate: contract.renewalDate?.toISOString(),
        message: `Contract ${contract.type} for ${contract.vendor.name} expires in ${daysUntilExpiry} days`,
      }
    })

    return NextResponse.json({
      success: true,
      data: reminders,
      count: reminders.length,
    })
  } catch (error: any) {
    console.error('Error generating renewal reminders:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to generate renewal reminders' },
      { status: 500 }
    )
  }
}
