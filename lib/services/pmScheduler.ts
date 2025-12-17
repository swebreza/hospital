// PM Scheduler Service for auto-generating PM schedules

import { prisma } from '../prisma'
import { pmTemplateService } from './pmTemplateService'
import { addMonths, isAfter, isBefore, startOfDay } from 'date-fns'

interface SchedulePMParams {
  assetId: string
  scheduledDate: Date
  technicianId?: string
  templateId?: string
}

class PMSchedulerService {
  /**
   * Auto-generate PM schedules based on manufacturer recommendations and templates
   */
  async autoSchedulePMs(assetIds?: string[]) {
    const where: any = {}
    if (assetIds && assetIds.length > 0) {
      where.id = { in: assetIds }
    }

    const assets = await prisma.asset.findMany({
      where,
      include: {
        preventiveMaintenances: {
          where: {
            status: { in: ['Scheduled', 'InProgress'] },
          },
          orderBy: { scheduledDate: 'desc' },
          take: 1,
        },
      },
    })

    const scheduledPMs = []

    for (const asset of assets) {
      // Get template for this asset type
      const template = await pmTemplateService.getTemplate(
        asset.model || 'Unknown',
        asset.manufacturer || undefined
      )

      if (!template) {
        console.warn(`No PM template found for asset ${asset.id} (${asset.model})`)
        continue
      }

      // Calculate next PM date
      let nextPMDate: Date

      if (asset.nextPmDate) {
        // Use existing next PM date if available
        nextPMDate = new Date(asset.nextPmDate)
      } else if (asset.preventiveMaintenances.length > 0) {
        // Calculate from last completed PM
        const lastPM = asset.preventiveMaintenances[0]
        if (lastPM.completedDate) {
          nextPMDate = addMonths(new Date(lastPM.completedDate), template.frequencyMonths)
        } else {
          // If last PM is not completed, use scheduled date
          nextPMDate = addMonths(new Date(lastPM.scheduledDate), template.frequencyMonths)
        }
      } else {
        // First PM - schedule based on purchase date or current date
        const baseDate = asset.purchaseDate
          ? new Date(asset.purchaseDate)
          : new Date()
        nextPMDate = addMonths(baseDate, template.frequencyMonths)
      }

      // Check if PM is already scheduled for this date
      const existingPM = await prisma.preventiveMaintenance.findFirst({
        where: {
          assetId: asset.id,
          scheduledDate: {
            gte: startOfDay(nextPMDate),
            lt: addMonths(startOfDay(nextPMDate), 1),
          },
          status: { in: ['Scheduled', 'InProgress'] },
        },
      })

      if (existingPM) {
        continue // PM already scheduled
      }

      // Create new PM
      const pm = await prisma.preventiveMaintenance.create({
        data: {
          assetId: asset.id,
          scheduledDate: nextPMDate,
          status: 'Scheduled',
        },
      })

      // Create checklist from template
      await pmTemplateService.getChecklistForPM(pm.id, template)

      // Update asset's next PM date
      await prisma.asset.update({
        where: { id: asset.id },
        data: { nextPmDate: nextPMDate },
      })

      scheduledPMs.push(pm)
    }

    return scheduledPMs
  }

  /**
   * Schedule a single PM
   */
  async schedulePM(params: SchedulePMParams) {
    const pm = await prisma.preventiveMaintenance.create({
      data: {
        assetId: params.assetId,
        scheduledDate: params.scheduledDate,
        technicianId: params.technicianId,
        status: 'Scheduled',
      },
    })

    // If template provided, create checklist
    if (params.templateId) {
      const template = await prisma.pMTemplate.findUnique({
        where: { id: params.templateId },
      })

      if (template) {
        await pmTemplateService.getChecklistForPM(pm.id, template)
      }
    }

    // Update asset's next PM date
    await prisma.asset.update({
      where: { id: params.assetId },
      data: { nextPmDate: params.scheduledDate },
    })

    return pm
  }

  /**
   * Calculate next PM date after completion
   */
  async calculateNextPMDate(pmId: string): Promise<Date | null> {
    const pm = await prisma.preventiveMaintenance.findUnique({
      where: { id: pmId },
      include: { asset: true },
    })

    if (!pm || !pm.completedDate) {
      return null
    }

    // Get template
    const template = await pmTemplateService.getTemplate(
      pm.asset.model || 'Unknown',
      pm.asset.manufacturer || undefined
    )

    if (!template) {
      return null
    }

    // Calculate next date based on completion date and frequency
    const nextDate = addMonths(new Date(pm.completedDate), template.frequencyMonths)

    // Update asset
    await prisma.asset.update({
      where: { id: pm.assetId },
      data: { nextPmDate: nextDate },
    })

    return nextDate
  }

  /**
   * Reschedule PM
   */
  async reschedulePM(pmId: string, newDate: Date) {
    return prisma.preventiveMaintenance.update({
      where: { id: pmId },
      data: {
        scheduledDate: newDate,
        status: 'Scheduled',
      },
    })
  }

  /**
   * Mark PM as overdue
   */
  async markOverduePMs() {
    const today = startOfDay(new Date())

    const overduePMs = await prisma.preventiveMaintenance.updateMany({
      where: {
        status: { in: ['Scheduled', 'InProgress'] },
        scheduledDate: {
          lt: today,
        },
      },
      data: {
        status: 'Overdue',
      },
    })

    return overduePMs.count
  }

  /**
   * Get upcoming PMs
   */
  async getUpcomingPMs(daysAhead: number = 30) {
    const today = startOfDay(new Date())
    const futureDate = addMonths(today, 1) // Approximate 30 days

    return prisma.preventiveMaintenance.findMany({
      where: {
        status: { in: ['Scheduled', 'InProgress'] },
        scheduledDate: {
          gte: today,
          lte: futureDate,
        },
      },
      include: {
        asset: true,
        technician: true,
      },
      orderBy: { scheduledDate: 'asc' },
    })
  }

  /**
   * Get overdue PMs
   */
  async getOverduePMs() {
    const today = startOfDay(new Date())

    return prisma.preventiveMaintenance.findMany({
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
      orderBy: { scheduledDate: 'asc' },
    })
  }
}

export const pmScheduler = new PMSchedulerService()







