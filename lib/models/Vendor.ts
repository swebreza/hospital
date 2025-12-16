import mongoose, { Schema, Document } from 'mongoose'

export interface IEscalationContact {
  level: number
  name: string
  email: string
  phone: string
}

export interface IVendor extends Document {
  name: string
  contactPerson?: string
  email?: string
  phone?: string
  address?: string
  rating?: number // 0-5 scale
  performanceScore?: number // 0-100 scale
  escalationMatrix?: IEscalationContact[]
  status: 'Active' | 'Inactive' | 'Suspended'
  createdBy?: mongoose.Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

const EscalationContactSchema = new Schema<IEscalationContact>(
  {
    level: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
    },
    phone: {
      type: String,
      required: true,
    },
  },
  { _id: false }
)

const VendorSchema = new Schema<IVendor>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    contactPerson: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
      sparse: true,
      index: true,
      validate: {
        validator: function (v: string | undefined) {
          if (!v) return true
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
        },
        message: 'Please enter a valid email address',
      },
    },
    phone: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
    performanceScore: {
      type: Number,
      min: 0,
      max: 100,
      index: true,
    },
    escalationMatrix: {
      type: [EscalationContactSchema],
      default: [],
    },
    status: {
      type: String,
      enum: ['Active', 'Inactive', 'Suspended'],
      default: 'Active',
      index: true,
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
VendorSchema.index({ name: 'text' })
VendorSchema.index({ status: 1, performanceScore: -1 })
VendorSchema.index({ rating: -1 })

// Pre-save hook to ensure performance score is set if not provided
VendorSchema.pre('save', function (next) {
  // If performance score is not set, initialize to 0
  if (this.performanceScore === undefined || this.performanceScore === null) {
    this.performanceScore = 0
  }
  ;(next as (error?: Error) => void)()
})

// Virtual for active contracts count (will be populated by queries)
VendorSchema.virtual('activeContractsCount', {
  ref: 'Contract',
  localField: '_id',
  foreignField: 'vendorId',
  count: true,
  match: { status: 'Active' },
})

const Vendor = mongoose.models.Vendor || mongoose.model<IVendor>('Vendor', VendorSchema)

export default Vendor

