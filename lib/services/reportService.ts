// Report Generation Service

import { prisma } from '../prisma'
import ExcelJS from 'exceljs'
import jsPDF from 'jspdf'

interface ReportOptions {
  format: 'pdf' | 'excel'
  dateFrom?: Date
  dateTo?: Date
  department?: string
  assetType?: string
}

class ReportService {
  /**
   * Generate PM completion report
   */
  async generatePMReport(pmId: string, format: 'pdf' | 'excel'): Promise<Buffer> {
    const pm = await prisma.preventiveMaintenance.findUnique({
      where: { id: pmId },
      include: {
        asset: true,
        technician: true,
        checklist: {
          orderBy: { orderIndex: 'asc' },
        },
      },
    })

    if (!pm) {
      throw new Error('PM not found')
    }

    if (format === 'excel') {
      return this.generatePMExcelReport(pm)
    } else {
      return this.generatePMPDFReport(pm)
    }
  }

  private async generatePMExcelReport(pm: any): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('PM Report')

    // Header
    worksheet.mergeCells('A1:D1')
    worksheet.getCell('A1').value = 'Preventive Maintenance Report'
    worksheet.getCell('A1').font = { size: 16, bold: true }
    worksheet.getCell('A1').alignment = { horizontal: 'center' }

    // Asset Information
    worksheet.addRow(['Asset Information', '', '', ''])
    worksheet.addRow(['Asset ID', pm.asset.id, '', ''])
    worksheet.addRow(['Asset Name', pm.asset.name, '', ''])
    worksheet.addRow(['Department', pm.asset.department, '', ''])
    worksheet.addRow(['Location', pm.asset.location || 'N/A', '', ''])

    // PM Information
    worksheet.addRow(['', '', '', ''])
    worksheet.addRow(['PM Information', '', '', ''])
    worksheet.addRow(['PM ID', pm.id, '', ''])
    worksheet.addRow(['Scheduled Date', new Date(pm.scheduledDate).toLocaleDateString(), '', ''])
    worksheet.addRow(['Completed Date', pm.completedDate ? new Date(pm.completedDate).toLocaleDateString() : 'N/A', '', ''])
    worksheet.addRow(['Status', pm.status, '', ''])
    worksheet.addRow(['Technician', pm.technician?.name || 'N/A', '', ''])

    // Checklist
    worksheet.addRow(['', '', '', ''])
    worksheet.addRow(['Checklist Items', '', '', ''])
    worksheet.addRow(['Task', 'Type', 'Result', 'Notes'])

    pm.checklist.forEach((item: any) => {
      let result = 'N/A'
      if (item.type === 'boolean') {
        result = item.resultBoolean === true ? 'Pass' : item.resultBoolean === false ? 'Fail' : 'N/A'
      } else if (item.type === 'text') {
        result = item.resultText || 'N/A'
      } else if (item.type === 'number') {
        result = item.resultNumber?.toString() || 'N/A'
      }

      worksheet.addRow([item.task, item.type, result, item.notes || ''])
    })

    // Generate buffer
    const buffer = await workbook.xlsx.writeBuffer()
    return Buffer.from(buffer)
  }

  private async generatePMPDFReport(pm: any): Promise<Buffer> {
    const doc = new jsPDF()

    // Title
    doc.setFontSize(16)
    doc.text('Preventive Maintenance Report', 105, 20, { align: 'center' })

    let y = 35

    // Asset Information
    doc.setFontSize(12)
    doc.text('Asset Information', 20, y)
    y += 10
    doc.setFontSize(10)
    doc.text(`Asset ID: ${pm.asset.id}`, 20, y)
    y += 7
    doc.text(`Asset Name: ${pm.asset.name}`, 20, y)
    y += 7
    doc.text(`Department: ${pm.asset.department}`, 20, y)
    y += 7
    doc.text(`Location: ${pm.asset.location || 'N/A'}`, 20, y)
    y += 15

    // PM Information
    doc.setFontSize(12)
    doc.text('PM Information', 20, y)
    y += 10
    doc.setFontSize(10)
    doc.text(`PM ID: ${pm.id}`, 20, y)
    y += 7
    doc.text(`Scheduled Date: ${new Date(pm.scheduledDate).toLocaleDateString()}`, 20, y)
    y += 7
    doc.text(`Completed Date: ${pm.completedDate ? new Date(pm.completedDate).toLocaleDateString() : 'N/A'}`, 20, y)
    y += 7
    doc.text(`Status: ${pm.status}`, 20, y)
    y += 7
    doc.text(`Technician: ${pm.technician?.name || 'N/A'}`, 20, y)
    y += 15

    // Checklist
    doc.setFontSize(12)
    doc.text('Checklist Items', 20, y)
    y += 10
    doc.setFontSize(10)

    pm.checklist.forEach((item: any, index: number) => {
      if (y > 270) {
        doc.addPage()
        y = 20
      }

      let result = 'N/A'
      if (item.type === 'boolean') {
        result = item.resultBoolean === true ? 'Pass' : item.resultBoolean === false ? 'Fail' : 'N/A'
      } else if (item.type === 'text') {
        result = item.resultText || 'N/A'
      } else if (item.type === 'number') {
        result = item.resultNumber?.toString() || 'N/A'
      }

      doc.text(`${index + 1}. ${item.task}`, 20, y)
      doc.text(`   Result: ${result}`, 25, y + 5)
      if (item.notes) {
        doc.text(`   Notes: ${item.notes}`, 25, y + 10)
        y += 15
      } else {
        y += 10
      }
    })

    const pdfBuffer = Buffer.from(doc.output('arraybuffer'))
    return pdfBuffer
  }

  /**
   * Generate daily report
   */
  async generateDailyReport(date: Date = new Date()) {
    const startOfDay = new Date(date)
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date(date)
    endOfDay.setHours(23, 59, 59, 999)

    const [pms, calibrations, complaints] = await Promise.all([
      prisma.preventiveMaintenance.findMany({
        where: {
          createdAt: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
        include: { asset: true },
      }),
      prisma.calibration.findMany({
        where: {
          createdAt: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
        include: { asset: true },
      }),
      prisma.complaint.findMany({
        where: {
          createdAt: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
        include: { asset: true },
      }),
    ])

    return {
      date: date.toISOString().split('T')[0],
      pms: pms.length,
      calibrations: calibrations.length,
      complaints: complaints.length,
      details: {
        pms,
        calibrations,
        complaints,
      },
    }
  }

  /**
   * Generate monthly report
   */
  async generateMonthlyReport(year: number, month: number) {
    const startDate = new Date(year, month - 1, 1)
    const endDate = new Date(year, month, 0, 23, 59, 59)

    const [pms, calibrations, complaints] = await Promise.all([
      prisma.preventiveMaintenance.findMany({
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
        include: { asset: true },
      }),
      prisma.calibration.findMany({
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
        include: { asset: true },
      }),
      prisma.complaint.findMany({
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
        include: { asset: true },
      }),
    ])

    return {
      period: `${year}-${month.toString().padStart(2, '0')}`,
      pms: pms.length,
      calibrations: calibrations.length,
      complaints: complaints.length,
      details: {
        pms,
        calibrations,
        complaints,
      },
    }
  }
}

export const reportService = new ReportService()







