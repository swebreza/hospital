// Load environment variables FIRST, before any other imports
import { config } from 'dotenv'
import { resolve } from 'path'

// Load .env.local before importing anything that uses process.env
config({ path: resolve(process.cwd(), '.env.local') })

// Hardcoded database URL (for development)
// This will be used if DATABASE_URL is not set in .env.local
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL =
    'mongodb+srv://swebreza_db_user:FVcpTVpbigdWu4pS@cluster0.j23odu6.mongodb.net/hospital?retryWrites=true&w=majority'
  console.log('ℹ️  Using hardcoded DATABASE_URL (development mode)')
}

// Note: We'll use dynamic imports inside the async function
// to ensure env vars are loaded before importing mongodb.ts

// Sample data
const vendorsData = [
  {
    name: 'Siemens Healthineers',
    contactPerson: 'John Smith',
    email: 'john.smith@siemens.com',
    phone: '+1-555-0101',
    address: '123 Medical Equipment Blvd, Munich, Germany',
    rating: 4.8,
    performanceScore: 92,
    status: 'Active' as const,
    escalationMatrix: [
      {
        level: 1,
        name: 'Support Team',
        email: 'support@siemens.com',
        phone: '+1-555-0102',
      },
      {
        level: 2,
        name: 'Technical Manager',
        email: 'tech@siemens.com',
        phone: '+1-555-0103',
      },
    ],
  },
  {
    name: 'GE Healthcare',
    contactPerson: 'Sarah Johnson',
    email: 'sarah.johnson@ge.com',
    phone: '+1-555-0201',
    address: '456 Healthcare Avenue, Boston, MA',
    rating: 4.6,
    performanceScore: 88,
    status: 'Active' as const,
    escalationMatrix: [
      {
        level: 1,
        name: 'Customer Service',
        email: 'service@ge.com',
        phone: '+1-555-0202',
      },
    ],
  },
  {
    name: 'Philips Healthcare',
    contactPerson: 'Michael Chen',
    email: 'michael.chen@philips.com',
    phone: '+1-555-0301',
    address: '789 Medical Drive, Amsterdam, Netherlands',
    rating: 4.7,
    performanceScore: 90,
    status: 'Active' as const,
  },
  {
    name: 'Getinge',
    contactPerson: 'Emma Wilson',
    email: 'emma.wilson@getinge.com',
    phone: '+1-555-0401',
    address: '321 Life Support Street, Gothenburg, Sweden',
    rating: 4.5,
    performanceScore: 85,
    status: 'Active' as const,
  },
  {
    name: 'Stryker Medical',
    contactPerson: 'David Brown',
    email: 'david.brown@stryker.com',
    phone: '+1-555-0501',
    address: '654 Emergency Equipment Way, Kalamazoo, MI',
    rating: 4.4,
    performanceScore: 82,
    status: 'Active' as const,
  },
  {
    name: 'B. Braun Medical',
    contactPerson: 'Lisa Anderson',
    email: 'lisa.anderson@bbraun.com',
    phone: '+1-555-0601',
    address: '987 Infusion Road, Melsungen, Germany',
    rating: 4.3,
    performanceScore: 80,
    status: 'Active' as const,
  },
  {
    name: 'Dräger Medical',
    contactPerson: 'Robert Taylor',
    email: 'robert.taylor@draeger.com',
    phone: '+1-555-0701',
    address: '147 Anesthesia Lane, Lübeck, Germany',
    rating: 4.6,
    performanceScore: 87,
    status: 'Active' as const,
  },
]

