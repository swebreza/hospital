import mongoose, { Schema, Document } from 'mongoose'

export interface ITrainingCertification extends Document {
  participantId: mongoose.Types.ObjectId
  assetId: mongoose.Types.ObjectId
  certificationNumber: string
  issuedDate: Date
  expiryDate?: Date
  status: 'Active' | 'Expired' | 'Revoked' | 'Renewed'
  certificateUrl?: string
  issuedBy: string // UUID from Prisma User model
  preTestScore?: number
  postTestScore?: number
  improvementPercentage?: number
  createdAt: Date
  updatedAt: Date
}

const TrainingCertificationSchema = new Schema<ITrainingCertification>(
  {
    participantId: {
      type: Schema.Types.ObjectId,
      ref: 'TrainingParticipant',
      required: true,
      index: true,
    },
    assetId: {
      type: Schema.Types.ObjectId,
      ref: 'Asset',
      required: true,
      index: true,
    },
    certificationNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    issuedDate: {
      type: Date,
      required: true,
      default: Date.now,
      index: true,
    },
    expiryDate: {
      type: Date,
      index: true,
    },
    status: {
      type: String,
      enum: ['Active', 'Expired', 'Revoked', 'Renewed'],
      default: 'Active',
      index: true,
    },
    certificateUrl: String,
    issuedBy: {
      type: String, // UUID string from Prisma User
      required: true,
    },
    preTestScore: {
      type: Number,
      min: 0,
      max: 100,
    },
    postTestScore: {
      type: Number,
      min: 0,
      max: 100,
    },
    improvementPercentage: {
      type: Number,
      min: -100,
      max: 100,
    },
  },
  {
    timestamps: true,
  }
)

// Compound indexes for common queries
TrainingCertificationSchema.index({ participantId: 1, assetId: 1 })
TrainingCertificationSchema.index({ assetId: 1, status: 1 })
TrainingCertificationSchema.index({ expiryDate: 1, status: 1 })
TrainingCertificationSchema.index({ participantId: 1, status: 1 })

// Pre-save hook to generate certification number if not provided
TrainingCertificationSchema.pre('save', function (next) {
  if (!this.certificationNumber) {
    const prefix = 'CERT'
    const timestamp = Date.now().toString(36).toUpperCase()
    const random = Math.random().toString(36).substring(2, 6).toUpperCase()
    this.certificationNumber = `${prefix}-${timestamp}-${random}`
  }
  ;(next as (error?: Error) => void)()

  // Calculate improvement percentage if both scores exist
  if (this.preTestScore !== undefined && this.postTestScore !== undefined && this.preTestScore > 0) {
    this.improvementPercentage = Math.round(((this.postTestScore - this.preTestScore) / this.preTestScore) * 100 * 100) / 100
  }

  next()
})

const TrainingCertification = mongoose.models.TrainingCertification || mongoose.model<ITrainingCertification>('TrainingCertification', TrainingCertificationSchema)

export default TrainingCertification

