// Calibration Scheduler Service

import { prisma } from '../prisma'
import { addMonths, isAfter, startOfDay } from 'date-fns'

class CalibrationSchedulerService {
  /**
   * Auto-calculate next due date from calibration history
   */
  async calculateNextDueDate(assetId: string): Promise<Date | null> {
    // Get last calibration for this asset
    const lastCalibration = await prisma.calibration.findFirst({
      where: { assetId },
      orderBy: { calibrationDate: 'desc' },
    })

    if (!lastCalibration) {
      return null
    }

    // Calculate cycle (default 12 months, can be customized)
    const cycleMonths = 12 // This could come from asset settings or calibration history

    // Calculate next due date
    const nextDueDate = addMonths(new Date(lastCalibration.calibrationDate), cycleMonths)

    return nextDueDate
  }

  /**
   * Schedule calibration based on expiry
   */
  async scheduleCalibration(params: {
    assetId: string
    scheduledDate: Date
    vendorId?: string
  }) {
    // Calculate next due date
    const nextDueDate = await this.calculateNextDueDate(params.assetId) || addMonths(params.scheduledDate, 12)

    const calibration = await prisma.calibration.create({
      data: {
        assetId: params.assetId,
        calibrationDate: params.scheduledDate,
        nextDueDate,
        vendorId: params.vendorId,
        status: 'Scheduled',
      },
    })

    // Update asset's next calibration date
    await prisma.asset.update({
      where: { id: params.assetId },
      data: { nextCalibrationDate: nextDueDate },
    })

    return calibration
  }

  /**
   * Get upcoming calibrations
   */
  async getUpcomingCalibrations(daysAhead: number = 30) {
    const today = startOfDay(new Date())
    const futureDate = addMonths(today, 1)

    return prisma.calibration.findMany({
      where: {
        status: { in: ['Scheduled', 'InProgress'] },
        nextDueDate: {
          gte: today,
          lte: futureDate,
        },
      },
      include: {
        asset: true,
        vendor: true,
      },
      orderBy: { nextDueDate: 'asc' },
    })
  }

  /**
   * Get overdue calibrations
   */
  async getOverdueCalibrations() {
    const today = startOfDay(new Date())

    return prisma.calibration.findMany({
      where: {
        status: { in: ['Scheduled', 'InProgress', 'Overdue'] },
        nextDueDate: {
          lt: today,
        },
      },
      include: {
        asset: true,
        vendor: true,
      },
      orderBy: { nextDueDate: 'asc' },
    })
  }

  /**
   * Mark overdue calibrations
   */
  async markOverdueCalibrations() {
    const today = startOfDay(new Date())

    const result = await prisma.calibration.updateMany({
      where: {
        status: { in: ['Scheduled', 'InProgress'] },
        nextDueDate: {
          lt: today,
        },
      },
      data: {
        status: 'Overdue',
      },
    })

    return result.count
  }
}

export const calibrationScheduler = new CalibrationSchedulerService()




