// PM Reminders API route

import { NextRequest, NextResponse } from 'next/server'
import { pmNotificationService } from '@/lib/services/pmNotificationService'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const daysAhead = parseInt(searchParams.get('daysAhead') || '7')

    const upcomingPMs = await pmNotificationService.getEngineerWorklist('') // This would need engineer ID

    // Filter by days ahead
    const today = new Date()
    const futureDate = new Date()
    futureDate.setDate(today.getDate() + daysAhead)

    const filteredPMs = upcomingPMs.filter((pm) => {
      const scheduledDate = new Date(pm.scheduledDate)
      return scheduledDate >= today && scheduledDate <= futureDate
    })

    return NextResponse.json({
      success: true,
      data: filteredPMs,
    })
  } catch (error: any) {
    console.error('Error fetching PM reminders:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch PM reminders' },
      { status: 500 }
    )
  }
}







