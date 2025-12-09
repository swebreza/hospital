import mongoose, { Schema, Document } from 'mongoose'

export interface IAssetHistory extends Document {
  assetId: mongoose.Types.ObjectId
  eventType: 'Repair' | 'Move' | 'Calibration' | 'StatusChange' | 'PM' | 'Complaint'
  eventDate: Date
  description?: string
  performedBy?: mongoose.Types.ObjectId
  oldValue?: string
  newValue?: string
  metadata?: Record<string, unknown>
  createdAt: Date
}

const AssetHistorySchema = new Schema<IAssetHistory>(
  {
    assetId: {
      type: Schema.Types.ObjectId,
      ref: 'Asset',
      required: true,
      index: true,
    },
    eventType: {
      type: String,
      enum: ['Repair', 'Move', 'Calibration', 'StatusChange', 'PM', 'Complaint'],
      required: true,
      index: true,
    },
    eventDate: {
      type: Date,
      required: true,
      default: Date.now,
      index: true,
    },
    description: String,
    performedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    oldValue: String,
    newValue: String,
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
)

// Compound indexes
AssetHistorySchema.index({ assetId: 1, eventDate: -1 })
AssetHistorySchema.index({ assetId: 1, eventType: 1 })
AssetHistorySchema.index({ eventDate: -1, eventType: 1 })

const AssetHistory = mongoose.models.AssetHistory || mongoose.model<IAssetHistory>('AssetHistory', AssetHistorySchema)

export default AssetHistory

