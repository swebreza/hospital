import mongoose, { Schema, Document } from 'mongoose'

export interface IAsset extends Omit<Document, 'model'> {
  id: string
  name: string
  model?: string
  manufacturer?: string
  serialNumber: string
  department: string
  location?: string
  status:
    | 'Active'
    | 'Maintenance'
    | 'Breakdown'
    | 'Condemned'
    | 'Standby'
    | 'In-Service'
    | 'Spare'
    | 'Disposed'
    | 'Demo'
    | 'Under-Service'
  purchaseDate?: Date
  nextPmDate?: Date
  nextCalibrationDate?: Date
  value?: number
  imageUrl?: string
  qrCode?: string
  warrantyExpiry?: Date
  amcExpiry?: Date
  createdBy?: mongoose.Types.ObjectId
  createdAt: Date
  updatedAt: Date

  // New fields for enhanced asset management
  assetType?: string // Type classification (e.g., Diagnostic, Therapeutic, Life Support)
  modality?: string // Medical modality (e.g., MRI, CT, Ultrasound)
  criticality?: 'Critical' | 'High' | 'Medium' | 'Low'
  oem?: string // Original Equipment Manufacturer
  farNumber?: string // Fixed Asset Register number
  lifecycleState?:
    | 'Active'
    | 'In-Service'
    | 'Spare'
    | 'Disposed'
    | 'Condemned'
    | 'Demo'
    | 'Under-Service'
  isMinorAsset?: boolean
  ageYears?: number
  totalDowntimeHours?: number
  totalServiceCost?: number
  utilizationPercentage?: number
  replacementRecommended?: boolean
  replacementReason?: string
  specifications?: Record<string, unknown> // Flexible specifications storage
  installationDate?: Date
  commissioningDate?: Date
}

const AssetSchema = new Schema<IAsset>(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
    },
    model: String,
    manufacturer: String,
    serialNumber: {
      type: String,
      default: undefined, // Don't set default to empty string
      sparse: true,
      index: {
        unique: true,
        sparse: true,
        partialFilterExpression: { serialNumber: { $exists: true, $ne: null, $ne: '' } },
      },
    },
    department: {
      type: String,
      required: true,
      index: true,
    },
    location: String,
    status: {
      type: String,
      enum: [
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
      ],
      default: 'Active',
      index: true,
    },
    purchaseDate: Date,
    nextPmDate: {
      type: Date,
      index: true,
    },
    nextCalibrationDate: Date,
    value: Number,
    imageUrl: String,
    qrCode: String,
    warrantyExpiry: Date,
    amcExpiry: Date,
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },

    // New fields
    assetType: {
      type: String,
      index: true,
    },
    modality: {
      type: String,
      index: true,
    },
    criticality: {
      type: String,
      enum: ['Critical', 'High', 'Medium', 'Low'],
      index: true,
    },
    oem: {
      type: String,
      index: true,
    },
    farNumber: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },
    lifecycleState: {
      type: String,
      enum: [
        'Active',
        'In-Service',
        'Spare',
        'Disposed',
        'Condemned',
        'Demo',
        'Under-Service',
      ],
      default: 'Active',
      index: true,
    },
    isMinorAsset: {
      type: Boolean,
      default: false,
      index: true,
    },
    ageYears: Number,
    totalDowntimeHours: {
      type: Number,
      default: 0,
    },
    totalServiceCost: {
      type: Number,
      default: 0,
    },
    utilizationPercentage: Number,
    replacementRecommended: {
      type: Boolean,
      default: false,
      index: true,
    },
    replacementReason: String,
    specifications: {
      type: Schema.Types.Mixed,
      default: {},
    },
    installationDate: Date,
    commissioningDate: Date,
  },
  {
    timestamps: true,
  }
)

// Compound indexes for common queries
AssetSchema.index({ department: 1, status: 1 })
AssetSchema.index({ assetType: 1, modality: 1 })
AssetSchema.index({ criticality: 1, lifecycleState: 1 })
AssetSchema.index({ isMinorAsset: 1, department: 1 })
AssetSchema.index({ replacementRecommended: 1, criticality: 1 })

// Pre-save hook to calculate age
AssetSchema.pre('save', function (next: (error?: Error) => void) {
  if (this.purchaseDate) {
    const ageInMs = Date.now() - new Date(this.purchaseDate).getTime()
    this.ageYears =
      Math.round((ageInMs / (1000 * 60 * 60 * 24 * 365)) * 100) / 100
  }
  if (typeof next === 'function') {
    next()
  }
})

const Asset =
  mongoose.models.Asset || mongoose.model<IAsset>('Asset', AssetSchema)

export default Asset
