import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import type { User } from '@/lib/types'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const role = searchParams.get('role')
    const search = searchParams.get('search') || ''

    const where: any = {}
    
    if (role) {
      where.role = role
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ]
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        department: true,
      },
      orderBy: {
        name: 'asc',
      },
    })

    const transformedUsers: User[] = users.map((user) => ({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as User['role'],
      department: user.department || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }))

    return NextResponse.json({
      success: true,
      data: transformedUsers,
    })
  } catch (error: unknown) {
    console.error('Error fetching users:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch users'
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    )
  }
}




