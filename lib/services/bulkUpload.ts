import Asset from '@/lib/models/Asset'
import type { Asset as IAsset } from '@/lib/types'
import Papa from 'papaparse'

export interface BulkUploadResult {
  success: boolean
  total: number
  successful: number
  failed: number
  errors: Array<{
    row: number
    data: Record<string, unknown>
    errors: string[]
  }>
  duplicates: number
}

export interface BulkUploadOptions {
  skipDuplicates?: boolean
  validateOnly?: boolean
  batchSize?: number
}

/**
 * Parse CSV file and return array of objects
 * Uses PapaParse for proper CSV parsing to handle quoted fields with commas
 */
export function parseCSV(csvText: string): Array<Record<string, string>> {
  // Parse CSV with proper handling of quoted fields
  const parsed = Papa.parse<Record<string, string>>(csvText, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header: string) => {
      // Normalize header names to match export format
      const normalized = header.trim()
      const mappings: Record<string, string> = {
        'Asset ID': 'id',
        'asset id': 'id',
        'asset_id': 'id',
        'Name': 'name',
        'name': 'name',
        'Model': 'model',
        'model': 'model',
        'Manufacturer': 'manufacturer',
        'manufacturer': 'manufacturer',
        'Serial Number': 'serialNumber',
        'serial number': 'serialNumber',
        'serial_number': 'serialNumber',
        'Department': 'department',
        'department': 'department',
        'Location': 'location',
        'location': 'location',
        'Status': 'status',
        'status': 'status',
        'Type': 'assetType',
        'type': 'assetType',
        'asset_type': 'assetType',
        'assetType': 'assetType',
        'Criticality': 'criticality',
        'criticality': 'criticality',
        'Lifecycle State': 'lifecycleState',
        'lifecycle state': 'lifecycleState',
        'lifecycle_state': 'lifecycleState',
        'lifecycleState': 'lifecycleState',
        'FAR Number': 'farNumber',
        'far number': 'farNumber',
        'far_number': 'farNumber',
        'farNumber': 'farNumber',
        'Purchase Date': 'purchaseDate',
        'purchase date': 'purchaseDate',
        'purchase_date': 'purchaseDate',
        'purchaseDate': 'purchaseDate',
        'Next PM Date': 'nextPmDate',
        'next pm date': 'nextPmDate',
        'next_pm_date': 'nextPmDate',
        'nextPmDate': 'nextPmDate',
        'Value': 'value',
        'value': 'value',
        'Age (Years)': 'ageYears',
        'age (years)': 'ageYears',
        'age_years': 'ageYears',
        'ageYears': 'ageYears',
      }
      return mappings[normalized] || normalized.toLowerCase().replace(/\s+/g, '')
    },
  })

  if (parsed.errors && parsed.errors.length > 0) {
    console.error('CSV parsing errors:', parsed.errors)
    // Don't throw, but log errors for debugging
  }

  return parsed.data || []
}

/**
 * Validate asset data
 */
