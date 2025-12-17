// PM Notification Service for sending PM reminders and notifications

import { prisma } from '../prisma'
import { notificationService } from './notificationService'
import { differenceInDays, addDays, startOfDay } from 'date-fns'

interface PMReminderConfig {
  daysBefore: number[]
  notifyEngineers: boolean
  notifyDepartments: boolean
  notifyVendors: boolean
}

class PMNotificationService {
  private defaultReminderDays = [7, 3, 1] // 7 days, 3 days, 1 day before

  /**
   * Send reminders for upcoming PMs
   */
  async sendPMReminders(config: Partial<PMReminderConfig> = {}) {
    const reminderDays = config.daysBefore || this.defaultReminderDays
    const today = startOfDay(new Date())

    const notifications = []

    for (const daysBefore of reminderDays) {
      const targetDate = addDays(today, daysBefore)
      const nextDay = addDays(targetDate, 1)

      // Find PMs scheduled for this date
      const pms = await prisma.preventiveMaintenance.findMany({
        where: {
          status: { in: ['Scheduled', 'InProgress'] },
          scheduledDate: {
            gte: targetDate,
            lt: nextDay,
          },
        },
        include: {
          asset: {
            include: {
              creator: true, // Department info
            },
          },
          technician: true,
        },
      })

      for (const pm of pms) {
        const daysUntil = differenceInDays(new Date(pm.scheduledDate), today)

        // Notify assigned technician
        if (config.notifyEngineers !== false && pm.technicianId) {
          const notification = await notificationService.notifyPMReminder(
            pm.technicianId,
            {
              pmId: pm.id,
              assetName: pm.asset.name,
              scheduledDate: new Date(pm.scheduledDate),
              daysUntil,
            },
            {
              sendEmail: true,
              email: pm.technician?.email,
            }
          )
          notifications.push(notification)
        }

        // Notify department (if asset has a department)
        if (config.notifyDepartments !== false && pm.asset.department) {
          // Get department users (this would need department-user mapping)
          // For now, we'll notify the asset creator
          if (pm.asset.createdBy && pm.asset.creator) {
            await notificationService.createNotification({
              userId: pm.asset.createdBy,
              type: 'PM_REMINDER',
              title: `PM Scheduled: ${pm.asset.name}`,
              message: `A preventive maintenance is scheduled for ${pm.asset.name} in your department on ${new Date(pm.scheduledDate).toLocaleDateString()}. The equipment may be unavailable during this time.`,
              entityType: 'preventive_maintenance',
              entityId: pm.id,
              sendEmail: true,
              emailRecipients: pm.asset.creator.email ? [pm.asset.creator.email] : undefined,
            })
          }
        }
      }
    }

    return notifications
  }

  /**
   * Send overdue PM notifications
   */
  async sendOverduePMNotifications() {
    const today = startOfDay(new Date())

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

    const notifications = []

    for (const pm of overduePMs) {
      const daysOverdue = differenceInDays(today, new Date(pm.scheduledDate))

      // Notify assigned technician
      if (pm.technicianId) {
        const notification = await notificationService.notifyPMOverdue(
          pm.technicianId,
          {
            pmId: pm.id,
            assetName: pm.asset.name,
            scheduledDate: new Date(pm.scheduledDate),
            daysOverdue,
          },
          {
            sendEmail: true,
            email: pm.technician?.email,
          }
        )
        notifications.push(notification)
      }

      // Update status to overdue if not already
      if (pm.status !== 'Overdue') {
        await prisma.preventiveMaintenance.update({
          where: { id: pm.id },
          data: { status: 'Overdue' },
        })
      }
    }

    return notifications
  }

  /**
   * Get engineer worklist (pending PMs)
   */
  async getEngineerWorklist(engineerId: string) {
    return prisma.preventiveMaintenance.findMany({
      where: {
        technicianId: engineerId,
        status: { in: ['Scheduled', 'InProgress', 'Overdue'] },
      },
      include: {
        asset: true,
      },
      orderBy: [
        { status: 'asc' }, // Overdue first
        { scheduledDate: 'asc' },
      ],
    })
  }

  /**
   * Notify department about PM completion
   */
  async notifyPMCompletion(pmId: string) {
    const pm = await prisma.preventiveMaintenance.findUnique({
      where: { id: pmId },
      include: {
        asset: {
          include: {
            creator: true,
          },
        },
      },
    })

    if (!pm || !pm.completedDate) {
      return
    }

    // Notify department that PM is complete and equipment is available
    if (pm.asset.createdBy) {
      await notificationService.createNotification({
        userId: pm.asset.createdBy,
        type: 'SYSTEM',
        title: `PM Completed: ${pm.asset.name}`,
        message: `Preventive maintenance for ${pm.asset.name} has been completed on ${new Date(pm.completedDate).toLocaleDateString()}. The equipment is now available for use.`,
        entityType: 'preventive_maintenance',
        entityId: pm.id,
        sendEmail: true,
        emailRecipients: pm.asset.creator?.email ? [pm.asset.creator.email] : undefined,
      })
    }
  }
}

export const pmNotificationService = new PMNotificationService()





