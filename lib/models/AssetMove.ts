import mongoose, { Schema, Document } from 'mongoose'

export interface IAssetMove extends Document {
  assetId: mongoose.Types.ObjectId
  fromLocation?: string
  toLocation?: string
  fromDepartment?: string
  toDepartment?: string
  moveDate: Date
  movedBy?: mongoose.Types.ObjectId
  reason?: string
  createdAt: Date
}

const AssetMoveSchema = new Schema<IAssetMove>(
  {
    assetId: {
      type: Schema.Types.ObjectId,
      ref: 'Asset',
      required: true,
      index: true,
    },
    fromLocation: String,
    toLocation: String,
    fromDepartment: String,
    toDepartment: String,
    moveDate: {
      type: Date,
      required: true,
      default: Date.now,
      index: true,
    },
    movedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    reason: String,
  },
  {
    timestamps: true,
  }
)

// Compound indexes
AssetMoveSchema.index({ assetId: 1, moveDate: -1 })
AssetMoveSchema.index({ toDepartment: 1, moveDate: -1 })

const AssetMove = mongoose.models.AssetMove || mongoose.model<IAssetMove>('AssetMove', AssetMoveSchema)

export default AssetMove