const assetsData = [
  {
    id: 'AST-001',
    name: 'MRI Scanner',
    model: 'Magnetom Vida',
    manufacturer: 'Siemens Healthineers',
    serialNumber: 'SN-MRI-8839201',
    department: 'Radiology',
    location: 'Room 101',
    status: 'Active' as const,
    purchaseDate: new Date('2023-01-15'),
    nextPmDate: new Date('2024-07-15'),
    nextCalibrationDate: new Date('2024-06-15'),
    value: 12000000,
    warrantyExpiry: new Date('2026-01-15'),
    amcExpiry: new Date('2025-01-15'),
    assetType: 'Diagnostic',
    modality: 'MRI',
    criticality: 'Critical' as const,
    oem: 'Siemens Healthineers',
    farNumber: 'FAR-2023-001',
    lifecycleState: 'In-Service' as const,
    isMinorAsset: false,
    installationDate: new Date('2023-02-01'),
    commissioningDate: new Date('2023-02-15'),
    specifications: {
      fieldStrength: '3.0T',
      boreSize: '70cm',
      softwareVersion: 'VE11C',
    },
  },
  {
    id: 'AST-002',
    name: 'Ventilator',
    model: 'Servo-u',
    manufacturer: 'Getinge',
    serialNumber: 'SN-VEN-4421002',
    department: 'ICU',
    location: 'Bed 4',
    status: 'Maintenance' as const,
    purchaseDate: new Date('2022-05-20'),
    nextPmDate: new Date('2024-05-20'),
    value: 1500000,
    warrantyExpiry: new Date('2025-05-20'),
    amcExpiry: new Date('2024-11-20'),
    assetType: 'Life Support',
    modality: 'Ventilation',
    criticality: 'Critical' as const,
    oem: 'Getinge',
    farNumber: 'FAR-2022-045',
    lifecycleState: 'In-Service' as const,
    isMinorAsset: false,
    totalDowntimeHours: 12,
    totalServiceCost: 45000,
  },
  {
    id: 'AST-003',
    name: 'Defibrillator',
    model: 'Lifepak 20e',
    manufacturer: 'Stryker',
    serialNumber: 'SN-DEF-1102938',
    department: 'Emergency',
    location: 'Trauma Bay 1',
    status: 'Active' as const,
    purchaseDate: new Date('2021-11-10'),
    nextPmDate: new Date('2024-11-10'),
    nextCalibrationDate: new Date('2024-10-10'),
    value: 450000,
    warrantyExpiry: new Date('2024-11-10'),
    assetType: 'Therapeutic',
    modality: 'Defibrillation',
    criticality: 'Critical' as const,
    oem: 'Stryker',
    farNumber: 'FAR-2021-089',
    lifecycleState: 'In-Service' as const,
    isMinorAsset: false,
  },
  {
    id: 'AST-004',
    name: 'Infusion Pump',
    model: 'Infusomat Space',
    manufacturer: 'B. Braun',
    serialNumber: 'SN-INF-5592011',
    department: 'Pediatrics',
    location: 'Ward 3',
    status: 'Active' as const,
    purchaseDate: new Date('2023-03-01'),
    nextPmDate: new Date('2024-09-01'),
    value: 85000,
    warrantyExpiry: new Date('2026-03-01'),
    assetType: 'Therapeutic',
    modality: 'Infusion',
    criticality: 'High' as const,
    oem: 'B. Braun',
    farNumber: 'FAR-2023-012',
    lifecycleState: 'In-Service' as const,
    isMinorAsset: true,
  },
  {
    id: 'AST-005',
    name: 'X-Ray Machine',
    model: 'MobileDaRt Evolution',
    manufacturer: 'Shimadzu',
    serialNumber: 'SN-XRY-7738291',
    department: 'Radiology',
    location: 'Room 104',
    status: 'Breakdown' as const,
    purchaseDate: new Date('2020-08-15'),
    nextPmDate: new Date('2024-08-15'),
    value: 3500000,
    warrantyExpiry: new Date('2023-08-15'),
    amcExpiry: new Date('2024-02-15'),
    assetType: 'Diagnostic',
    modality: 'X-Ray',
    criticality: 'High' as const,
    oem: 'Shimadzu',
    farNumber: 'FAR-2020-156',
    lifecycleState: 'Under-Service' as const,
    isMinorAsset: false,
    totalDowntimeHours: 48,
    totalServiceCost: 125000,
  },
  {
    id: 'AST-006',
    name: 'Anesthesia Machine',
    model: 'Fabius GS premium',
    manufacturer: 'Dräger',
    serialNumber: 'SN-ANE-2291003',
    department: 'OT',
    location: 'OT 2',
    status: 'Active' as const,
    purchaseDate: new Date('2022-12-05'),
    nextPmDate: new Date('2024-06-05'),
    nextCalibrationDate: new Date('2024-05-05'),
    value: 2800000,
    warrantyExpiry: new Date('2025-12-05'),
    amcExpiry: new Date('2024-12-05'),
    assetType: 'Life Support',
    modality: 'Anesthesia',
    criticality: 'Critical' as const,
    oem: 'Dräger',
    farNumber: 'FAR-2022-078',
    lifecycleState: 'In-Service' as const,
    isMinorAsset: false,
  },
  {
    id: 'AST-007',
    name: 'Patient Monitor',
    model: 'IntelliVue MX450',
    manufacturer: 'Philips',
    serialNumber: 'SN-MON-9928102',
    department: 'ICU',
    location: 'Bed 2',
    status: 'Active' as const,
    purchaseDate: new Date('2023-06-20'),
    nextPmDate: new Date('2024-12-20'),
    value: 320000,
    warrantyExpiry: new Date('2026-06-20'),
    assetType: 'Diagnostic',
    modality: 'Monitoring',
    criticality: 'High' as const,
    oem: 'Philips',
    farNumber: 'FAR-2023-034',
    lifecycleState: 'In-Service' as const,
    isMinorAsset: false,
  },
  {
    id: 'AST-008',
    name: 'Ultrasound System',
    model: 'Voluson E10',
    manufacturer: 'GE Healthcare',
    serialNumber: 'SN-ULT-3382910',
    department: 'Obstetrics',
    location: 'Room 202',
    status: 'Active' as const,
    purchaseDate: new Date('2021-04-10'),
    nextPmDate: new Date('2024-10-10'),
    nextCalibrationDate: new Date('2024-09-10'),
    value: 4200000,
    warrantyExpiry: new Date('2024-04-10'),
    amcExpiry: new Date('2024-10-10'),
    assetType: 'Diagnostic',
    modality: 'Ultrasound',
    criticality: 'High' as const,
    oem: 'GE Healthcare',
    farNumber: 'FAR-2021-067',
    lifecycleState: 'In-Service' as const,
    isMinorAsset: false,
  },
  {
    id: 'AST-009',
    name: 'CT Scanner',
    model: 'Revolution CT',
    manufacturer: 'GE Healthcare',
    serialNumber: 'SN-CT-5566778',
    department: 'Radiology',
    location: 'Room 102',
    status: 'Active' as const,
    purchaseDate: new Date('2022-09-12'),
    nextPmDate: new Date('2024-09-12'),
    nextCalibrationDate: new Date('2024-08-12'),
    value: 8500000,
    warrantyExpiry: new Date('2025-09-12'),
    amcExpiry: new Date('2024-09-12'),
    assetType: 'Diagnostic',
    modality: 'CT',
    criticality: 'Critical' as const,
    oem: 'GE Healthcare',
    farNumber: 'FAR-2022-091',
    lifecycleState: 'In-Service' as const,
    isMinorAsset: false,
  },
  {
    id: 'AST-010',
    name: 'Dialysis Machine',
    model: 'AK 98',
    manufacturer: 'Fresenius Medical Care',
    serialNumber: 'SN-DIA-7788990',
    department: 'Nephrology',
    location: 'Dialysis Unit 3',
    status: 'Active' as const,
    purchaseDate: new Date('2023-02-18'),
    nextPmDate: new Date('2024-08-18'),
    value: 1800000,
    warrantyExpiry: new Date('2026-02-18'),
    amcExpiry: new Date('2024-08-18'),
    assetType: 'Therapeutic',
    modality: 'Dialysis',
    criticality: 'Critical' as const,
    oem: 'Fresenius',
    farNumber: 'FAR-2023-023',
    lifecycleState: 'In-Service' as const,
    isMinorAsset: false,
  },
  {
    id: 'AST-011',
    name: 'ECG Machine',
    model: 'CardioTouch',
    manufacturer: 'Bionet',
    serialNumber: 'SN-ECG-1122334',
    department: 'Cardiology',
    location: 'Cardiac Lab 1',
    status: 'Active' as const,
    purchaseDate: new Date('2023-05-25'),
    nextPmDate: new Date('2024-11-25'),
    value: 95000,
    warrantyExpiry: new Date('2026-05-25'),
    assetType: 'Diagnostic',
    modality: 'ECG',
    criticality: 'Medium' as const,
    oem: 'Bionet',
    farNumber: 'FAR-2023-056',
    lifecycleState: 'In-Service' as const,
    isMinorAsset: true,
  },
  {
    id: 'AST-012',
    name: 'Blood Gas Analyzer',
    model: 'ABL90 FLEX',
    manufacturer: 'Radiometer',
    serialNumber: 'SN-BGA-4455667',
    department: 'Laboratory',
    location: 'Lab Room 5',
    status: 'Active' as const,
    purchaseDate: new Date('2022-11-08'),
    nextPmDate: new Date('2024-11-08'),
    nextCalibrationDate: new Date('2024-10-08'),
    value: 650000,
    warrantyExpiry: new Date('2025-11-08'),
    assetType: 'Diagnostic',
    modality: 'Laboratory',
    criticality: 'High' as const,
    oem: 'Radiometer',
    farNumber: 'FAR-2022-112',
    lifecycleState: 'In-Service' as const,
    isMinorAsset: false,
  },
]

