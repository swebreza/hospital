// Contract Renewal Reminders API route

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { notificationService } from '@/lib/services/notificationService'
import { differenceInDays, addDays } from 'date-fns'

export async function POST(request: NextRequest) {
  try {
    const today = new Date()
    const reminderDays = [90, 60, 30] // Days before expiry

    const contracts = await prisma.contract.findMany({
      where: {
        status: 'Active',
      },
      include: {
        vendor: true,
      },
    })

    const reminders = []

    for (const contract of contracts) {
      const daysUntilExpiry = differenceInDays(new Date(contract.endDate), today)

      for (const reminderDay of reminderDays) {
        if (daysUntilExpiry <= reminderDay && daysUntilExpiry > reminderDay - 7) {
          // Get users to notify (admins/managers)
          const users = await prisma.user.findMany({
            where: { role: { in: ['admin', 'manager'] } },
          })

          for (const user of users) {
            await notificationService.createNotification({
              userId: user.id,
              type: 'SYSTEM',
              title: `Contract Expiring: ${contract.vendor.name}`,
              message: `Contract ${contract.type} with ${contract.vendor.name} expires in ${daysUntilExpiry} days (${new Date(contract.endDate).toLocaleDateString()}). Please review renewal.`,
              entityType: 'contract',
              entityId: contract.id,
              sendEmail: true,
              emailRecipients: user.email ? [user.email] : undefined,
            })
          }

          reminders.push({
            contractId: contract.id,
            daysUntilExpiry,
            reminderDay,
          })
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        count: reminders.length,
        reminders,
      },
    })
  } catch (error: any) {
    console.error('Error sending renewal reminders:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to send renewal reminders' },
      { status: 500 }
    )
  }
}







