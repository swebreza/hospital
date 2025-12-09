import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db/mongodb'
import Contract from '@/lib/models/Contract'
import { Types } from 'mongoose'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB()
    const { id } = await params

    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid contract ID' },
        { status: 400 }
      )
    }

    const contract = await Contract.findById(id)

    if (!contract) {
      return NextResponse.json(
        { success: false, error: 'Contract not found' },
        { status: 404 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      )
    }

    // In a production environment, you would upload to cloud storage (S3, Cloudinary, etc.)
    // For now, we'll store the file metadata and return a placeholder URL
    // In production, replace this with actual file upload logic

    const fileBuffer = await file.arrayBuffer()
    const fileName = file.name
    const fileSize = file.size
    const mimeType = file.type

    // TODO: Upload to cloud storage (S3, Cloudinary, etc.)
    // For now, we'll use a placeholder approach
    // In production, implement actual file upload:
    // const uploadResult = await uploadToCloudStorage(fileBuffer, fileName)
    // const fileUrl = uploadResult.url

    // Placeholder: Store file metadata
    // In production, replace with actual cloud storage URL
    const fileUrl = `/api/files/contracts/${id}/${fileName}`

    // Add document to contract
    if (!contract.documents) {
      contract.documents = []
    }
    contract.documents.push(fileUrl)
    await contract.save()

    return NextResponse.json({
      success: true,
      data: {
        url: fileUrl,
        fileName,
        fileSize,
        mimeType,
      },
    })
  } catch (error) {
    console.error('Error uploading document:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to upload document' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB()
    const { id } = await params

    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid contract ID' },
        { status: 400 }
      )
    }

    const contract = await Contract.findById(id).select('documents').lean()

    if (!contract) {
      return NextResponse.json(
        { success: false, error: 'Contract not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: contract.documents || [],
    })
  } catch (error) {
    console.error('Error fetching documents:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch documents' },
      { status: 500 }
    )
  }
}