export function validateAssetData(data: Record<string, unknown>): {
  valid: boolean
  errors: string[]
  normalized: Partial<IAsset>
} {
  const errors: string[] = []
  const normalized: Partial<IAsset> = {}

  // Required fields
  if (!data.name || typeof data.name !== 'string' || data.name.trim() === '') {
    errors.push('Name is required')
  } else {
    normalized.name = data.name.trim()
  }

  if (!data.department || typeof data.department !== 'string' || data.department.trim() === '') {
    errors.push('Department is required')
  } else {
    normalized.department = data.department.trim()
  }

  // Optional but validated fields
  if (data.id && typeof data.id === 'string') {
    normalized.id = data.id.trim()
  } else {
    // Generate ID if not provided
    normalized.id = `AST-${Date.now()}-${Math.floor(Math.random() * 10000)}`
  }

  if (data.model && typeof data.model === 'string') {
    normalized.model = data.model.trim()
  }

  if (data.manufacturer && typeof data.manufacturer === 'string') {
    normalized.manufacturer = data.manufacturer.trim()
  }

  // Clean serialNumber: only include if it has a valid value
  if (data.serialNumber && typeof data.serialNumber === 'string') {
    const cleaned = data.serialNumber.trim()
    const lowerCleaned = cleaned.toLowerCase()
    
    // Only include if it's not empty and not a placeholder value
    if (cleaned !== '' && 
        lowerCleaned !== 'null' && 
        lowerCleaned !== 'undefined' &&
        lowerCleaned !== 'none' &&
        lowerCleaned !== 'n/a' &&
        lowerCleaned !== 'na') {
      normalized.serialNumber = cleaned
    }
    // If invalid, don't include it (will be undefined, which is fine)
  }

  if (data.location && typeof data.location === 'string') {
    normalized.location = data.location.trim()
  }

  // Status validation
  const validStatuses = [
    'Active',
    'Maintenance',
    'Breakdown',
    'Condemned',
    'Standby',
    'In-Service',
    'Spare',
    'Disposed',
    'Demo',
    'Under-Service',
  ]
  if (data.status && typeof data.status === 'string') {
    if (validStatuses.includes(data.status)) {
      normalized.status = data.status as IAsset['status']
    } else {
      errors.push(`Invalid status: ${data.status}. Must be one of: ${validStatuses.join(', ')}`)
    }
  } else {
    normalized.status = 'Active'
  }

  // Value validation
  if (data.value !== undefined && data.value !== null && data.value !== '') {
    const value = typeof data.value === 'string' ? parseFloat(data.value) : Number(data.value)
    if (!isNaN(value) && value >= 0) {
      normalized.value = value
    } else {
      errors.push('Value must be a valid positive number')
    }
  }

  // Date validations - convert to Date objects for Mongoose
  if (data.purchaseDate && typeof data.purchaseDate === 'string' && data.purchaseDate.trim() !== '') {
    const date = new Date(data.purchaseDate.trim())
    if (!isNaN(date.getTime())) {
      normalized.purchaseDate = date.toISOString()
    } else {
      errors.push(`Invalid purchase date: ${data.purchaseDate}`)
    }
  }

  if (data.nextPmDate && typeof data.nextPmDate === 'string' && data.nextPmDate.trim() !== '') {
    const date = new Date(data.nextPmDate.trim())
    if (!isNaN(date.getTime())) {
      normalized.nextPmDate = date.toISOString()
    } else {
      errors.push(`Invalid next PM date: ${data.nextPmDate}`)
    }
  }

  // Enhanced fields
  if (data.assetType && typeof data.assetType === 'string') {
    normalized.assetType = data.assetType.trim()
  }

  if (data.modality && typeof data.modality === 'string') {
    normalized.modality = data.modality.trim()
  }

  if (data.criticality && typeof data.criticality === 'string') {
    const validCriticalities = ['Critical', 'High', 'Medium', 'Low']
    if (validCriticalities.includes(data.criticality)) {
      normalized.criticality = data.criticality as IAsset['criticality']
    }
  }

  if (data.oem && typeof data.oem === 'string') {
    normalized.oem = data.oem.trim()
  }

  if (data.farNumber && typeof data.farNumber === 'string') {
    normalized.farNumber = data.farNumber.trim()
  }

  if (data.lifecycleState && typeof data.lifecycleState === 'string') {
    const validStates = ['Active', 'In-Service', 'Spare', 'Disposed', 'Condemned', 'Demo', 'Under-Service']
    if (validStates.includes(data.lifecycleState)) {
      normalized.lifecycleState = data.lifecycleState as IAsset['lifecycleState']
    }
  }

  if (data.isMinorAsset !== undefined) {
    normalized.isMinorAsset = Boolean(data.isMinorAsset)
  }

  return {
    valid: errors.length === 0,
    errors,
    normalized,
  }
}

/**
 * Check for duplicate assets
 */
export async function checkDuplicates(
  assets: Array<{ id?: string; serialNumber?: string; farNumber?: string }>
): Promise<Array<{ index: number; reason: string }>> {
  const duplicates: Array<{ index: number; reason: string }> = []

  // Check for duplicate IDs
  const ids = new Set<string>()
  assets.forEach((asset, index) => {
    if (asset.id) {
      if (ids.has(asset.id)) {
        duplicates.push({ index, reason: `Duplicate ID: ${asset.id}` })
      } else {
        ids.add(asset.id)
      }
    }
  })

  // Check for duplicate serial numbers
  const serialNumbers = new Set<string>()
  assets.forEach((asset, index) => {
    if (asset.serialNumber) {
      if (serialNumbers.has(asset.serialNumber)) {
        duplicates.push({ index, reason: `Duplicate serial number: ${asset.serialNumber}` })
      } else {
        serialNumbers.add(asset.serialNumber)
      }
    }
  })

  // Check for duplicate FAR numbers
  const farNumbers = new Set<string>()
  assets.forEach((asset, index) => {
    if (asset.farNumber) {
      if (farNumbers.has(asset.farNumber)) {
        duplicates.push({ index, reason: `Duplicate FAR number: ${asset.farNumber}` })
      } else {
        farNumbers.add(asset.farNumber)
      }
    }
  })

  // Check against existing assets in database
  const existingIds = await Asset.find({ id: { $in: Array.from(ids) } }).select('id').lean()
  const existingSerialNumbers = await Asset.find({
    serialNumber: { $in: Array.from(serialNumbers) },
  })
    .select('serialNumber')
    .lean()
  const existingFarNumbers = await Asset.find({ farNumber: { $in: Array.from(farNumbers) } })
    .select('farNumber')
    .lean()

  const existingIdSet = new Set(existingIds.map((a) => a.id))
  const existingSerialSet = new Set(existingSerialNumbers.map((a) => a.serialNumber).filter(Boolean))
  const existingFarSet = new Set(existingFarNumbers.map((a) => a.farNumber).filter(Boolean))

  assets.forEach((asset, index) => {
    if (asset.id && existingIdSet.has(asset.id)) {
      duplicates.push({ index, reason: `Asset ID already exists: ${asset.id}` })
    }
    if (asset.serialNumber && existingSerialSet.has(asset.serialNumber)) {
      duplicates.push({ index, reason: `Serial number already exists: ${asset.serialNumber}` })
    }
    if (asset.farNumber && existingFarSet.has(asset.farNumber)) {
      duplicates.push({ index, reason: `FAR number already exists: ${asset.farNumber}` })
    }
  })

  return duplicates
}

