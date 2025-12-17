// Bulk Certificate Upload API route

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const files = formData.getAll('files') as File[]
    const mappingJson = formData.get('mapping') as string

    if (!files || files.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Files required' },
        { status: 400 }
      )
    }

    const mapping = mappingJson ? JSON.parse(mappingJson) : {}
    const uploadsDir = join(process.cwd(), 'public', 'uploads', 'certificates')
    await mkdir(uploadsDir, { recursive: true })

    let successCount = 0
    let failedCount = 0

    for (const file of files) {
      try {
        // Try to find calibration by filename or mapping
        let calibrationId: string | null = null

        // Check mapping first
        if (mapping[file.name]) {
          calibrationId = mapping[file.name]
        } else {
          // Try to extract from filename (e.g., "CAL-001-certificate.pdf")
          const filenameMatch = file.name.match(/(CAL-\d+)/i)
          if (filenameMatch) {
            const calId = filenameMatch[1]
            const calibration = await prisma.calibration.findFirst({
              where: { id: { contains: calId } },
            })
            if (calibration) {
              calibrationId = calibration.id
            }
          }
        }

        if (!calibrationId) {
          failedCount++
          continue
        }

        // Save file
        const timestamp = Date.now()
        const filename = `${calibrationId}-${timestamp}-${file.name}`
        const filepath = join(uploadsDir, filename)

        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)
        await writeFile(filepath, buffer)

        // Update calibration
        const fileUrl = `/uploads/certificates/${filename}`
        await prisma.calibration.update({
          where: { id: calibrationId },
          data: { certificateUrl: fileUrl },
        })

        // Create document record
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

        successCount++
      } catch (error) {
        console.error(`Error processing file ${file.name}:`, error)
        failedCount++
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        success: successCount,
        failed: failedCount,
      },
    })
  } catch (error: any) {
    console.error('Error bulk uploading certificates:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to bulk upload certificates' },
      { status: 500 }
    )
  }
}







