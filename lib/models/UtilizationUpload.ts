import mongoose, { Schema, Document } from 'mongoose'

export interface IUtilizationUpload extends Document {
  uploadedBy: mongoose.Types.ObjectId
  uploadDate: Date
  fileName: string
  recordCount: number
  successCount: number
  errorCount: number
  status: 'pending' | 'processing' | 'completed' | 'failed'
  errors?: Array<{
    row: number
    message: string
    data?: Record<string, unknown>
  }>
  createdAt: Date
  updatedAt: Date
}

const UtilizationUploadSchema = new Schema<IUtilizationUpload>(
  {
    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    uploadDate: {
      type: Date,
      required: true,
      default: Date.now,
      index: true,
    },
    fileName: {
      type: String,
      required: true,
    },
    recordCount: {
      type: Number,
      required: true,
      min: 0,
    },
    successCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    errorCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending',
      index: true,
    },
    errors: [
      {
        row: Number,
        message: String,
        data: Schema.Types.Mixed,
      },
    ],
  },
  {
    timestamps: true,
  }
)

// Indexes for querying uploads
UtilizationUploadSchema.index({ uploadedBy: 1, uploadDate: -1 })
UtilizationUploadSchema.index({ status: 1, uploadDate: -1 })

const UtilizationUpload =
  mongoose.models.UtilizationUpload ||
  mongoose.model<IUtilizationUpload>('UtilizationUpload', UtilizationUploadSchema)

export default UtilizationUpload

