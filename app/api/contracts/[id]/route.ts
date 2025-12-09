// Contract detail API route

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const contract = await prisma.contract.findUnique({
      where: { id },
      include: {
        vendor: true,
        contractAssets: {
          include: {
            asset: true,
          },
        },
      },
    })

    if (!contract) {
      return NextResponse.json(
        { success: false, error: 'Contract not found' },
        { status: 404 }
      )
    }

    const now = new Date()
    const daysUntilExpiry = Math.ceil(
      (contract.endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    )

    const contractResponse = {
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
      createdAt: contract.createdAt.toISOString(),
      updatedAt: contract.updatedAt.toISOString(),
    }

    return NextResponse.json({
      success: true,
      data: contractResponse,
    })
  } catch (error: any) {
    console.error('Error fetching contract:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch contract' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const contract = await prisma.contract.findUnique({
      where: { id },
    })

    if (!contract) {
      return NextResponse.json(
        { success: false, error: 'Contract not found' },
        { status: 404 }
      )
    }

    // Validate dates
    if (body.startDate && body.endDate) {
      const startDate = new Date(body.startDate)
      const endDate = new Date(body.endDate)
      if (endDate <= startDate) {
        return NextResponse.json(
          { success: false, error: 'End date must be after start date' },
          { status: 400 }
        )
      }
    }

    // Update contract
    const updateData: any = {}
    if (body.type !== undefined) updateData.type = body.type
    if (body.startDate !== undefined) updateData.startDate = new Date(body.startDate)
    if (body.endDate !== undefined) updateData.endDate = new Date(body.endDate)
    if (body.value !== undefined) updateData.value = body.value
    if (body.renewalDate !== undefined)
      updateData.renewalDate = body.renewalDate ? new Date(body.renewalDate) : null
    if (body.status !== undefined) updateData.status = body.status

    const updatedContract = await prisma.contract.update({
      where: { id },
      data: updateData,
      include: {
        vendor: true,
        contractAssets: {
          include: {
            asset: true,
          },
        },
      },
    })

    // Update assets if provided
    if (body.assetIds !== undefined && Array.isArray(body.assetIds)) {
      // Delete existing contract assets
      await prisma.contractAsset.deleteMany({
        where: { contractId: id },
      })

      // Create new contract assets
      if (body.assetIds.length > 0) {
        await prisma.contractAsset.createMany({
          data: body.assetIds.map((assetId: string) => ({
            contractId: id,
            assetId,
          })),
        })
      }

      // Refetch with updated assets
      const contractWithAssets = await prisma.contract.findUnique({
        where: { id },
        include: {
          vendor: true,
          contractAssets: {
            include: {
              asset: true,
            },
          },
        },
      })

      if (contractWithAssets) {
        const contractResponse = {
          ...contractWithAssets,
          id: contractWithAssets.id,
          vendorId: contractWithAssets.vendorId,
          vendor: contractWithAssets.vendor,
          assetIds: contractWithAssets.contractAssets.map((ca) => ca.assetId),
          assets: contractWithAssets.contractAssets.map((ca) => ca.asset),
          startDate: contractWithAssets.startDate.toISOString(),
          endDate: contractWithAssets.endDate.toISOString(),
          renewalDate: contractWithAssets.renewalDate?.toISOString(),
          createdAt: contractWithAssets.createdAt.toISOString(),
          updatedAt: contractWithAssets.updatedAt.toISOString(),
        }

        return NextResponse.json({
          success: true,
          data: contractResponse,
        })
      }
    }

    const contractResponse = {
      ...updatedContract,
      id: updatedContract.id,
      vendorId: updatedContract.vendorId,
      vendor: updatedContract.vendor,
      assetIds: updatedContract.contractAssets.map((ca) => ca.assetId),
      assets: updatedContract.contractAssets.map((ca) => ca.asset),
      startDate: updatedContract.startDate.toISOString(),
      endDate: updatedContract.endDate.toISOString(),
      renewalDate: updatedContract.renewalDate?.toISOString(),
      createdAt: updatedContract.createdAt.toISOString(),
      updatedAt: updatedContract.updatedAt.toISOString(),
    }

    return NextResponse.json({
      success: true,
      data: contractResponse,
    })
  } catch (error: any) {
    console.error('Error updating contract:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update contract' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const contract = await prisma.contract.findUnique({
      where: { id },
    })

    if (!contract) {
      return NextResponse.json(
        { success: false, error: 'Contract not found' },
        { status: 404 }
      )
    }

    // Cancel contract (set status to Cancelled)
    const updatedContract = await prisma.contract.update({
      where: { id },
      data: {
        status: 'Cancelled',
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Contract cancelled successfully',
      data: {
        id: updatedContract.id,
        status: updatedContract.status,
      },
    })
  } catch (error: any) {
    console.error('Error cancelling contract:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to cancel contract' },
      { status: 500 }
    )
  }
}
