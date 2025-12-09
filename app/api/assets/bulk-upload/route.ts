import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db/mongodb'
import { bulkUploadAssets, parseCSV } from '@/lib/services/bulkUpload'

export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate file type
    if (!file.name.toLowerCase().endsWith('.csv') && file.type !== 'text/csv') {
      return NextResponse.json(
        { success: false, error: 'File must be a CSV file' },
        { status: 400 }
      )
    }

    // Read file content
    const text = await file.text()

    if (!text || text.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'File is empty' },
        { status: 400 }
      )
    }

    // Parse CSV
    const csvData = parseCSV(text)

    if (csvData.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No data found in CSV file. Please check the file format.' },
        { status: 400 }
      )
    }

    // Get options from form data
    const skipDuplicates = formData.get('skipDuplicates') === 'true'
    const validateOnly = formData.get('validateOnly') === 'true'

    // Perform bulk upload
    const result = await bulkUploadAssets(csvData, {
      skipDuplicates,
      validateOnly,
    })

    return NextResponse.json({
      success: true, // Always return success: true, check result.successful > 0
      data: result,
    })
  } catch (error: unknown) {
    console.error('Error in bulk upload:', error)
    const err = error as { message?: string; stack?: string }
    return NextResponse.json(
      { 
        success: false, 
        error: err.message || 'Failed to process bulk upload',
        details: process.env.NODE_ENV === 'development' ? err.stack : undefined
      },
      { status: 500 }
    )
  }
}

