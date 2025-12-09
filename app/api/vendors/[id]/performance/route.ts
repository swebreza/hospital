// Vendor performance API route

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const vendor = await prisma.vendor.findUnique({
      where: { id },
      include: {
        contracts: true,
      },
    })

    if (!vendor) {
      return NextResponse.json(
        { success: false, error: 'Vendor not found' },
        { status: 404 }
      )
    }

    const contracts = vendor.contracts
    const activeContracts = contracts.filter((c) => c.status === 'Active')
    const expiredContracts = contracts.filter((c) => c.status === 'Expired')
    const totalContractValue = activeContracts.reduce(
      (sum, c) => sum + (c.value || 0),
      0
    )

    // Calculate contract expiry metrics
    const now = new Date()
    const expiringSoon = activeContracts.filter((c) => {
      const daysUntilExpiry = Math.ceil(
        (c.endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      )
      return daysUntilExpiry <= 90 && daysUntilExpiry > 0
    }).length

    const expired = activeContracts.filter((c) => c.endDate < now).length

    // Performance metrics
    const performanceMetrics = {
      rating: vendor.rating || 0,
      performanceScore: vendor.performanceScore || 0,
      totalContracts: contracts.length,
      activeContracts: activeContracts.length,
      expiredContracts: expiredContracts.length,
      totalContractValue,
      expiringSoon,
      expired,
      averageContractValue:
        activeContracts.length > 0
          ? totalContractValue / activeContracts.length
          : 0,
      contractRenewalRate:
        contracts.length > 0
          ? (
              (contracts.filter((c) => c.status === 'Renewed').length /
                contracts.length) *
              100
            ).toFixed(2)
          : '0.00',
    }

    return NextResponse.json({
      success: true,
      data: performanceMetrics,
    })
  } catch (error: any) {
    console.error('Error fetching vendor performance:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch vendor performance' },
      { status: 500 }
    )
  }
}