/**
 * Bulk upload assets from CSV/Excel data
 */
export async function bulkUploadAssets(
  data: Array<Record<string, unknown>>,
  options: BulkUploadOptions = {}
): Promise<BulkUploadResult> {
  const { skipDuplicates = true, validateOnly = false, batchSize = 100 } = options

  const result: BulkUploadResult = {
    success: true,
    total: data.length,
    successful: 0,
    failed: 0,
    errors: [],
    duplicates: 0,
  }

  // Validate all data first
  const validatedAssets: Array<{ data: Partial<IAsset>; index: number }> = []
  const duplicateIndices = new Set<number>()

  for (let i = 0; i < data.length; i++) {
    const validation = validateAssetData(data[i])
    if (validation.valid) {
      validatedAssets.push({ data: validation.normalized, index: i })
    } else {
      result.failed++
      result.errors.push({
        row: i + 1,
        data: data[i],
        errors: validation.errors,
      })
    }
  }

  // Check for duplicates
  const duplicates = await checkDuplicates(validatedAssets.map((v) => v.data))
  duplicates.forEach((dup) => {
    duplicateIndices.add(dup.index)
    if (skipDuplicates) {
      result.duplicates++
      result.errors.push({
        row: validatedAssets[dup.index].index + 1,
        data: data[validatedAssets[dup.index].index],
        errors: [dup.reason],
      })
    }
  })

  if (validateOnly) {
    result.successful = validatedAssets.length - duplicateIndices.size
    result.failed = result.total - result.successful
    return result
  }

  // Process in batches
  const assetsToInsert = validatedAssets.filter((_, index) => !duplicateIndices.has(index))

  for (let i = 0; i < assetsToInsert.length; i += batchSize) {
    const batch = assetsToInsert.slice(i, i + batchSize)
    
    // Convert normalized data to Mongoose document format
    const assetsToSave = batch.map((item) => {
      const assetData: Record<string, unknown> = { ...item.data }
      
      // Convert date strings to Date objects for Mongoose
      if (assetData.purchaseDate && typeof assetData.purchaseDate === 'string') {
        assetData.purchaseDate = new Date(assetData.purchaseDate)
      }
      if (assetData.nextPmDate && typeof assetData.nextPmDate === 'string') {
        assetData.nextPmDate = new Date(assetData.nextPmDate)
      }
      if (assetData.nextCalibrationDate && typeof assetData.nextCalibrationDate === 'string') {
        assetData.nextCalibrationDate = new Date(assetData.nextCalibrationDate)
      }
      if (assetData.warrantyExpiry && typeof assetData.warrantyExpiry === 'string') {
        assetData.warrantyExpiry = new Date(assetData.warrantyExpiry)
      }
      if (assetData.amcExpiry && typeof assetData.amcExpiry === 'string') {
        assetData.amcExpiry = new Date(assetData.amcExpiry)
      }
      
      // Ensure required fields
      if (!assetData.id) {
        assetData.id = `AST-${Date.now()}-${Math.floor(Math.random() * 10000)}`
      }
      if (!assetData.status) {
        assetData.status = 'Active'
      }
      
      // FINAL CLEANUP: Remove serialNumber if it's invalid
      if (assetData.serialNumber !== undefined) {
        const serialStr = String(assetData.serialNumber).trim()
        const lowerSerial = serialStr.toLowerCase()
        
        if (serialStr === '' || 
            lowerSerial === 'null' || 
            lowerSerial === 'undefined' ||
            lowerSerial === 'none' ||
            lowerSerial === 'n/a' ||
            lowerSerial === 'na') {
          delete assetData.serialNumber
        } else {
          assetData.serialNumber = serialStr
        }
      }
      
      return assetData
    })

    try {
      await Asset.insertMany(assetsToSave, { ordered: false })
      result.successful += batch.length
    } catch (error: unknown) {
      const err = error as { writeErrors?: Array<{ index: number; errmsg: string }>; message?: string }
      if (err.writeErrors) {
        err.writeErrors.forEach((writeError) => {
          const originalIndex = batch[writeError.index].index
          result.failed++
          result.errors.push({
            row: originalIndex + 1,
            data: data[originalIndex],
            errors: [writeError.errmsg],
          })
        })
        result.successful += batch.length - err.writeErrors.length
      } else {
        // If it's a different error, mark all in batch as failed
        batch.forEach((item) => {
          result.failed++
          result.errors.push({
            row: item.index + 1,
            data: data[item.index],
            errors: [err.message || 'Unknown error'],
          })
        })
      }
    }
  }

  result.success = result.failed === 0 && result.duplicates === 0
  return result
}

