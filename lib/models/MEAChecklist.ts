import mongoose, { Schema, Document } from 'mongoose'

export interface IMEAChecklist extends Document {
  assetId: mongoose.Types.ObjectId
  checklistType: 'IQ' | 'PQ' | 'OQ' | 'Factory_Calibration' | 'Training'
  performedDate: Date
  performedBy?: mongoose.Types.ObjectId
  status: 'Completed' | 'Pending' | 'Failed'
  notes?: string
  documents?: Array<{
    fileName: string
    fileUrl: string
    fileSize?: number
    mimeType?: string
  }>
  createdAt: Date
  updatedAt: Date
}

const MEAChecklistSchema = new Schema<IMEAChecklist>(
  {
    assetId: {
      type: Schema.Types.ObjectId,
      ref: 'Asset',
      required: true,
      index: true,
    },
    checklistType: {
      type: String,
      enum: ['IQ', 'PQ', 'OQ', 'Factory_Calibration', 'Training'],
      required: true,
      index: true,
    },
    performedDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    performedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    status: {
      type: String,
      enum: ['Completed', 'Pending', 'Failed'],
      default: 'Pending',
      index: true,
    },
    notes: String,
    documents: [
      {
        fileName: String,
        fileUrl: String,
        fileSize: Number,
        mimeType: String,
      },
    ],
  },
  {
    timestamps: true,
  }
)

// Compound indexes
MEAChecklistSchema.index({ assetId: 1, checklistType: 1 })
MEAChecklistSchema.index({ assetId: 1, status: 1 })
MEAChecklistSchema.index({ performedDate: -1 })

const MEAChecklist = mongoose.models.MEAChecklist || mongoose.model<IMEAChecklist>('MEAChecklist', MEAChecklistSchema)

export default MEAChecklist

