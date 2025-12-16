// Escalation Rules API route

import { NextRequest, NextResponse } from 'next/server'
import { escalationService } from '@/lib/services/escalationService'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const entityType = searchParams.get('entityType')

    const rules = await escalationService.getEscalationRules(entityType || undefined)

    return NextResponse.json({
      success: true,
      data: rules,
    })
  } catch (error: any) {
    console.error('Error fetching escalation rules:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch escalation rules' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const rule = await escalationService.createEscalationRule(body)

    return NextResponse.json({
      success: true,
      data: rule,
    })
  } catch (error: any) {
    console.error('Error creating escalation rule:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create escalation rule' },
      { status: 500 }
    )
  }
}



