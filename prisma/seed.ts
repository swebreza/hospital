// Seed script for initial data

import { PrismaClient } from '@prisma/client'
import { pmTemplateService } from '../lib/services/pmTemplateService'
import { escalationService } from '../lib/services/escalationService'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Seed PM templates
  console.log('Seeding PM templates...')
  await pmTemplateService.seedDefaultTemplates()

  // Seed escalation rules
  console.log('Seeding escalation rules...')
  await escalationService.seedDefaultEscalationRules()

  console.log('Seeding completed!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })





