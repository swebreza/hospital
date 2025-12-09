import mongoose, { Schema, Document } from 'mongoose'

export interface ITrainingParticipant extends Document {
  trainingSessionId: mongoose.Types.ObjectId
  userId: string // UUID from Prisma User model
  attendanceStatus: 'Registered' | 'Attended' | 'Absent' | 'Cancelled'
  certificationStatus: 'NotCertified' | 'Certified' | 'Expired' | 'RecertificationDue'
  certifiedAt?: Date
  certificationExpiryDate?: Date
  attendedAt?: Date
  notes?: string
  createdAt: Date
  updatedAt: Date
}

const TrainingParticipantSchema = new Schema<ITrainingParticipant>(
  {
    trainingSessionId: {
      type: Schema.Types.ObjectId,
      ref: 'TrainingSession',
      required: true,
      index: true,
    },
    userId: {
      type: String, // UUID string from Prisma User
      required: true,
      index: true,
    },
    attendanceStatus: {
      type: String,
      enum: ['Registered', 'Attended', 'Absent', 'Cancelled'],
      default: 'Registered',
      index: true,
    },
    certificationStatus: {
      type: String,
      enum: ['NotCertified', 'Certified', 'Expired', 'RecertificationDue'],
      default: 'NotCertified',
      index: true,
    },
    certifiedAt: Date,
    certificationExpiryDate: {
      type: Date,
      index: true,
    },
    attendedAt: Date,
    notes: String,
  },
  {
    timestamps: true,
  }
)

// Compound indexes for common queries
TrainingParticipantSchema.index({ trainingSessionId: 1, userId: 1 }, { unique: true })
TrainingParticipantSchema.index({ userId: 1, certificationStatus: 1 })
TrainingParticipantSchema.index({ trainingSessionId: 1, attendanceStatus: 1 })
TrainingParticipantSchema.index({ certificationExpiryDate: 1, certificationStatus: 1 })

const TrainingParticipant = mongoose.models.TrainingParticipant || mongoose.model<ITrainingParticipant>('TrainingParticipant', TrainingParticipantSchema)

export default TrainingParticipant

