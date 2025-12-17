// PM Checklist API route

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const checklist = await prisma.pMChecklistItem.findMany({
      where: { pmId: id },
      orderBy: { orderIndex: 'asc' },
    })

    return NextResponse.json({
      success: true,
      data: checklist,
    })
  } catch (error: any) {
    console.error('Error fetching checklist:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch checklist' },
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
    const { checklist } = body

    // Delete existing checklist items
    await prisma.pMChecklistItem.deleteMany({
      where: { pmId: id },
    })

    // Create new checklist items
    if (checklist && Array.isArray(checklist)) {
      await prisma.pMChecklistItem.createMany({
        data: checklist.map((item: any, index: number) => ({
          pmId: id,
          task: item.task,
          type: item.type,
          resultBoolean: item.resultBoolean,
          resultText: item.resultText,
          resultNumber: item.resultNumber,
          notes: item.notes,
          orderIndex: item.orderIndex ?? index,
        })),
      })
    }

    const updatedChecklist = await prisma.pMChecklistItem.findMany({
      where: { pmId: id },
      orderBy: { orderIndex: 'asc' },
    })

    return NextResponse.json({
      success: true,
      data: updatedChecklist,
    })
  } catch (error: any) {
    console.error('Error updating checklist:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update checklist' },
      { status: 500 }
    )
  }
}





