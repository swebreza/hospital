# Database Seeding Guide

This project includes seed scripts to populate the database with sample data for development and testing.

## MongoDB Seed Script

The MongoDB seed script populates the database with realistic hospital equipment data including:

- **Vendors**: 7 major medical equipment vendors (Siemens, GE Healthcare, Philips, etc.)
- **Assets**: 12+ medical equipment items (MRI, CT Scanner, Ventilators, etc.)
- **Contracts**: AMC/CMC contracts linking vendors to assets

### Running the Seed Script

1. **Ensure your environment variables are set:**
   ```bash
   # .env.local
   DATABASE_URL=your_mongodb_connection_string
   ```

2. **Run the seed script:**
   ```bash
   npm run db:seed:mongo
   ```

### What Gets Seeded

#### Vendors (7 items)
- Siemens Healthineers
- GE Healthcare
- Philips Healthcare
- Getinge
- Stryker Medical
- B. Braun Medical
- Dräger Medical

Each vendor includes:
- Contact information
- Performance ratings
- Escalation matrices

#### Assets (12+ items)
Medical equipment across various departments:
- **Radiology**: MRI Scanner, CT Scanner, X-Ray Machine, Ultrasound System
- **ICU**: Ventilators, Patient Monitors
- **Emergency**: Defibrillators
- **OT**: Anesthesia Machines
- **Pediatrics**: Infusion Pumps
- **Nephrology**: Dialysis Machine
- **Cardiology**: ECG Machine
- **Laboratory**: Blood Gas Analyzer

Each asset includes:
- Complete specifications
- Purchase and warranty dates
- PM schedules
- Calibration dates
- Criticality levels
- Lifecycle states

#### Contracts
- AMC (Annual Maintenance Contracts)
- CMC (Comprehensive Maintenance Contracts)
- Warranty contracts

Contracts are automatically linked to:
- Appropriate vendors
- Related assets

### Clearing Existing Data

The seed script **clears all existing data** before seeding. If you want to keep existing data, modify the `mongodb-seed.ts` file and comment out the delete operations.

### Customizing Seed Data

Edit `lib/seed/mongodb-seed.ts` to:
- Add more vendors
- Add more assets
- Modify contract details
- Change department assignments

### Notes

- The seed script uses Mongoose models
- All dates are set to realistic past/future dates
- Asset IDs follow the pattern: `AST-XXX`
- Serial numbers follow patterns like `SN-XXX-YYYYYYY`
- FAR numbers follow the pattern: `FAR-YYYY-XXX`

### Troubleshooting

**Error: "Please define the DATABASE_URL"**
- Make sure your `.env.local` file has the `DATABASE_URL` variable set

**Error: Connection timeout**
- Check your MongoDB connection string
- Ensure your IP is whitelisted (for MongoDB Atlas)

**Error: Duplicate key**
- The script clears existing data first, but if you're running it multiple times, ensure previous runs completed successfully