async function seedDatabase() {
  // Dynamically import modules after env vars are loaded
  const mongooseModule = await import('mongoose')
  const mongoose = mongooseModule.default
  const { default: connectDB } = await import('../db/mongodb')
  const { default: Asset } = await import('../models/Asset')
  const { default: Vendor } = await import('../models/Vendor')
  const { default: Contract } = await import('../models/Contract')

  try {
    console.log('🌱 Starting database seed...')

    // Connect to database
    await connectDB()
    console.log('✅ Connected to MongoDB')

    // Clear existing data (optional - comment out if you want to keep existing data)
    console.log('🗑️  Clearing existing data...')
    await Asset.deleteMany({})
    await Vendor.deleteMany({})
    await Contract.deleteMany({})
    console.log('✅ Cleared existing data')

    // Seed Vendors
    console.log('📦 Seeding vendors...')
    const vendors = await Vendor.insertMany(vendorsData)
    console.log(`✅ Created ${vendors.length} vendors`)

    // Create vendor map for contracts
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const vendorMap = new Map<string, any>()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vendors.forEach((vendor: any) => {
      const name = vendor.name
      if (name.includes('Siemens')) vendorMap.set('Siemens', vendor._id)
      if (name.includes('GE')) vendorMap.set('GE', vendor._id)
      if (name.includes('Philips')) vendorMap.set('Philips', vendor._id)
      if (name.includes('Getinge')) vendorMap.set('Getinge', vendor._id)
      if (name.includes('Stryker')) vendorMap.set('Stryker', vendor._id)
      if (name.includes('B. Braun')) vendorMap.set('B. Braun', vendor._id)
      if (name.includes('Dräger')) vendorMap.set('Dräger', vendor._id)
    })

    // Seed Assets
    console.log('🏥 Seeding assets...')
    const assets = await Asset.insertMany(assetsData)
    console.log(`✅ Created ${assets.length} assets`)

    // Create asset map for contracts
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const assetMap = new Map<string, any[]>()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    assets.forEach((asset: any) => {
      if (asset.manufacturer) {
        const key = asset.manufacturer.split(' ')[0]
        if (!assetMap.has(key)) {
          assetMap.set(key, [])
        }
        assetMap.get(key)?.push(asset._id)
      }
    })

    // Seed Contracts
    console.log('📄 Seeding contracts...')
    const contractsData = [
      {
        vendorId: vendorMap.get('Siemens'),
        type: 'AMC' as const,
        assetIds: assets
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .filter((a: any) => a.manufacturer?.includes('Siemens'))
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .map((a: any) => a._id),
        startDate: new Date('2023-02-01'),
        endDate: new Date('2025-01-31'),
        value: 1200000,
        status: 'Active' as const,
        notes: 'Annual Maintenance Contract for MRI Scanner',
      },
      {
        vendorId: vendorMap.get('Getinge'),
        type: 'AMC' as const,
        assetIds: assets
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .filter((a: any) => a.manufacturer?.includes('Getinge'))
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .map((a: any) => a._id),
        startDate: new Date('2022-06-01'),
        endDate: new Date('2024-11-30'),
        value: 180000,
        status: 'Active' as const,
        notes: 'AMC for Ventilator Servo-u',
      },
      {
        vendorId: vendorMap.get('GE'),
        type: 'AMC' as const,
        assetIds: assets
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .filter((a: any) => a.manufacturer?.includes('GE'))
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .map((a: any) => a._id),
        startDate: new Date('2022-10-01'),
        endDate: new Date('2024-09-30'),
        value: 850000,
        status: 'Active' as const,
        notes: 'AMC for CT Scanner and Ultrasound System',
      },
      {
        vendorId: vendorMap.get('Philips'),
        type: 'AMC' as const,
        assetIds: assets
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .filter((a: any) => a.manufacturer?.includes('Philips'))
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .map((a: any) => a._id),
        startDate: new Date('2023-07-01'),
        endDate: new Date('2025-06-30'),
        value: 45000,
        status: 'Active' as const,
        notes: 'AMC for Patient Monitors',
      },
      {
        vendorId: vendorMap.get('Stryker'),
        type: 'Warranty' as const,
        assetIds: assets
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .filter((a: any) => a.manufacturer?.includes('Stryker'))
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .map((a: any) => a._id),
        startDate: new Date('2021-11-10'),
        endDate: new Date('2024-11-10'),
        value: 0,
        status: 'Active' as const,
        notes: 'Manufacturer Warranty for Defibrillator',
      },
      {
        vendorId: vendorMap.get('Dräger'),
        type: 'AMC' as const,
        assetIds: assets
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .filter((a: any) => a.manufacturer?.includes('Dräger'))
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .map((a: any) => a._id),
        startDate: new Date('2023-01-01'),
        endDate: new Date('2024-12-31'),
        value: 320000,
        status: 'Active' as const,
        notes: 'AMC for Anesthesia Machine',
      },
      {
        vendorId: vendorMap.get('B. Braun'),
        type: 'CMC' as const,
        assetIds: assets
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .filter((a: any) => a.manufacturer?.includes('B. Braun'))
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .map((a: any) => a._id),
        startDate: new Date('2023-04-01'),
        endDate: new Date('2024-09-30'),
        value: 15000,
        status: 'Active' as const,
        notes: 'Comprehensive Maintenance Contract for Infusion Pumps',
      },
    ].filter((contract) => contract.vendorId && contract.assetIds.length > 0)

    const contracts = await Contract.insertMany(contractsData)
    console.log(`✅ Created ${contracts.length} contracts`)

    console.log('\n🎉 Database seeding completed successfully!')
    console.log(`\n📊 Summary:`)
    console.log(`   - Vendors: ${vendors.length}`)
    console.log(`   - Assets: ${assets.length}`)
    console.log(`   - Contracts: ${contracts.length}`)
  } catch (error) {
    console.error('❌ Error seeding database:', error)
    throw error
  } finally {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close()
      console.log('🔌 Database connection closed')
    }
  }
}

// Run seed if executed directly
if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log('✅ Seed script completed')
      process.exit(0)
    })
    .catch((error) => {
      console.error('❌ Seed script failed:', error)
      process.exit(1)
    })
}

export default seedDatabase
