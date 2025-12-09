import mongoose, { Schema, Document } from 'mongoose'

export interface IEquipmentUtilization extends Document {
  assetId: mongoose.Types.ObjectId
  date: Date
  usageHours?: number
  usageCount?: number
  recordedBy?: mongoose.Types.ObjectId
  source: 'manual' | 'CSV'
  notes?: string
  createdAt: Date
  updatedAt: Date
}

const EquipmentUtilizationSchema = new Schema<IEquipmentUtilization>(
  {
    assetId: {
      type: Schema.Types.ObjectId,
      ref: 'Asset',
      required: true,
      index: true,
    },
    date: {
      type: Date,
      required: true,
      index: true,
    },
    usageHours: {
      type: Number,
      min: 0,
    },
    usageCount: {
      type: Number,
      min: 0,
    },
    recordedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    source: {
      type: String,
      enum: ['manual', 'CSV'],
      required: true,
      default: 'manual',
    },
    notes: String,
  },
  {
    timestamps: true,
  }
)

// Compound indexes for common queries
EquipmentUtilizationSchema.index({ assetId: 1, date: -1 })
EquipmentUtilizationSchema.index({ date: -1 })
EquipmentUtilizationSchema.index({ source: 1, date: -1 })

// Prevent duplicate entries for same asset and date
EquipmentUtilizationSchema.index({ assetId: 1, date: 1 }, { unique: true })

const EquipmentUtilization =
  mongoose.models.EquipmentUtilization ||
  mongoose.model<IEquipmentUtilization>(
    'EquipmentUtilization',
    EquipmentUtilizationSchema
  )

export default EquipmentUtilization

