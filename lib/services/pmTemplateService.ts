// PM Template Service for managing PM templates

import { prisma } from '../prisma'
import type { PMTemplate, PMChecklistItem } from '@prisma/client'

interface ChecklistTemplate {
  task: string
  type: 'boolean' | 'text' | 'number'
  orderIndex: number
}

interface CreatePMTemplateParams {
  equipmentType: string
  manufacturer?: string
  frequencyMonths: number
  checklistTemplate: ChecklistTemplate[]
}

class PMTemplateService {
  async createTemplate(params: CreatePMTemplateParams) {
    return prisma.pMTemplate.create({
      data: {
        equipmentType: params.equipmentType,
        manufacturer: params.manufacturer,
        frequencyMonths: params.frequencyMonths,
        checklistTemplate: params.checklistTemplate as any,
      },
    })
  }

  async getTemplate(equipmentType: string, manufacturer?: string) {
    const where: any = { equipmentType }
    if (manufacturer) {
      where.manufacturer = manufacturer
    }

    return prisma.pMTemplate.findFirst({
      where,
      orderBy: { createdAt: 'desc' },
    })
  }

  async getAllTemplates() {
    return prisma.pMTemplate.findMany({
      orderBy: [{ equipmentType: 'asc' }, { manufacturer: 'asc' }],
    })
  }

  async updateTemplate(id: string, params: Partial<CreatePMTemplateParams>) {
    return prisma.pMTemplate.update({
      where: { id },
      data: {
        ...(params.equipmentType && { equipmentType: params.equipmentType }),
        ...(params.manufacturer !== undefined && { manufacturer: params.manufacturer }),
        ...(params.frequencyMonths && { frequencyMonths: params.frequencyMonths }),
        ...(params.checklistTemplate && { checklistTemplate: params.checklistTemplate as any }),
      },
    })
  }

  async deleteTemplate(id: string) {
    return prisma.pMTemplate.delete({
      where: { id },
    })
  }

  async getChecklistForPM(pmId: string, template?: PMTemplate) {
    if (template) {
      // Create checklist items from template
      const checklistTemplate = template.checklistTemplate as any as ChecklistTemplate[]
      const checklistItems = checklistTemplate.map((item, index) => ({
        pmId,
        task: item.task,
        type: item.type,
        orderIndex: item.orderIndex ?? index,
        resultBoolean: null,
        resultText: null,
        resultNumber: null,
        notes: null,
      }))

      return prisma.pMChecklistItem.createMany({
        data: checklistItems,
      })
    }

    // Return existing checklist if no template
    return prisma.pMChecklistItem.findMany({
      where: { pmId },
      orderBy: { orderIndex: 'asc' },
    })
  }

  // Seed default templates
  async seedDefaultTemplates() {
    const defaultTemplates: CreatePMTemplateParams[] = [
      {
        equipmentType: 'Ventilator',
        manufacturer: 'Getinge',
        frequencyMonths: 6,
        checklistTemplate: [
          { task: 'Visual inspection of exterior', type: 'boolean', orderIndex: 1 },
          { task: 'Check power cord and plug', type: 'boolean', orderIndex: 2 },
          { task: 'Verify battery backup function', type: 'boolean', orderIndex: 3 },
          { task: 'Clean filters and vents', type: 'boolean', orderIndex: 4 },
          { task: 'Run self-test diagnostic', type: 'boolean', orderIndex: 5 },
          { task: 'Verify alarm functionality', type: 'boolean', orderIndex: 6 },
          { task: 'Check pressure sensors', type: 'boolean', orderIndex: 7 },
          { task: 'Inspect breathing circuits', type: 'boolean', orderIndex: 8 },
        ],
      },
      {
        equipmentType: 'Patient Monitor',
        frequencyMonths: 3,
        checklistTemplate: [
          { task: 'Visual inspection', type: 'boolean', orderIndex: 1 },
          { task: 'Check display functionality', type: 'boolean', orderIndex: 2 },
          { task: 'Verify ECG leads', type: 'boolean', orderIndex: 3 },
          { task: 'Test SPO2 sensor', type: 'boolean', orderIndex: 4 },
          { task: 'Check NIBP cuff', type: 'boolean', orderIndex: 5 },
          { task: 'Verify alarm system', type: 'boolean', orderIndex: 6 },
          { task: 'Battery backup test', type: 'boolean', orderIndex: 7 },
        ],
      },
      {
        equipmentType: 'Defibrillator',
        frequencyMonths: 6,
        checklistTemplate: [
          { task: 'Visual inspection', type: 'boolean', orderIndex: 1 },
          { task: 'Battery check', type: 'boolean', orderIndex: 2 },
          { task: 'Paddle/pad inspection', type: 'boolean', orderIndex: 3 },
          { task: 'Self-test diagnostic', type: 'boolean', orderIndex: 4 },
          { task: 'Energy delivery test', type: 'boolean', orderIndex: 5 },
          { task: 'ECG display test', type: 'boolean', orderIndex: 6 },
          { task: 'Alarm functionality', type: 'boolean', orderIndex: 7 },
        ],
      },
      {
        equipmentType: 'Infusion Pump',
        frequencyMonths: 3,
        checklistTemplate: [
          { task: 'Visual inspection', type: 'boolean', orderIndex: 1 },
          { task: 'Flow rate accuracy test', type: 'boolean', orderIndex: 2 },
          { task: 'Occlusion alarm test', type: 'boolean', orderIndex: 3 },
          { task: 'Air-in-line detection test', type: 'boolean', orderIndex: 4 },
          { task: 'Battery backup test', type: 'boolean', orderIndex: 5 },
          { task: 'Display and keypad check', type: 'boolean', orderIndex: 6 },
        ],
      },
    ]

    for (const template of defaultTemplates) {
      const existing = await this.getTemplate(template.equipmentType, template.manufacturer)
      if (!existing) {
        await this.createTemplate(template)
      }
    }
  }
}

export const pmTemplateService = new PMTemplateService()







