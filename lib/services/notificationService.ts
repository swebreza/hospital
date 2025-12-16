// Notification service for in-app, email, and SMS notifications

import { prisma } from '../prisma'
import { emailService } from './emailService'
import type { NotificationType } from '@prisma/client'

interface CreateNotificationParams {
  userId: string
  type: NotificationType
  title: string
  message?: string
  entityType?: string
  entityId?: string
  sendEmail?: boolean
  emailRecipients?: string[]
}

class NotificationService {
  async createNotification(params: CreateNotificationParams) {
    try {
      // Create in-app notification
      const notification = await prisma.notification.create({
        data: {
          userId: params.userId,
          type: params.type,
          title: params.title,
          message: params.message,
          entityType: params.entityType,
          entityId: params.entityId,
        },
      })

      // Send email if requested
      if (params.sendEmail && params.emailRecipients && params.emailRecipients.length > 0) {
        await emailService.sendEmail({
          to: params.emailRecipients,
          subject: params.title,
          html: params.message || params.title,
        })
      }

      return notification
    } catch (error) {
      console.error('Error creating notification:', error)
      throw error
    }
  }

  async createBulkNotifications(notifications: CreateNotificationParams[]) {
    const results = await Promise.allSettled(
      notifications.map((params) => this.createNotification(params))
    )

    const successful = results.filter((r) => r.status === 'fulfilled').length
    const failed = results.filter((r) => r.status === 'rejected').length

    return { successful, failed }
  }

  async markAsRead(notificationId: string) {
    return prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    })
  }

  async markAllAsRead(userId: string) {
    return prisma.notification.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: { isRead: true },
    })
  }

  async getUserNotifications(
    userId: string,
    options: {
      page?: number
      limit?: number
      unreadOnly?: boolean
    } = {}
  ) {
    const { page = 1, limit = 20, unreadOnly = false } = options
    const skip = (page - 1) * limit

    const where: any = { userId }
    if (unreadOnly) {
      where.isRead = false
    }

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.notification.count({ where }),
    ])

    return {
      data: notifications,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    }
  }

  async getUnreadCount(userId: string) {
    return prisma.notification.count({
      where: {
        userId,
        isRead: false,
      },
    })
  }

  // Notification templates for different types
  async notifyPMReminder(
    userId: string,
    pmData: {
      pmId: string
      assetName: string
      scheduledDate: Date
      daysUntil: number
    },
    options: { sendEmail?: boolean; email?: string } = {}
  ) {
    const daysUntil = pmData.daysUntil
    const title = `PM Reminder: ${pmData.assetName} - Due in ${daysUntil} day(s)`
    const message = `Preventive maintenance for ${pmData.assetName} is scheduled for ${pmData.scheduledDate.toLocaleDateString()}. Please ensure completion on time.`

    return this.createNotification({
      userId,
      type: 'PM_REMINDER',
      title,
      message,
      entityType: 'preventive_maintenance',
      entityId: pmData.pmId,
      sendEmail: options.sendEmail,
      emailRecipients: options.email ? [options.email] : undefined,
    })
  }

  async notifyPMOverdue(
    userId: string,
    pmData: {
      pmId: string
      assetName: string
      scheduledDate: Date
      daysOverdue: number
    },
    options: { sendEmail?: boolean; email?: string } = {}
  ) {
    const title = `URGENT: PM Overdue - ${pmData.assetName}`
    const message = `Preventive maintenance for ${pmData.assetName} is ${pmData.daysOverdue} day(s) overdue. Scheduled date: ${pmData.scheduledDate.toLocaleDateString()}. Please complete immediately.`

    if (options.sendEmail && options.email) {
      await emailService.sendPMOverdue([options.email], {
        assetName: pmData.assetName,
        scheduledDate: pmData.scheduledDate.toISOString(),
        daysOverdue: pmData.daysOverdue,
      })
    }

    return this.createNotification({
      userId,
      type: 'PM_OVERDUE',
      title,
      message,
      entityType: 'preventive_maintenance',
      entityId: pmData.pmId,
      sendEmail: false, // Already sent above
    })
  }

  async notifyCalibrationReminder(
    userId: string,
    calData: {
      calId: string
      assetName: string
      nextDueDate: Date
      daysUntil: number
    },
    options: { sendEmail?: boolean; email?: string } = {}
  ) {
    const title = `Calibration Reminder: ${calData.assetName} - Due in ${calData.daysUntil} day(s)`
    const message = `Calibration for ${calData.assetName} is due on ${calData.nextDueDate.toLocaleDateString()}. Please schedule before the due date.`

    if (options.sendEmail && options.email) {
      await emailService.sendCalibrationReminder([options.email], {
        assetName: calData.assetName,
        nextDueDate: calData.nextDueDate.toISOString(),
        daysUntil: calData.daysUntil,
      })
    }

    return this.createNotification({
      userId,
      type: 'CAL_REMINDER',
      title,
      message,
      entityType: 'calibration',
      entityId: calData.calId,
      sendEmail: false,
    })
  }

  async notifyComplaintAssigned(
    userId: string,
    complaintData: {
      complaintId: string
      assetName: string
      priority: string
      title: string
    },
    options: { sendEmail?: boolean; email?: string } = {}
  ) {
    const notificationTitle = `New Complaint Assigned: ${complaintData.complaintId}`
    const message = `A new complaint has been assigned to you:\n\nAsset: ${complaintData.assetName}\nPriority: ${complaintData.priority}\nTitle: ${complaintData.title}`

    if (options.sendEmail && options.email) {
      await emailService.sendComplaintAssigned([options.email], complaintData)
    }

    return this.createNotification({
      userId,
      type: 'COMPLAINT_ASSIGNED',
      title: notificationTitle,
      message,
      entityType: 'complaint',
      entityId: complaintData.complaintId,
      sendEmail: false,
    })
  }

  async notifyEscalation(
    userIds: string[],
    escalationData: {
      entityType: string
      entityId: string
      level: number
      message: string
    },
    options: { sendEmail?: boolean; emails?: string[] } = {}
  ) {
    const title = `Escalation Level ${escalationData.level}: ${escalationData.entityType}`
    const message = escalationData.message

    if (options.sendEmail && options.emails) {
      await emailService.sendEscalation(options.emails, escalationData)
    }

    const notifications = userIds.map((userId) => ({
      userId,
      type: 'ESCALATION' as NotificationType,
      title,
      message,
      entityType: escalationData.entityType,
      entityId: escalationData.entityId,
      sendEmail: false,
    }))

    return this.createBulkNotifications(notifications)
  }
}

export const notificationService = new NotificationService()




