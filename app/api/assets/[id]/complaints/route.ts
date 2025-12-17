import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireRole } from '@/lib/auth/api-auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireRole(['normal', 'full_access'])
  if (authResult.error) return authResult.error

  try {
    const { id } = await params

    const complaints = await prisma.complaint.findMany({
      where: { assetId: id },
      include: {
        asset: true,
        reporter: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { reportedAt: 'desc' },
    })

    return NextResponse.json({
      success: true,
      data: complaints,
    })
  } catch (error: any) {
    console.error('Error fetching asset complaints:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch complaints' },
      { status: 500 }
    )
  }
}

