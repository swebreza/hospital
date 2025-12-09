import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db/mongodb'
import EquipmentUtilization from '@/lib/models/EquipmentUtilization'
import Asset from '@/lib/models/Asset'
import {
  recordUtilization,
  calculateUtilizationStats,
  getUtilizationTrends,
  identifyUtilizationIssues,
  type UtilizationRecord,
} from '@/lib/services/utilization'
import mongoose from 'mongoose'

export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const searchParams = request.nextUrl.searchParams
    const assetId = searchParams.get('assetId')
    const department = searchParams.get('department')
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')

    const query: Record<string, unknown> = {}

    if (assetId) {
      const asset = await Asset.findOne({ id: assetId })
      if (asset) {
        query.assetId = asset._id
      } else {
        return NextResponse.json(
          { success: false, error: 'Asset not found' },
          { status: 404 }
        )
      }
    }

    if (department) {
      const assets = await Asset.find({ department }).select('_id')
      const assetIds = assets.map((a) => a._id)
      query.assetId = { $in: assetIds }
    }

    if (dateFrom || dateTo) {
      query.date = {}
      if (dateFrom) {
        query.date.$gte = new Date(dateFrom)
      }
      if (dateTo) {
        query.date.$lte = new Date(dateTo)
      }
    }

    const total = await EquipmentUtilization.countDocuments(query)

    const records = await EquipmentUtilization.find(query)
      .populate('assetId', 'id name department')
      .populate('recordedBy', 'name email')
      .sort({ date: -1 })
      .limit(limit)
      .skip((page - 1) * limit)
      .lean()

    return NextResponse.json({
      success: true,
      data: records,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error: unknown) {
    console.error('Error fetching utilization records:', error)
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : 'Failed to fetch utilization records',
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const body = await request.json()
    const {
      assetId,
      date,
      usageHours,
      usageCount,
      recordedBy,
      notes,
    }: UtilizationRecord = body

    if (!assetId || !date) {
      return NextResponse.json(
        { success: false, error: 'assetId and date are required' },
        { status: 400 }
      )
    }

    const utilization = await recordUtilization({
      assetId,
      date,
      usageHours,
      usageCount,
      recordedBy,
      source: 'manual',
      notes,
    })

    return NextResponse.json({
      success: true,
      data: utilization,
    })
  } catch (error: unknown) {
    console.error('Error recording utilization:', error)
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : 'Failed to record utilization',
      },
      { status: 500 }
    )
  }
}

// Stats endpoint
export async function PUT(request: NextRequest) {
  try {
    await connectDB()

    const searchParams = request.nextUrl.searchParams
    const action = searchParams.get('action')

    if (action === 'stats') {
      const assetId = searchParams.get('assetId')
      const dateFrom = searchParams.get('dateFrom')
      const dateTo = searchParams.get('dateTo')

      if (!assetId) {
        return NextResponse.json(
          { success: false, error: 'assetId is required for stats' },
          { status: 400 }
        )
      }

      const stats = await calculateUtilizationStats(assetId, dateFrom || undefined, dateTo || undefined)

      if (!stats) {
        return NextResponse.json(
          { success: false, error: 'Asset not found' },
          { status: 404 }
        )
      }

      return NextResponse.json({
        success: true,
        data: stats,
      })
    }

    if (action === 'trends') {
      const assetId = searchParams.get('assetId')
      const dateFrom = searchParams.get('dateFrom')
      const dateTo = searchParams.get('dateTo')
      const groupBy = (searchParams.get('groupBy') || 'day') as 'day' | 'week' | 'month'

      if (!assetId || !dateFrom || !dateTo) {
        return NextResponse.json(
          { success: false, error: 'assetId, dateFrom, and dateTo are required for trends' },
          { status: 400 }
        )
      }

      const trends = await getUtilizationTrends(assetId, dateFrom, dateTo, groupBy)

      return NextResponse.json({
        success: true,
        data: trends,
      })
    }

    if (action === 'issues') {
      const thresholdLow = parseFloat(searchParams.get('thresholdLow') || '20')
      const thresholdHigh = parseFloat(searchParams.get('thresholdHigh') || '80')

      const issues = await identifyUtilizationIssues(thresholdLow, thresholdHigh)

      return NextResponse.json({
        success: true,
        data: issues,
      })
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action' },
      { status: 400 }
    )
  } catch (error: unknown) {
    console.error('Error getting utilization stats:', error)
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : 'Failed to get utilization stats',
      },
      { status: 500 }
    )
  }
}

