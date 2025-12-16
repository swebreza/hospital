import mongoose, { Schema, Document } from 'mongoose'

export interface ITrainingSession extends Document {
  assetId: mongoose.Types.ObjectId
  sessionDate: Date
  trainerId: string // UUID from Prisma User model
  title: string
  description?: string
  department: string
  location?: string
  durationMinutes?: number
  status: 'Scheduled' | 'InProgress' | 'Completed' | 'Cancelled'
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

const TrainingSessionSchema = new Schema<ITrainingSession>(
  {
    assetId: {
      type: Schema.Types.ObjectId,
      ref: 'Asset',
      required: true,
      index: true,
    },
    sessionDate: {
      type: Date,
      required: true,
      index: true,
    },
    trainerId: {
      type: String, // UUID string from Prisma User - MUST be String, NOT ObjectId
      required: true,
      index: true,
      set: function(v: any) {
        // Setter: Always convert to string, prevent any ObjectId casting
        return String(v || '')
      },
    },
    title: {
      type: String,
      required: true,
    },
    description: String,
    department: {
      type: String,
      required: true,
      index: true,
    },
    location: String,
    durationMinutes: Number,
    status: {
      type: String,
      enum: ['Scheduled', 'InProgress', 'Completed', 'Cancelled'],
      default: 'Scheduled',
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
    strict: true,
  }
)

// Compound indexes for common queries
TrainingSessionSchema.index({ assetId: 1, sessionDate: -1 })
TrainingSessionSchema.index({ trainerId: 1, status: 1 })
TrainingSessionSchema.index({ department: 1, status: 1 })
TrainingSessionSchema.index({ sessionDate: -1, status: 1 })

// Delete model from cache if it exists to ensure fresh schema
// This is necessary because Mongoose caches models and the schema might have changed
if (mongoose.models.TrainingSession) {
  delete mongoose.models.TrainingSession
}
if ((mongoose as any).connection?.models?.TrainingSession) {
  delete (mongoose as any).connection.models.TrainingSession
}

const TrainingSession = mongoose.model<ITrainingSession>('TrainingSession', TrainingSessionSchema)

export default TrainingSession
