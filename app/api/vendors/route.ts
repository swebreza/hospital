// Vendors API route

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import type { PaginatedResponse, Vendor as VendorType } from '@/lib/types'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const minRating = searchParams.get('minRating')
    const sortBy = searchParams.get('sortBy') || 'name'
    const sortOrder = searchParams.get('sortOrder') || 'asc'

    // Build where clause
    const where: any = {}
    const status = searchParams.get('status')

    if (search) {
      // For MongoDB, use contains (case-sensitive) or regex for case-insensitive
      // Prisma 6.x with MongoDB supports contains but not mode: 'insensitive'
      const searchLower = search.toLowerCase()
      where.OR = [
        { name: { contains: search } },
        { contactPerson: { contains: search } },
        { email: { contains: search } },
      ]
    }

    if (status) {
      where.status = status
    }

    if (minRating) {
      where.rating = { gte: parseFloat(minRating) }
    }

    // Build orderBy
    const orderBy: any = {}
    if (sortBy === 'rating') {
      orderBy.rating = sortOrder === 'desc' ? 'desc' : 'asc'
    } else if (sortBy === 'performanceScore') {
      orderBy.performanceScore = sortOrder === 'desc' ? 'desc' : 'asc'
    } else {
      orderBy.name = sortOrder === 'desc' ? 'desc' : 'asc'
    }

    // Get total count
    const total = await prisma.vendor.count({ where })

    // Get paginated results
    const skip = (page - 1) * limit
    const vendors = await prisma.vendor.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      include: {
        contracts: {
          where: {
            status: 'Active',
          },
        },
      },
    })

    // Transform to match expected format
    const vendorsWithContracts = vendors.map((vendor) => ({
      ...vendor,
      id: vendor.id,
      activeContractsCount: vendor.contracts.length,
      status: vendor.status || 'Pending',
      createdAt: vendor.createdAt.toISOString(),
      updatedAt: vendor.updatedAt.toISOString(),
    }))

    const response: PaginatedResponse<VendorType> = {
      data: vendorsWithContracts as unknown as VendorType[],
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    }

    return NextResponse.json(response)
  } catch (error: any) {
    console.error('Error fetching vendors:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch vendors' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate required fields
    if (!body.name) {
      return NextResponse.json(
        { success: false, error: 'Vendor name is required' },
        { status: 400 }
      )
    }

    // Check for duplicate email if provided
    if (body.email) {
      const existingVendor = await prisma.vendor.findFirst({
        where: { email: body.email.toLowerCase() },
      })
      if (existingVendor) {
        return NextResponse.json(
          { success: false, error: 'Vendor with this email already exists' },
          { status: 400 }
        )
      }
    }

    // Create new vendor
    const vendor = await prisma.vendor.create({
      data: {
        name: body.name,
        contactPerson: body.contactPerson,
        email: body.email?.toLowerCase(),
        phone: body.phone,
        address: body.address,
        rating: body.rating || null,
        performanceScore: body.performanceScore || null,
        status: body.status || 'Active', // Default to Active if not provided (for admin-created vendors)
      },
    })

    const vendorResponse = {
      ...vendor,
      id: vendor.id,
      status: vendor.status || 'Active',
      escalationMatrix: [], // Not in schema, return empty array
      createdAt: vendor.createdAt.toISOString(),
      updatedAt: vendor.updatedAt.toISOString(),
    }

    return NextResponse.json(
      {
        success: true,
        data: vendorResponse,
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Error creating vendor:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create vendor' },
      { status: 500 }
    )
  }
}
