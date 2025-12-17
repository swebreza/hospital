// Trigger escalation check

import { NextRequest, NextResponse } from 'next/server'
import { escalationService } from '@/lib/services/escalationService'

export async function POST(request: NextRequest) {
  try {
    const escalations = await escalationService.checkAndEscalatePMs()

    return NextResponse.json({
      success: true,
      data: {
        count: escalations.length,
        escalations,
      },
    })
  } catch (error: any) {
    console.error('Error triggering escalations:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to trigger escalations' },
      { status: 500 }
    )
  }
}





