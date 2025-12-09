// Vendor Registration API route - Public endpoint for vendors to apply

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

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

    if (!body.email) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        { success: false, error: 'Please provide a valid email address' },
        { status: 400 }
      )
    }

    // Check for duplicate email
    const existingVendor = await prisma.vendor.findFirst({
      where: { email: body.email.toLowerCase() },
    })
    if (existingVendor) {
      return NextResponse.json(
        { success: false, error: 'A vendor with this email already exists' },
        { status: 400 }
      )
    }

    // Create new vendor with Pending status
    const vendor = await prisma.vendor.create({
      data: {
        name: body.name,
        contactPerson: body.contactPerson,
        email: body.email.toLowerCase(),
        phone: body.phone,
        address: body.address,
        status: 'Pending', // New vendors start with Pending status
        // rating and performanceScore are not set during registration
      },
    })

    const vendorResponse = {
      ...vendor,
      id: vendor.id,
      status: vendor.status,
      escalationMatrix: [], // Not in schema, return empty array
      createdAt: vendor.createdAt.toISOString(),
      updatedAt: vendor.updatedAt.toISOString(),
    }

    return NextResponse.json(
      {
        success: true,
        data: vendorResponse,
        message: 'Vendor application submitted successfully. We will review your application and get back to you soon.',
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Error creating vendor registration:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to submit vendor application' },
      { status: 500 }
    )
  }
}

