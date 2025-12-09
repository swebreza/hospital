import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db/mongodb'
import MEAChecklist from '@/lib/models/MEAChecklist'
import Asset from '@/lib/models/Asset'
import type { MEAChecklist as IMEAChecklist } from '@/lib/types'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB()
    const { id } = await params

    const asset = await Asset.findOne({ id })
    if (!asset) {
      return NextResponse.json(
        { success: false, error: 'Asset not found' },
        { status: 404 }
      )
    }

    const checklists = await MEAChecklist.find({ assetId: asset._id })
      .populate('performedBy', 'name email')
      .sort({ performedDate: -1 })
      .lean()

    const transformed: IMEAChecklist[] = checklists.map((checklist) => ({
      id: checklist._id.toString(),
      assetId: id,
      checklistType: checklist.checklistType as IMEAChecklist['checklistType'],
      performedDate: checklist.performedDate.toISOString(),
      performedBy: checklist.performedBy
        ? (checklist.performedBy as { _id: { toString: () => string } })._id.toString()
        : undefined,
      status: checklist.status as IMEAChecklist['status'],
      notes: checklist.notes,
      documents: checklist.documents,
      createdAt: checklist.createdAt.toISOString(),
      updatedAt: checklist.updatedAt.toISOString(),
    }))

    return NextResponse.json({
      success: true,
      data: transformed,
    })
  } catch (error: unknown) {
    console.error('Error fetching MEA checklists:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch MEA checklists' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB()
    const { id } = await params
    const body = await request.json()

    const asset = await Asset.findOne({ id })
    if (!asset) {
      return NextResponse.json(
        { success: false, error: 'Asset not found' },
        { status: 404 }
      )
    }

    const checklist = new MEAChecklist({
      assetId: asset._id,
      checklistType: body.checklistType,
      performedDate: body.performedDate || new Date(),
      performedBy: body.performedBy,
      status: body.status || 'Pending',
      notes: body.notes,
      documents: body.documents || [],
    })

    await checklist.save()

    return NextResponse.json({
      success: true,
      data: checklist.toObject(),
    })
  } catch (error: unknown) {
    console.error('Error creating MEA checklist:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create MEA checklist' },
      { status: 500 }
    )
  }
}

