// Email service for sending notifications

import nodemailer from 'nodemailer'

interface EmailOptions {
  to: string | string[]
  subject: string
  html: string
  text?: string
  cc?: string | string[]
  bcc?: string | string[]
}

class EmailService {
  private transporter: nodemailer.Transporter | null = null

  constructor() {
    this.initializeTransporter()
  }

  private initializeTransporter() {
    const emailConfig = {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    }

    if (emailConfig.auth.user && emailConfig.auth.pass) {
      this.transporter = nodemailer.createTransport(emailConfig)
    } else {
      console.warn('Email service not configured. SMTP credentials missing.')
    }
  }

  async sendEmail(options: EmailOptions): Promise<boolean> {
    if (!this.transporter) {
      console.warn('Email service not available. Email not sent:', options.subject)
      return false
    }

    try {
      const recipients = Array.isArray(options.to) ? options.to : [options.to]
      
      for (const recipient of recipients) {
        await this.transporter.sendMail({
          from: process.env.SMTP_FROM || process.env.SMTP_USER,
          to: recipient,
          subject: options.subject,
          html: options.html,
          text: options.text || options.html.replace(/<[^>]*>/g, ''),
          cc: options.cc,
          bcc: options.bcc,
        })
      }

      return true
    } catch (error) {
      console.error('Error sending email:', error)
      return false
    }
  }

  // Template methods for different notification types
  async sendPMReminder(
    to: string | string[],
    pmData: {
      assetName: string
      scheduledDate: string
      daysUntil: number
    }
  ): Promise<boolean> {
    const subject = `PM Reminder: ${pmData.assetName} - Due in ${pmData.daysUntil} day(s)`
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Preventive Maintenance Reminder</h2>
        <p>This is a reminder that a preventive maintenance is scheduled:</p>
        <ul>
          <li><strong>Asset:</strong> ${pmData.assetName}</li>
          <li><strong>Scheduled Date:</strong> ${new Date(pmData.scheduledDate).toLocaleDateString()}</li>
          <li><strong>Days Until Due:</strong> ${pmData.daysUntil}</li>
        </ul>
        <p>Please ensure the maintenance is completed on time.</p>
      </div>
    `

    return this.sendEmail({ to, subject, html })
  }

  async sendPMOverdue(
    to: string | string[],
    pmData: {
      assetName: string
      scheduledDate: string
      daysOverdue: number
    }
  ): Promise<boolean> {
    const subject = `URGENT: PM Overdue - ${pmData.assetName}`
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc2626;">Preventive Maintenance Overdue</h2>
        <p style="color: #dc2626; font-weight: bold;">This PM is overdue and requires immediate attention:</p>
        <ul>
          <li><strong>Asset:</strong> ${pmData.assetName}</li>
          <li><strong>Scheduled Date:</strong> ${new Date(pmData.scheduledDate).toLocaleDateString()}</li>
          <li><strong>Days Overdue:</strong> ${pmData.daysOverdue}</li>
        </ul>
        <p>Please complete this maintenance as soon as possible.</p>
      </div>
    `

    return this.sendEmail({ to, subject, html })
  }

  async sendCalibrationReminder(
    to: string | string[],
    calData: {
      assetName: string
      nextDueDate: string
      daysUntil: number
    }
  ): Promise<boolean> {
    const subject = `Calibration Reminder: ${calData.assetName} - Due in ${calData.daysUntil} day(s)`
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Calibration Reminder</h2>
        <p>This is a reminder that a calibration is due:</p>
        <ul>
          <li><strong>Asset:</strong> ${calData.assetName}</li>
          <li><strong>Next Due Date:</strong> ${new Date(calData.nextDueDate).toLocaleDateString()}</li>
          <li><strong>Days Until Due:</strong> ${calData.daysUntil}</li>
        </ul>
        <p>Please schedule the calibration before the due date.</p>
      </div>
    `

    return this.sendEmail({ to, subject, html })
  }

  async sendComplaintAssigned(
    to: string | string[],
    complaintData: {
      complaintId: string
      assetName: string
      priority: string
      title: string
    }
  ): Promise<boolean> {
    const subject = `New Complaint Assigned: ${complaintData.complaintId}`
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Complaint Assigned</h2>
        <p>A new complaint has been assigned to you:</p>
        <ul>
          <li><strong>Complaint ID:</strong> ${complaintData.complaintId}</li>
          <li><strong>Asset:</strong> ${complaintData.assetName}</li>
          <li><strong>Priority:</strong> ${complaintData.priority}</li>
          <li><strong>Title:</strong> ${complaintData.title}</li>
        </ul>
        <p>Please review and take appropriate action.</p>
      </div>
    `

    return this.sendEmail({ to, subject, html })
  }

  async sendEscalation(
    to: string | string[],
    escalationData: {
      entityType: string
      entityId: string
      level: number
      message: string
    }
  ): Promise<boolean> {
    const subject = `Escalation Level ${escalationData.level}: ${escalationData.entityType}`
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc2626;">Escalation Notice</h2>
        <p style="color: #dc2626; font-weight: bold;">An issue has been escalated to your level:</p>
        <ul>
          <li><strong>Type:</strong> ${escalationData.entityType}</li>
          <li><strong>ID:</strong> ${escalationData.entityId}</li>
          <li><strong>Escalation Level:</strong> ${escalationData.level}</li>
        </ul>
        <p>${escalationData.message}</p>
        <p>Please review and take appropriate action.</p>
      </div>
    `

    return this.sendEmail({ to, subject, html })
  }
}

export const emailService = new EmailService()




