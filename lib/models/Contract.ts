import mongoose, { Schema, Document } from 'mongoose'

export type ContractType = 'AMC' | 'CMC' | 'Warranty' | 'Service'
export type ContractStatus = 'Active' | 'Expired' | 'Renewed' | 'Cancelled'

export interface IContract extends Document {
  vendorId: mongoose.Types.ObjectId
  type: ContractType
  assetIds: mongoose.Types.ObjectId[] // Array of asset references
  startDate: Date
  endDate: Date
  value: number
  renewalDate?: Date
  status: ContractStatus
  documents?: string[] // Array of document URLs
  notes?: string
  createdBy?: mongoose.Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

const ContractSchema = new Schema<IContract>(
  {
    vendorId: {
      type: Schema.Types.ObjectId,
      ref: 'Vendor',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['AMC', 'CMC', 'Warranty', 'Service'],
      required: true,
      index: true,
    },
    assetIds: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Asset',
      },
    ],
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
      index: true,
    },
    value: {
      type: Number,
      required: true,
      min: 0,
    },
    renewalDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['Active', 'Expired', 'Renewed', 'Cancelled'],
      default: 'Active',
      index: true,
    },
    documents: {
      type: [String],
      default: [],
    },
    notes: {
      type: String,
      trim: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
)

// Indexes for common queries
ContractSchema.index({ vendorId: 1, status: 1 })
ContractSchema.index({ endDate: 1, status: 1 })
ContractSchema.index({ type: 1, status: 1 })
ContractSchema.index({ status: 1, endDate: 1 })

// Virtual field: days until expiry
ContractSchema.virtual('daysUntilExpiry').get(function () {
  if (this.status !== 'Active') return null
  const now = new Date()
  const diffTime = this.endDate.getTime() - now.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays
})

// Virtual field: is expiring soon (30, 60, 90 days)
ContractSchema.virtual('isExpiringSoon').get(function () {
  if (this.status !== 'Active') return { isExpiring: false, days: null, level: null }
  const days = this.daysUntilExpiry
  if (days === null) return { isExpiring: false, days: null, level: null }
  
  if (days < 0) {
    return { isExpiring: true, days, level: 'expired' }
  } else if (days <= 30) {
    return { isExpiring: true, days, level: 'critical' }
  } else if (days <= 60) {
    return { isExpiring: true, days, level: 'warning' }
  } else if (days <= 90) {
    return { isExpiring: true, days, level: 'info' }
  }
  return { isExpiring: false, days, level: null }
})

// Method: Calculate renewal date (typically 30 days before expiry)
ContractSchema.methods.calculateRenewalDate = function () {
  const renewalDate = new Date(this.endDate)
  renewalDate.setDate(renewalDate.getDate() - 30)
  return renewalDate
}

// Method: Check expiry status
ContractSchema.methods.checkExpiryStatus = function () {
  const now = new Date()
  if (this.endDate < now && this.status === 'Active') {
    this.status = 'Expired'
    return 'Expired'
  }
  return this.status
}

// Pre-save hook: Validate dates and auto-update status
ContractSchema.pre('save', function (next) {
  // Validate end date is after start date
  if (this.endDate <= this.startDate) {
    return next(new Error('End date must be after start date'))
  }
  
  // Auto-update status based on dates
  if (this.status === 'Active') {
    const now = new Date()
    if (this.endDate < now) {
      this.status = 'Expired'
    }
  }
  
  // Set renewal date if not provided (30 days before expiry)
  if (!this.renewalDate && this.endDate) {
    this.renewalDate = this.calculateRenewalDate()
  }
  
  next()
})

// Ensure virtuals are included in JSON output
ContractSchema.set('toJSON', { virtuals: true })
ContractSchema.set('toObject', { virtuals: true })

const Contract = mongoose.models.Contract || mongoose.model<IContract>('Contract', ContractSchema)

export default Contract

