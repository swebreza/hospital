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

export type UserRole =
  | 'admin'
  | 'biomedical_engineer'
  | 'technician'
  | 'manager'
  | 'viewer'

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
}

export type AssetStatus =
  | 'Active'
  | 'Maintenance'
  | 'Breakdown'
  | 'Condemned'
  | 'Standby'

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
  escalationMatrix?: EscalationContact[]
  createdAt: string
  updatedAt: string
}

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
  [key: string]: any
}

export interface SortOptions {
  field: string
  order: 'asc' | 'desc'
}
