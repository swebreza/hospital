import mongoose, { Schema, Document } from 'mongoose'

export interface IDocument extends Document {
  entityType: string // 'asset', 'calibration', 'contract', etc.
  entityId: string
  documentType: string // 'manual', 'warranty', 'certificate', etc.
  documentCategory?: 'Manual' | 'Warranty' | 'Training_Video' | 'Certificate' | 'IQ' | 'PQ' | 'OQ' | 'Factory_Calibration'
  fileName: string
  fileUrl: string
  fileSize?: number
  mimeType?: string
  thumbnailUrl?: string // For video previews
  uploadedBy?: mongoose.Types.ObjectId
  createdAt: Date
}

const DocumentSchema = new Schema<IDocument>(
  {
    entityType: {
      type: String,
      required: true,
      index: true,
    },
    entityId: {
      type: String,
      required: true,
      index: true,
    },
    documentType: {
      type: String,
      required: true,
    },
    documentCategory: {
      type: String,
      enum: ['Manual', 'Warranty', 'Training_Video', 'Certificate', 'IQ', 'PQ', 'OQ', 'Factory_Calibration'],
      index: true,
    },
    fileName: {
      type: String,
      required: true,
    },
    fileUrl: {
      type: String,
      required: true,
    },
    fileSize: Number,
    mimeType: String,
    thumbnailUrl: String,
    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
)

// Compound indexes
DocumentSchema.index({ entityType: 1, entityId: 1 })
DocumentSchema.index({ entityType: 1, documentCategory: 1 })
DocumentSchema.index({ documentCategory: 1, entityId: 1 })

const DocumentModel = mongoose.models.Document || mongoose.model<IDocument>('Document', DocumentSchema)

export default DocumentModel

