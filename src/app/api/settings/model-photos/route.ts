import { NextRequest, NextResponse } from 'next/server'
import { writeFile } from 'fs/promises'
import { join } from 'path'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const photo = formData.get('photo') as File
    const modelId = formData.get('modelId') as string

    if (!photo || !modelId) {
      return NextResponse.json(
        { error: 'Photo and model ID are required' },
        { status: 400 }
      )
    }

    // Validate file type
    if (!photo.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'Only image files are allowed' },
        { status: 400 }
      )
    }

    // Validate file size (5MB max)
    if (photo.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size must be less than 5MB' },
        { status: 400 }
      )
    }

    // Generate unique filename
    const fileExtension = photo.name.split('.').pop() || 'jpg'
    const fileName = `${modelId}_${Date.now()}.${fileExtension}`
    const photoUrl = `/uploads/models/${fileName}`

    // Convert file to buffer and save to filesystem
    const bytes = await photo.arrayBuffer()
    const buffer = Buffer.from(bytes)
    
    // Save to public/uploads/models directory
    const filePath = join(process.cwd(), 'public', 'uploads', 'models', fileName)
    await writeFile(filePath, buffer)

    // Update the asset model with the new photo URL
    const updatedModel = await prisma.assetModel.update({
      where: {
        id: parseInt(modelId)
      },
      data: {
        image_url: photoUrl
      }
    })

    return NextResponse.json({
      success: true,
      photo_url: photoUrl,
      message: 'Photo uploaded successfully'
    })
  } catch (error) {
    console.error('Failed to upload photo:', error)
    return NextResponse.json(
      { error: 'Failed to upload photo' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const modelId = searchParams.get('modelId')

    if (!modelId) {
      return NextResponse.json(
        { error: 'Model ID is required' },
        { status: 400 }
      )
    }

    // Update the asset model to remove the photo URL
    await prisma.assetModel.update({
      where: {
        id: parseInt(modelId)
      },
      data: {
        image_url: null
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Photo removed successfully'
    })
  } catch (error) {
    console.error('Failed to remove photo:', error)
    return NextResponse.json(
      { error: 'Failed to remove photo' },
      { status: 500 }
    )
  }
} 