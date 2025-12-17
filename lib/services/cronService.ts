// Cron Service for scheduled tasks

import cron from 'node-cron'
import { pmNotificationService } from './pmNotificationService'
import { escalationService } from './escalationService'
import { pmScheduler } from './pmScheduler'
import { calibrationScheduler } from './calibrationScheduler'

class CronService {
  private tasks: cron.ScheduledTask[] = []

  /**
   * Start all scheduled tasks
   */
  start() {
    // Check for overdue PMs and mark them (runs daily at midnight)
    this.tasks.push(
      cron.schedule('0 0 * * *', async () => {
        console.log('Running daily PM overdue check...')
        await pmScheduler.markOverduePMs()
      })
    )

    // Send PM reminders (runs daily at 8 AM)
    this.tasks.push(
      cron.schedule('0 8 * * *', async () => {
        console.log('Sending PM reminders...')
        await pmNotificationService.sendPMReminders()
      })
    )

    // Send overdue PM notifications (runs daily at 9 AM)
    this.tasks.push(
      cron.schedule('0 9 * * *', async () => {
        console.log('Sending overdue PM notifications...')
        await pmNotificationService.sendOverduePMNotifications()
      })
    )

    // Check and trigger escalations (runs every 6 hours)
    this.tasks.push(
      cron.schedule('0 */6 * * *', async () => {
        console.log('Checking for escalations...')
        await escalationService.checkAndEscalatePMs()
      })
    )

    // Auto-schedule PMs (runs weekly on Monday at 6 AM)
    this.tasks.push(
      cron.schedule('0 6 * * 1', async () => {
        console.log('Auto-scheduling PMs...')
        await pmScheduler.autoSchedulePMs()
      })
    )

    // Check calibration reminders (runs daily at 8 AM)
    this.tasks.push(
      cron.schedule('0 8 * * *', async () => {
        console.log('Checking calibration reminders...')
        // This will be implemented in calibrationScheduler
      })
    )

    console.log(`Started ${this.tasks.length} scheduled tasks`)
  }

  /**
   * Stop all scheduled tasks
   */
  stop() {
    this.tasks.forEach((task) => task.stop())
    this.tasks = []
    console.log('Stopped all scheduled tasks')
  }
}

export const cronService = new CronService()

// Start cron jobs if not in test environment
if (process.env.NODE_ENV !== 'test') {
  cronService.start()
}







