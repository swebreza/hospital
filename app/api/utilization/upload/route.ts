import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db/mongodb'
import { uploadCSVUtilization } from '@/lib/services/utilization'
import { validateCSVFile } from '@/lib/utils/csvParser'

export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const formData = await request.formData()
    const file = formData.get('file') as File
    const uploadedBy = formData.get('uploadedBy') as string

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'File is required' },
        { status: 400 }
      )
    }

    if (!uploadedBy) {
      return NextResponse.json(
        { success: false, error: 'uploadedBy is required' },
        { status: 400 }
      )
    }

    // Validate file
    const validation = validateCSVFile(file)
    if (!validation.valid) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 }
      )
    }

    // Upload and process CSV
    const result = await uploadCSVUtilization(file, uploadedBy)

    return NextResponse.json({
      success: result.success,
      data: {
        uploadId: result.uploadId,
        successCount: result.successCount,
        errorCount: result.errorCount,
        errors: result.errors,
      },
      message: result.success
        ? `Successfully uploaded ${result.successCount} records`
        : `Uploaded ${result.successCount} records with ${result.errorCount} errors`,
    })
  } catch (error: unknown) {
    console.error('Error uploading CSV:', error)
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : 'Failed to upload CSV',
      },
      { status: 500 }
    )
  }
}

