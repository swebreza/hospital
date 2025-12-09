// Certificate Upload API route

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const calibrationId = formData.get('calibrationId') as string

    if (!file || !calibrationId) {
      return NextResponse.json(
        { success: false, error: 'File and calibration ID required' },
        { status: 400 }
      )
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'public', 'uploads', 'certificates')
    await mkdir(uploadsDir, { recursive: true })

    // Generate unique filename
    const timestamp = Date.now()
    const filename = `${calibrationId}-${timestamp}-${file.name}`
    const filepath = join(uploadsDir, filename)

    // Save file
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filepath, buffer)

    // Update calibration with certificate URL
    const fileUrl = `/uploads/certificates/${filename}`
    const calibration = await prisma.calibration.update({
      where: { id: calibrationId },
      data: { certificateUrl: fileUrl },
    })

    // Also create document record
    await prisma.document.create({
      data: {
        entityType: 'calibration',
        entityId: calibrationId,
        documentType: 'certificate',
        fileName: file.name,
        fileUrl,
        fileSize: BigInt(buffer.length),
        mimeType: file.type,
      },
    })

    return NextResponse.json({
      success: true,
      data: { url: fileUrl, calibration },
    })
  } catch (error: any) {
    console.error('Error uploading certificate:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to upload certificate' },
      { status: 500 }
    )
  }
}

