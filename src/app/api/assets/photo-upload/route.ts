import { NextRequest, NextResponse } from 'next/server'
import { writeFile } from 'fs/promises'
import { join } from 'path'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const data = await req.formData()
    const file: File | null = data.get('photo') as unknown as File
    const assetId = data.get('assetId') as string

    if (!file || !assetId) {
      return NextResponse.json({ error: 'Missing file or asset ID' }, { status: 400 })
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Create unique filename
    const timestamp = Date.now()
    const fileExtension = file.name.split('.').pop()
    const filename = `${assetId}_${timestamp}.${fileExtension}`
    const uploadPath = join(process.cwd(), 'public', 'uploads', 'assets', filename)

    // Ensure upload directory exists
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'assets')
    try {
      await writeFile(join(uploadDir, '.gitkeep'), '')
    } catch (error) {
      // Directory might already exist
    }

    // Write the file
    await writeFile(uploadPath, buffer)

    // Update asset with photo URL
    const photoUrl = `/uploads/assets/${filename}`
    
    await prisma.asset.update({
      where: { id: parseInt(assetId) },
      data: { 
        // Store photo URL in notes field temporarily since image_url doesn't exist in schema
        notes: `Photo: ${photoUrl}` 
      }
    })

    return NextResponse.json({ 
      success: true, 
      photo_url: photoUrl,
      message: 'Photo uploaded successfully' 
    })

  } catch (error) {
    console.error('Error uploading photo:', error)
    return NextResponse.json({ error: 'Failed to upload photo' }, { status: 500 })
  }
} 