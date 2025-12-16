// Common types for the BME-AMS application

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  department?: string
  avatar?: string
  createdAt: string
  updatedAt: string
}

// Legacy roles (for backward compatibility)
export type LegacyUserRole =
  | 'admin'
  | 'biomedical_engineer'
  | 'technician'
  | 'manager'
  | 'viewer'

// Clerk-based roles
export type ClerkUserRole = 'normal' | 'full_access'

// Combined role type
export type UserRole = LegacyUserRole | ClerkUserRole

export interface Asset {
  id: string
  name: string
  model: string
  manufacturer: string
  serialNumber: string
  department: string
  location: string
  status: AssetStatus
  purchaseDate: string
  nextPmDate: string
  nextCalibrationDate?: string
  value: number
  image?: string
  qrCode?: string
  warrantyExpiry?: string
  amcExpiry?: string
  createdAt: string
  updatedAt: string
  
  // Enhanced fields for Asset Inventory Management
  assetType?: string // Type classification (e.g., Diagnostic, Therapeutic, Life Support)
  modality?: string // Medical modality (e.g., MRI, CT, Ultrasound)
  criticality?: CriticalityLevel
  oem?: string // Original Equipment Manufacturer
  farNumber?: string // Fixed Asset Register number
  lifecycleState?: LifecycleState
  isMinorAsset?: boolean
  ageYears?: number
  totalDowntimeHours?: number
  totalServiceCost?: number
  utilizationPercentage?: number
  replacementRecommended?: boolean
  replacementReason?: string
  specifications?: Record<string, unknown> // Flexible specifications storage
  installationDate?: string
  commissioningDate?: string
  
  // Category object for easier access
  category?: AssetCategory
  
  // Lifecycle object
  lifecycle?: {
    state: LifecycleState
    age: number
    replacementRecommended: boolean
    replacementReason?: string
  }
}

export type AssetStatus =
  | 'Active'
  | 'Maintenance'
  | 'Breakdown'
  | 'Condemned'
  | 'Standby'
  | 'In-Service'
  | 'Spare'
  | 'Disposed'
  | 'Demo'
  | 'Under-Service'

export interface PreventiveMaintenance {
  id: string
  assetId: string
  asset?: Asset
  scheduledDate: string
  completedDate?: string
  technicianId?: string
  technician?: User
  status: PMStatus
  checklist: PMChecklistItem[]
  notes?: string
  images?: string[]
  createdAt: string
  updatedAt: string
}

export type PMStatus =
  | 'Scheduled'
  | 'In Progress'
  | 'Completed'
  | 'Overdue'
  | 'Cancelled'

export interface PMChecklistItem {
  id: string
  task: string
  type: 'boolean' | 'text' | 'number'
  result?: boolean | string | number
  notes?: string
}

export interface Calibration {
  id: string
  assetId: string
  asset?: Asset
  calibrationDate: string
  nextDueDate: string
  vendorId?: string
  vendor?: Vendor
  certificateUrl?: string
  status: CalibrationStatus
  notes?: string
  createdAt: string
  updatedAt: string
}

export type CalibrationStatus =
  | 'Scheduled'
  | 'In Progress'
  | 'Completed'
  | 'Expired'
  | 'Overdue'

export interface Complaint {
  id: string
  assetId: string
  asset?: Asset
  title: string
  description: string
  priority: ComplaintPriority
  status: ComplaintStatus
  reportedBy: string
  reportedByUser?: User
  assignedTo?: string
  assignedToUser?: User
  reportedAt: string
  respondedAt?: string
  resolvedAt?: string
  downtime?: number // in minutes
  slaDeadline?: string
  rootCause?: string
  resolution?: string
  beforeImages?: string[]
  afterImages?: string[]
  createdAt: string
  updatedAt: string
}

export type ComplaintPriority = 'Low' | 'Medium' | 'High' | 'Critical'
export type ComplaintStatus =
  | 'Open'
  | 'In Progress'
  | 'Resolved'
  | 'Closed'
  | 'Escalated'

