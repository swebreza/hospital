# Serial Number Duplicate Error - Comprehensive Fix

## Problem
Assets were being created with `serialNumber: "null"` (as a string) or `null`, causing MongoDB duplicate key errors because the unique index on `serialNumber` was seeing multiple assets with the same invalid value.

## Root Causes
1. **Frontend**: Sending empty string `""` for serialNumber when field is empty
2. **API**: Not properly cleaning null/empty/"null" string values before saving
3. **Existing Data**: Production database already had assets with `serialNumber: "null"` or `null`
4. **Bulk Upload**: Not cleaning serialNumber values during bulk import
5. **Update Endpoint**: Not cleaning serialNumber when updating assets

## Solution - Multi-Layer Defense

### Layer 1: Frontend (AddAssetModal.tsx)
- **Fixed**: Frontend now never sends `serialNumber` if it's empty/null
- **Location**: `components/Assets/AddAssetModal.tsx`
- **Change**: Only includes `serialNumber` in request if it has a valid, non-empty value

### Layer 2: API POST Endpoint (route.ts)
- **Fixed**: Comprehensive cleaning of serialNumber before creating asset
- **Location**: `app/api/assets/route.ts`
- **Change**: Multi-layer validation that removes null, empty, "null", "undefined", "none", "n/a", "na" values

### Layer 3: API PUT Endpoint (update)
- **Fixed**: Cleans serialNumber before updating asset
- **Location**: `app/api/assets/[id]/route.ts`
- **Change**: Same cleaning logic as POST endpoint

### Layer 4: Bulk Upload Service
- **Fixed**: Normalizes and cleans serialNumber during bulk import
- **Location**: `lib/services/bulkUpload.ts`
- **Change**: Two-stage cleaning (during normalization and before saving)

### Layer 5: Mongoose Pre-Save Hook (FINAL DEFENSE)
- **Fixed**: Ultimate cleanup before document is saved to database
- **Location**: `lib/models/Asset.ts`
- **Change**: Catches any remaining invalid values and removes them

### Layer 6: Database Cleanup
- **Created**: Script to clean existing bad data in production
- **Location**: 
  - `lib/scripts/cleanup-serial-numbers.ts` (standalone script)
  - `app/api/assets/cleanup-serial-numbers/route.ts` (API endpoint)

## How to Fix Production Database

### Option 1: Use API Endpoint (Recommended)
1. Make a POST request to `/api/assets/cleanup-serial-numbers`
2. Requires `full_access` role
3. Returns cleanup statistics

### Option 2: Run Standalone Script
```bash
npx ts-node lib/scripts/cleanup-serial-numbers.ts
```

## Testing
1. ✅ Frontend form with empty serialNumber → Should not send field
2. ✅ Frontend form with "null" string → Should be cleaned
3. ✅ API POST with null/empty/"null" → Should be cleaned
4. ✅ API PUT with invalid serialNumber → Should be cleaned
5. ✅ Bulk upload with invalid serialNumbers → Should be cleaned
6. ✅ Pre-save hook → Final cleanup before database save

## Prevention
- All entry points now clean serialNumber values
- Multiple layers ensure no invalid values reach the database
- Pre-save hook is the final safety net

## Notes
- Serial number is **optional** - assets can exist without it
- The unique index on `serialNumber` is **sparse**, meaning it only enforces uniqueness for non-null values
- Invalid values (null, "null", empty) are removed, not stored

