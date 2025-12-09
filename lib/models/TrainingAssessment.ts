import mongoose, { Schema, Document } from 'mongoose'

export interface ITrainingAssessment extends Document {
  trainingSessionId: mongoose.Types.ObjectId
  participantId: mongoose.Types.ObjectId
  assessmentType: 'PreTest' | 'PostTest'
  score?: number
  maxScore?: number
  questions?: Array<{
    question: string
    type: 'multiple_choice' | 'true_false' | 'short_answer' | 'essay'
    options?: string[]
    correctAnswer?: string | number | boolean
    points: number
  }>
  answers?: Array<{
    questionIndex: number
    answer: string | number | boolean
    pointsEarned: number
  }>
  documentUrl?: string
  completedAt?: Date
  gradedBy?: string // UUID from Prisma User model
  notes?: string
  createdAt: Date
  updatedAt: Date
}

const TrainingAssessmentSchema = new Schema<ITrainingAssessment>(
  {
    trainingSessionId: {
      type: Schema.Types.ObjectId,
      ref: 'TrainingSession',
      required: true,
      index: true,
    },
    participantId: {
      type: Schema.Types.ObjectId,
      ref: 'TrainingParticipant',
      required: true,
      index: true,
    },
    assessmentType: {
      type: String,
      enum: ['PreTest', 'PostTest'],
      required: true,
      index: true,
    },
    score: {
      type: Number,
      min: 0,
      max: 100,
    },
    maxScore: {
      type: Number,
      default: 100,
    },
    questions: [
      {
        question: String,
        type: {
          type: String,
          enum: ['multiple_choice', 'true_false', 'short_answer', 'essay'],
        },
        options: [String],
        correctAnswer: Schema.Types.Mixed,
        points: Number,
      },
    ],
    answers: [
      {
        questionIndex: Number,
        answer: Schema.Types.Mixed,
        pointsEarned: Number,
      },
    ],
    documentUrl: String,
    completedAt: Date,
    gradedBy: {
      type: String, // UUID string from Prisma User
    },
    notes: String,
  },
  {
    timestamps: true,
  }
)

// Compound indexes for common queries
TrainingAssessmentSchema.index({ trainingSessionId: 1, participantId: 1, assessmentType: 1 }, { unique: true })
TrainingAssessmentSchema.index({ participantId: 1, assessmentType: 1 })
TrainingAssessmentSchema.index({ trainingSessionId: 1, assessmentType: 1 })

const TrainingAssessment = mongoose.models.TrainingAssessment || mongoose.model<ITrainingAssessment>('TrainingAssessment', TrainingAssessmentSchema)

export default TrainingAssessment

