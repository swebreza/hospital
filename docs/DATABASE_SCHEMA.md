# Database Schema Design

## Overview
This document outlines the database schema for the BME-AMS (Biomedical Equipment Asset Management System).

## Technology Stack
- Database: PostgreSQL
- ORM: Prisma (recommended) or raw SQL
- Migration Tool: Prisma Migrate

## Tables

### users
Stores user accounts and authentication information.

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'biomedical_engineer', 'technician', 'manager', 'viewer')),
  department VARCHAR(100),
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
```

### assets
Stores biomedical equipment assets.

```sql
CREATE TABLE assets (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  model VARCHAR(255),
  manufacturer VARCHAR(255),
  serial_number VARCHAR(255) UNIQUE,
  department VARCHAR(100) NOT NULL,
  location VARCHAR(255),
  status VARCHAR(50) NOT NULL CHECK (status IN ('Active', 'Maintenance', 'Breakdown', 'Condemned', 'Standby')),
  purchase_date DATE,
  next_pm_date DATE,
  next_calibration_date DATE,
  value DECIMAL(15, 2),
  image_url TEXT,
  qr_code TEXT,
  warranty_expiry DATE,
  amc_expiry DATE,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_assets_department ON assets(department);
CREATE INDEX idx_assets_status ON assets(status);
CREATE INDEX idx_assets_serial_number ON assets(serial_number);
```

### preventive_maintenances
Stores preventive maintenance records.

```sql
CREATE TABLE preventive_maintenances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id VARCHAR(50) REFERENCES assets(id) ON DELETE CASCADE,
  scheduled_date DATE NOT NULL,
  completed_date TIMESTAMP,
  technician_id UUID REFERENCES users(id),
  status VARCHAR(50) NOT NULL CHECK (status IN ('Scheduled', 'In Progress', 'Completed', 'Overdue', 'Cancelled')),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_pm_asset_id ON preventive_maintenances(asset_id);
CREATE INDEX idx_pm_scheduled_date ON preventive_maintenances(scheduled_date);
CREATE INDEX idx_pm_status ON preventive_maintenances(status);
```

### pm_checklist_items
Stores checklist items for preventive maintenance.

```sql
CREATE TABLE pm_checklist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pm_id UUID REFERENCES preventive_maintenances(id) ON DELETE CASCADE,
  task TEXT NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('boolean', 'text', 'number')),
  result_boolean BOOLEAN,
  result_text TEXT,
  result_number DECIMAL(10, 2),
  notes TEXT,
  order_index INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_checklist_pm_id ON pm_checklist_items(pm_id);
```

### calibrations
Stores calibration records.

```sql
CREATE TABLE calibrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id VARCHAR(50) REFERENCES assets(id) ON DELETE CASCADE,
  calibration_date DATE NOT NULL,
  next_due_date DATE NOT NULL,
  vendor_id UUID REFERENCES vendors(id),
  certificate_url TEXT,
  status VARCHAR(50) NOT NULL CHECK (status IN ('Scheduled', 'In Progress', 'Completed', 'Expired', 'Overdue')),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_calibration_asset_id ON calibrations(asset_id);