export interface CorrectiveMaintenance {
  id: string
  complaintId?: string
  complaint?: Complaint
  assetId: string
  asset?: Asset
  repairDate: string
  technicianId: string
  technician?: User
  laborHours: number
  spareParts: SparePartUsage[]
  totalCost: number
  rootCause?: string
  notes?: string
  beforeImages?: string[]
  afterImages?: string[]
  createdAt: string
  updatedAt: string
}

export interface SparePartUsage {
  partId: string
  part?: InventoryItem
  quantity: number
  unitCost: number
  totalCost: number
}

export interface InventoryItem {
  id: string
  name: string
  category: string
  partNumber?: string
  stock: number
  minLevel: number
  maxLevel?: number
  unit: string
  unitCost: number
  vendorId?: string
  vendor?: Vendor
  location?: string
  createdAt: string
  updatedAt: string
}

export interface Vendor {
  id: string
  name: string
  contactPerson?: string
  email?: string
  phone?: string
  address?: string
  rating?: number
  performanceScore?: number
  status?: VendorStatus
  escalationMatrix?: EscalationContact[]
  createdAt: string
  updatedAt: string
}

export type VendorStatus = 'Pending' | 'Active' | 'Inactive' | 'Suspended'

export interface EscalationContact {
  level: number
  name: string
  email: string
  phone: string
}

export interface Contract {
  id: string
  vendorId: string
  vendor?: Vendor
  type: ContractType
  assetIds?: string[]
  assets?: Asset[]
  startDate: string
  endDate: string
  value: number
  renewalDate?: string
  documents?: string[]
  status: ContractStatus
  notes?: string
  createdAt: string
  updatedAt: string
}

export type ContractType = 'AMC' | 'CMC' | 'Warranty' | 'Service'
export type ContractStatus = 'Active' | 'Expired' | 'Renewed' | 'Cancelled'

export interface CAPEXProposal {
  id: string
  title: string
  description: string
  department: string
  budget: number
  quotes: Quote[]
  technicalComparison?: string
  clinicalComparison?: string
  status: CAPEXStatus
  submittedBy: string
  submittedByUser?: User
  submittedAt: string
  approvals: Approval[]
  roi?: number
  createdAt: string
  updatedAt: string
}

export interface Quote {
  id: string
  vendorId: string
  vendor?: Vendor
  amount: number
  documentUrl?: string
  notes?: string
}

export type CAPEXStatus =
  | 'Draft'
  | 'Submitted'
  | 'Under Review'
  | 'Approved'
  | 'Rejected'
  | 'Procured'

export interface Approval {
  id: string
  approverId: string
  approver?: User
  level: number
  status: ApprovalStatus
  comments?: string
  approvedAt?: string
  createdAt: string
}

export type ApprovalStatus = 'Pending' | 'Approved' | 'Rejected'

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface FilterOptions {
  search?: string
  status?: string
  department?: string
  dateFrom?: string
  dateTo?: string
  assetType?: string
  modality?: string
  criticality?: CriticalityLevel
  oem?: string
  lifecycleState?: LifecycleState
  isMinorAsset?: boolean
  farNumber?: string
  replacementRecommended?: boolean
  [key: string]: unknown
}

export interface SortOptions {
  field: string
  order: 'asc' | 'desc'
}

// Asset Inventory Management Types

export type CriticalityLevel = 'Critical' | 'High' | 'Medium' | 'Low'

export type LifecycleState =
  | 'Active'
  | 'In-Service'
  | 'Spare'
  | 'Disposed'
  | 'Condemned'
  | 'Demo'
  | 'Under-Service'

export interface AssetCategory {
  type?: string
  modality?: string
  criticality?: CriticalityLevel
  oem?: string
}

export interface AssetHistory {
  id: string
  assetId: string
  asset?: Asset
  eventType: AssetHistoryEventType
  eventDate: string
  description?: string
  performedBy?: string
  performedByUser?: User
  oldValue?: string
  newValue?: string
  metadata?: Record<string, unknown>
  createdAt: string
}

