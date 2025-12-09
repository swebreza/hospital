// Vendor detail API route

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
        contracts: {
          include: {
            contractAssets: {
              include: {
                asset: true,
              },
            },
          },
        },
      },
    })

    if (!vendor) {
      return NextResponse.json(
        { success: false, error: 'Vendor not found' },
        { status: 404 }
      )
    }

    const activeContracts = vendor.contracts.filter((c) => c.status === 'Active')
    const expiredContracts = vendor.contracts.filter((c) => c.status === 'Expired')
    const totalContractValue = activeContracts.reduce(
      (sum, c) => sum + (c.value || 0),
      0
    )

    const vendorResponse = {
      ...vendor,
      id: vendor.id,
      activeContractsCount: activeContracts.length,
      totalContracts: vendor.contracts.length,
      expiredContractsCount: expiredContracts.length,
      totalContractValue,
      contracts: vendor.contracts.map((c) => ({
        ...c,
        id: c.id,
        vendorId: c.vendorId,
        vendor: {
          id: vendor.id,
          name: vendor.name,
          email: vendor.email,
          phone: vendor.phone,
        },
        assetIds: c.contractAssets.map((ca) => ca.assetId),
        assets: c.contractAssets.map((ca) => ca.asset),
        startDate: c.startDate.toISOString(),
        endDate: c.endDate.toISOString(),
        renewalDate: c.renewalDate?.toISOString(),
        createdAt: c.createdAt.toISOString(),
        updatedAt: c.updatedAt.toISOString(),
      })),
      status: 'Active', // Default status
      escalationMatrix: [], // Not in schema
      createdAt: vendor.createdAt.toISOString(),
      updatedAt: vendor.updatedAt.toISOString(),
    }

    return NextResponse.json({
      success: true,
      data: vendorResponse,
    })
  } catch (error: any) {
    console.error('Error fetching vendor:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch vendor' },
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

    const vendor = await prisma.vendor.findUnique({
      where: { id },
    })

    if (!vendor) {
      return NextResponse.json(
        { success: false, error: 'Vendor not found' },
        { status: 404 }
      )
    }

    // Check for duplicate email if email is being updated
    if (body.email && body.email !== vendor.email) {
      const existingVendor = await prisma.vendor.findFirst({
        where: {
          email: body.email.toLowerCase(),
          id: { not: id },
        },
      })
      if (existingVendor) {
        return NextResponse.json(
          { success: false, error: 'Vendor with this email already exists' },
          { status: 400 }
        )
      }
    }

    // Update vendor
    const updatedVendor = await prisma.vendor.update({
      where: { id },
      data: {
        name: body.name,
        contactPerson: body.contactPerson,
        email: body.email?.toLowerCase(),
        phone: body.phone,
        address: body.address,
        rating: body.rating,
        performanceScore: body.performanceScore,
      },
    })

    const vendorResponse = {
      ...updatedVendor,
      id: updatedVendor.id,
      status: 'Active', // Default status
      escalationMatrix: body.escalationMatrix || [], // Not in schema, but accept it
      createdAt: updatedVendor.createdAt.toISOString(),
      updatedAt: updatedVendor.updatedAt.toISOString(),
    }

    return NextResponse.json({
      success: true,
      data: vendorResponse,
    })
  } catch (error: any) {
    console.error('Error updating vendor:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update vendor' },
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

    const vendor = await prisma.vendor.findUnique({
      where: { id },
      include: {
        contracts: {
          where: {
            status: 'Active',
          },
        },
      },
    })

    if (!vendor) {
      return NextResponse.json(
        { success: false, error: 'Vendor not found' },
        { status: 404 }
      )
    }

    // Check for active contracts
    if (vendor.contracts.length > 0) {
      // Don't delete, just return message
      return NextResponse.json({
        success: true,
        message: 'Vendor has active contracts and cannot be deleted',
        data: {
          id: vendor.id,
        },
      })
    }

    // Delete vendor
    await prisma.vendor.delete({
      where: { id },
    })

    return NextResponse.json({
      success: true,
      message: 'Vendor deleted successfully',
    })
  } catch (error: any) {
    console.error('Error deleting vendor:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete vendor' },
      { status: 500 }
    )
  }
}