CREATE INDEX idx_calibration_next_due_date ON calibrations(next_due_date);
CREATE INDEX idx_calibration_status ON calibrations(status);
```

### complaints
Stores complaint/breakdown tickets.

```sql
CREATE TABLE complaints (
  id VARCHAR(50) PRIMARY KEY,
  asset_id VARCHAR(50) REFERENCES assets(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  priority VARCHAR(50) NOT NULL CHECK (priority IN ('Low', 'Medium', 'High', 'Critical')),
  status VARCHAR(50) NOT NULL CHECK (status IN ('Open', 'In Progress', 'Resolved', 'Closed', 'Escalated')),
  reported_by UUID REFERENCES users(id),
  assigned_to UUID REFERENCES users(id),
  reported_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  responded_at TIMESTAMP,
  resolved_at TIMESTAMP,
  downtime_minutes INTEGER,
  sla_deadline TIMESTAMP,
  root_cause TEXT,
  resolution TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_complaints_asset_id ON complaints(asset_id);
CREATE INDEX idx_complaints_status ON complaints(status);
CREATE INDEX idx_complaints_priority ON complaints(priority);
CREATE INDEX idx_complaints_reported_by ON complaints(reported_by);
```

### corrective_maintenances
Stores corrective maintenance/repair records.

```sql
CREATE TABLE corrective_maintenances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  complaint_id VARCHAR(50) REFERENCES complaints(id),
  asset_id VARCHAR(50) REFERENCES assets(id) ON DELETE CASCADE,
  repair_date TIMESTAMP NOT NULL,
  technician_id UUID REFERENCES users(id),
  labor_hours DECIMAL(5, 2),
  total_cost DECIMAL(15, 2),
  root_cause TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_cm_asset_id ON corrective_maintenances(asset_id);
CREATE INDEX idx_cm_complaint_id ON corrective_maintenances(complaint_id);
```

### spare_part_usage
Stores spare parts used in corrective maintenance.

```sql
CREATE TABLE spare_part_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cm_id UUID REFERENCES corrective_maintenances(id) ON DELETE CASCADE,
  part_id UUID REFERENCES inventory_items(id),
  quantity INTEGER NOT NULL,
  unit_cost DECIMAL(10, 2) NOT NULL,
  total_cost DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_spare_part_cm_id ON spare_part_usage(cm_id);
```

### inventory_items
Stores inventory/spare parts.

```sql
CREATE TABLE inventory_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100),
  part_number VARCHAR(100),
  stock INTEGER NOT NULL DEFAULT 0,
  min_level INTEGER NOT NULL DEFAULT 0,
  max_level INTEGER,
  unit VARCHAR(50) NOT NULL,
  unit_cost DECIMAL(10, 2),
  vendor_id UUID REFERENCES vendors(id),
  location VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_inventory_category ON inventory_items(category);
CREATE INDEX idx_inventory_stock ON inventory_items(stock);
```

### vendors
Stores vendor information.

```sql
CREATE TABLE vendors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  contact_person VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(50),
  address TEXT,
  rating DECIMAL(3, 2) CHECK (rating >= 0 AND rating <= 5),
  performance_score DECIMAL(5, 2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_vendors_name ON vendors(name);
```

### contracts
Stores AMC/CMC contracts.

```sql
CREATE TABLE contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL CHECK (type IN ('AMC', 'CMC', 'Warranty', 'Service')),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  value DECIMAL(15, 2),
  renewal_date DATE,
  status VARCHAR(50) NOT NULL CHECK (status IN ('Active', 'Expired', 'Renewed', 'Cancelled')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_contracts_vendor_id ON contracts(vendor_id);
CREATE INDEX idx_contracts_end_date ON contracts(end_date);
CREATE INDEX idx_contracts_status ON contracts(status);
```

### capex_proposals
Stores CAPEX proposals.

```sql
CREATE TABLE capex_proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  department VARCHAR(100) NOT NULL,
  budget DECIMAL(15, 2) NOT NULL,
  technical_comparison TEXT,
  clinical_comparison TEXT,
  status VARCHAR(50) NOT NULL CHECK (status IN ('Draft', 'Submitted', 'Under Review', 'Approved', 'Rejected', 'Procured')),
  submitted_by UUID REFERENCES users(id),
  submitted_at TIMESTAMP,
  roi DECIMAL(10, 2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_capex_status ON capex_proposals(status);
CREATE INDEX idx_capex_department ON capex_proposals(department);
```

### quotes
Stores quotes for CAPEX proposals.

```sql
CREATE TABLE quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  capex_id UUID REFERENCES capex_proposals(id) ON DELETE CASCADE,
  vendor_id UUID REFERENCES vendors(id),
  amount DECIMAL(15, 2) NOT NULL,
  document_url TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_quotes_capex_id ON quotes(capex_id);
```

### approvals
Stores approval records for CAPEX proposals.

```sql
CREATE TABLE approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  capex_id UUID REFERENCES capex_proposals(id) ON DELETE CASCADE,
  approver_id UUID REFERENCES users(id),
  level INTEGER NOT NULL,
  status VARCHAR(50) NOT NULL CHECK (status IN ('Pending', 'Approved', 'Rejected')),
  comments TEXT,
  approved_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_approvals_capex_id ON approvals(capex_id);
CREATE INDEX idx_approvals_status ON approvals(status);
```

### documents
Stores document references (asset documents, certificates, etc.).

```sql
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type VARCHAR(50) NOT NULL, -- 'asset', 'calibration', 'contract', etc.
  entity_id VARCHAR(255) NOT NULL,
  document_type VARCHAR(100) NOT NULL, -- 'manual', 'warranty', 'certificate', etc.
  file_name VARCHAR(255) NOT NULL,
  file_url TEXT NOT NULL,
  file_size BIGINT,
  mime_type VARCHAR(100),
  uploaded_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_documents_entity ON documents(entity_type, entity_id);
```

### audit_logs
Stores audit trail for important actions.

```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50),
  entity_id VARCHAR(255),
  changes JSONB,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
```

## Relationships Summary

- Users can create/manage assets, PMs, complaints, etc.
- Assets have multiple PMs, calibrations, complaints, and corrective maintenances
- Complaints can have corrective maintenances
- Corrective maintenances use inventory items (spare parts)
- Assets can have multiple contracts (AMC/CMC)
- CAPEX proposals have multiple quotes and approvals
- Documents are linked to various entities

## Notes

1. All timestamps use TIMESTAMP type for consistency
2. UUIDs are used for most IDs except assets and complaints which use custom formats
3. Foreign keys have ON DELETE CASCADE where appropriate
4. Indexes are created on frequently queried columns
5. CHECK constraints ensure data integrity
6. JSONB is used for flexible data storage (changes in audit_logs)