export type AssetHistoryEventType =
  | 'Repair'
  | 'Move'
  | 'Calibration'
  | 'StatusChange'
  | 'PM'
  | 'Complaint'

export interface MEAChecklist {
  id: string
  assetId: string
  asset?: Asset
  checklistType: MEAChecklistType
  performedDate: string
  performedBy?: string
  performedByUser?: User
  status: MEAChecklistStatus
  notes?: string
  documents?: MEAChecklistDocument[]
  createdAt: string
  updatedAt: string
}

export type MEAChecklistType =
  | 'IQ'
  | 'PQ'
  | 'OQ'
  | 'Factory_Calibration'
  | 'Training'

export type MEAChecklistStatus = 'Completed' | 'Pending' | 'Failed'

export interface MEAChecklistDocument {
  fileName: string
  fileUrl: string
  fileSize?: number
  mimeType?: string
}

export interface AssetMove {
  id: string
  assetId: string
  asset?: Asset
  fromLocation?: string
  toLocation?: string
  fromDepartment?: string
  toDepartment?: string
  moveDate: string
  movedBy?: string
  movedByUser?: User
  reason?: string
  createdAt: string
}

export interface Document {
  id: string
  entityType: string
  entityId: string
  documentType: string
  documentCategory?: DocumentCategory
  fileName: string
  fileUrl: string
  fileSize?: number
  mimeType?: string
  thumbnailUrl?: string
  uploadedBy?: string
  uploadedByUser?: User
  createdAt: string
}

export type DocumentCategory =
  | 'Manual'
  | 'Warranty'
  | 'Training_Video'
  | 'Certificate'
  | 'IQ'
  | 'PQ'
  | 'OQ'
  | 'Factory_Calibration'

// Training Management Types

export type TrainingSessionStatus = 'Scheduled' | 'InProgress' | 'Completed' | 'Cancelled'

export type AttendanceStatus = 'Registered' | 'Attended' | 'Absent' | 'Cancelled'

export type CertificationStatus = 'NotCertified' | 'Certified' | 'Expired' | 'RecertificationDue'

export type AssessmentType = 'PreTest' | 'PostTest'

export type TrainingCertificationStatus = 'Active' | 'Expired' | 'Revoked' | 'Renewed'

export interface TrainingSession {
  id: string
  assetId: string
  asset?: Asset
  sessionDate: string
  trainerId: string
  trainer?: User
  title: string
  description?: string
  department: string
  location?: string
  durationMinutes?: number
  status: TrainingSessionStatus
  notes?: string
  documents?: Array<{
    fileName: string
    fileUrl: string
    fileSize?: number
    mimeType?: string
  }>
  participants?: TrainingParticipant[]
  assessments?: TrainingAssessment[]
  certifications?: TrainingCertification[]
  createdAt: string
  updatedAt: string
}

export interface TrainingParticipant {
  id: string
  trainingSessionId: string
  trainingSession?: TrainingSession
  userId: string
  user?: User
  attendanceStatus: AttendanceStatus
  certificationStatus: CertificationStatus
  certifiedAt?: string
  certificationExpiryDate?: string
  attendedAt?: string
  notes?: string
  assessments?: TrainingAssessment[]
  certifications?: TrainingCertification[]
  createdAt: string
  updatedAt: string
}

export interface TrainingAssessment {
  id: string
  trainingSessionId: string
  trainingSession?: TrainingSession
  participantId: string
  participant?: TrainingParticipant
  assessmentType: AssessmentType
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
  completedAt?: string
  gradedBy?: string
  grader?: User
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface TrainingCertification {
  id: string
  participantId: string
  participant?: TrainingParticipant
  assetId: string
  asset?: Asset
  certificationNumber: string
  issuedDate: string
  expiryDate?: string
  status: TrainingCertificationStatus
  certificateUrl?: string
  issuedBy: string
  issuer?: User
  preTestScore?: number
  postTestScore?: number
  improvementPercentage?: number
  createdAt: string
  updatedAt: string
}