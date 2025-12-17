// Escalation Service for handling escalations

import { prisma } from '../prisma'
import { notificationService } from './notificationService'
import { differenceInDays, startOfDay } from 'date-fns'

interface EscalationLevel {
  level: number
  daysOverdue: number
  notifyUserIds: string[]
}

class EscalationService {
  /**
   * Check and trigger escalations for overdue PMs
   */
  async checkAndEscalatePMs() {
    const today = startOfDay(new Date())

    // Get all escalation rules for PMs
    const escalationRules = await prisma.escalationRule.findMany({
      where: {
        entityType: 'preventive_maintenance',
        isActive: true,
      },
      orderBy: { escalationLevel: 'asc' },
    })

    // Get overdue PMs
    const overduePMs = await prisma.preventiveMaintenance.findMany({
      where: {
        status: { in: ['Scheduled', 'InProgress', 'Overdue'] },
        scheduledDate: {
          lt: today,
        },
      },
      include: {
        asset: true,
        technician: true,
      },
    })

    const escalations = []

    for (const pm of overduePMs) {
      const daysOverdue = differenceInDays(today, new Date(pm.scheduledDate))

      // Check each escalation rule
      for (const rule of escalationRules) {
        if (daysOverdue >= rule.daysOverdue) {
          // Check if already escalated at this level
          const existingEscalation = await prisma.notification.findFirst({
            where: {
              entityType: 'preventive_maintenance',
              entityId: pm.id,
              type: 'ESCALATION',
              title: {
                contains: `Level ${rule.escalationLevel}`,
              },
            },
          })

          if (!existingEscalation && rule.notifyUserIds.length > 0) {
            // Trigger escalation
            const escalationMessage = `PM for ${pm.asset.name} is ${daysOverdue} day(s) overdue (scheduled: ${new Date(pm.scheduledDate).toLocaleDateString()}). This requires immediate attention at escalation level ${rule.escalationLevel}.`

            // Get user emails for notification
            const users = await prisma.user.findMany({
              where: {
                id: { in: rule.notifyUserIds },
              },
            })

            const emails = users.map((u) => u.email).filter(Boolean) as string[]

            await notificationService.notifyEscalation(
              rule.notifyUserIds,
              {
                entityType: 'preventive_maintenance',
                entityId: pm.id,
                level: rule.escalationLevel,
                message: escalationMessage,
              },
              {
                sendEmail: true,
                emails,
              }
            )

            escalations.push({
              pmId: pm.id,
              level: rule.escalationLevel,
              daysOverdue,
            })
          }
        }
      }
    }

    return escalations
  }

  /**
   * Create or update escalation rule
   */
  async createEscalationRule(params: {
    entityType: string
    daysOverdue: number
    escalationLevel: number
    notifyUserIds: string[]
  }) {
    return prisma.escalationRule.create({
      data: params,
    })
  }

  /**
   * Get escalation rules
   */
  async getEscalationRules(entityType?: string) {
    const where: any = { isActive: true }
    if (entityType) {
      where.entityType = entityType
    }

    return prisma.escalationRule.findMany({
      where,
      orderBy: [{ entityType: 'asc' }, { escalationLevel: 'asc' }],
    })
  }

  /**
   * Update escalation rule
   */
  async updateEscalationRule(
    id: string,
    params: Partial<{
      daysOverdue: number
      escalationLevel: number
      notifyUserIds: string[]
      isActive: boolean
    }>
  ) {
    return prisma.escalationRule.update({
      where: { id },
      data: params,
    })
  }

  /**
   * Deactivate escalation rule
   */
  async deactivateEscalationRule(id: string) {
    return prisma.escalationRule.update({
      where: { id },
      data: { isActive: false },
    })
  }

  /**
   * Seed default escalation rules
   */
  async seedDefaultEscalationRules() {
    // Get admin and manager users for escalation
    const admins = await prisma.user.findMany({
      where: { role: { in: ['admin', 'manager'] } },
    })

    if (admins.length === 0) {
      console.warn('No admin or manager users found for escalation rules')
      return
    }

    const adminIds = admins.map((u) => u.id)

    const defaultRules = [
      {
        entityType: 'preventive_maintenance',
        daysOverdue: 1,
        escalationLevel: 1,
        notifyUserIds: adminIds.slice(0, 1), // First admin
      },
      {
        entityType: 'preventive_maintenance',
        daysOverdue: 3,
        escalationLevel: 2,
        notifyUserIds: adminIds.slice(0, 2), // First 2 admins
      },
      {
        entityType: 'preventive_maintenance',
        daysOverdue: 7,
        escalationLevel: 3,
        notifyUserIds: adminIds, // All admins
      },
    ]

    for (const rule of defaultRules) {
      const existing = await prisma.escalationRule.findFirst({
        where: {
          entityType: rule.entityType,
          daysOverdue: rule.daysOverdue,
          escalationLevel: rule.escalationLevel,
        },
      })

      if (!existing) {
        await this.createEscalationRule(rule)
      }
    }
  }
}

export const escalationService = new EscalationService()





