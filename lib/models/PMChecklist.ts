import mongoose from 'mongoose'

export interface IPMChecklist extends mongoose.Document {
  assetId: string
  assetName?: string
  modelNo?: string
  serialNumber?: string
  pmDate: Date
  nextPmDue?: Date
  
  // General Inspection
  generalInspection: {
    powerCord: 'Intact' | 'Loose Connections' | null
    controlSystemDisplay: 'Working' | 'Not Working' | null
    lamp: 'Working' | 'Not Working' | null
    instrumentStatus: 'Yes' | 'No' | null
    instrumentProblem: 'Yes' | 'No' | null
  }
  
  // Electrical Safety Checks
  electricalSafety: {
    lineNeutralVoltage?: number // Should be 230+/-5V
    lineGroundVoltage?: number // Should be 230+/-5V
    groundNeutralVoltage?: number // Should be <5V
  }
  
  // Usage
  usage: {
    airSafeCondition: 'Safe' | 'Not Safe' | null
    inflow: 'Working' | 'Not Working' | null
    downFlow: 'Working' | 'Not Working' | null
    time: 'Working' | 'Not Working' | null
  }
  
  // Additional fields
  comments?: string
  
  // Signatures
  engineerName?: string
  engineerSignature?: string // Base64 or URL to signature image
  endUserName?: string
  endUserSignature?: string // Base64 or URL to signature image
  
  // Metadata
  performedBy?: string // Clerk user ID
  createdAt: Date
  updatedAt: Date
}

const PMChecklistSchema = new mongoose.Schema<IPMChecklist>(
  {
    assetId: {
      type: String,
      required: true,
      index: true,
    },
    assetName: {
      type: String,
    },
    modelNo: {
      type: String,
    },
    serialNumber: {
      type: String,
    },
    pmDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    nextPmDue: {
      type: Date,
    },
    
    // General Inspection
    generalInspection: {
      powerCord: {
        type: String,
        enum: ['Intact', 'Loose Connections', null],
        default: null,
      },
      controlSystemDisplay: {
        type: String,
        enum: ['Working', 'Not Working', null],
        default: null,
      },
      lamp: {
        type: String,
        enum: ['Working', 'Not Working', null],
        default: null,
      },
      instrumentStatus: {
        type: String,
        enum: ['Yes', 'No', null],
        default: null,
      },
      instrumentProblem: {
        type: String,
        enum: ['Yes', 'No', null],
        default: null,
      },
    },
    
    // Electrical Safety Checks
    electricalSafety: {
      lineNeutralVoltage: {
        type: Number,
      },
      lineGroundVoltage: {
        type: Number,
      },
      groundNeutralVoltage: {
        type: Number,
      },
    },
    
    // Usage
    usage: {
      airSafeCondition: {
        type: String,
        enum: ['Safe', 'Not Safe', null],
        default: null,
      },
      inflow: {
        type: String,
        enum: ['Working', 'Not Working', null],
        default: null,
      },
      downFlow: {
        type: String,
        enum: ['Working', 'Not Working', null],
        default: null,
      },
      time: {
        type: String,
        enum: ['Working', 'Not Working', null],
        default: null,
      },
    },
    
    // Additional fields
    comments: {
      type: String,
    },
    
    // Signatures
    engineerName: {
      type: String,
    },
    engineerSignature: {
      type: String,
    },
    endUserName: {
      type: String,
    },
    endUserSignature: {
      type: String,
    },
    
    // Metadata
    performedBy: {
      type: String, // Clerk user ID
    },
  },
  {
    timestamps: true,
  }
)

// Indexes
PMChecklistSchema.index({ assetId: 1, pmDate: -1 })
PMChecklistSchema.index({ nextPmDue: 1 })

const PMChecklist =
  mongoose.models.PMChecklist ||
  mongoose.model<IPMChecklist>('PMChecklist', PMChecklistSchema)

export default PMChecklist

