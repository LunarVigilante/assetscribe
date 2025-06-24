import { NextRequest, NextResponse } from 'next/server'
import { writeFile, unlink } from 'fs/promises'
import { join } from 'path'
import { existsSync, mkdirSync } from 'fs'

export async function POST(req: NextRequest) {
  try {
    const data = await req.formData()
    const file: File | null = data.get('photo') as unknown as File
    const categoryId = data.get('categoryId') as string
    const categoryName = data.get('categoryName') as string

    if (!file || !categoryId || !categoryName) {
      return NextResponse.json({ error: 'Missing file, category ID, or category name' }, { status: 400 })
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Create the stock photos directory if it doesn't exist
    const stockPhotosDir = join(process.cwd(), 'public', 'stock-photos', 'categories')
    if (!existsSync(stockPhotosDir)) {
      mkdirSync(stockPhotosDir, { recursive: true })
    }

    // Create filename based on category name (lowercase, replace spaces with hyphens)
    const fileExtension = file.name.split('.').pop()
    const sanitizedName = categoryName.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-')
    const filename = `${sanitizedName}.${fileExtension}`
    const uploadPath = join(stockPhotosDir, filename)

    // Write the file
    await writeFile(uploadPath, buffer)

    // Return the public URL
    const photoUrl = `/stock-photos/categories/${filename}`

    return NextResponse.json({ 
      success: true, 
      photoUrl,
      message: `Stock photo uploaded for ${categoryName}` 
    })

  } catch (error: any) {
    console.error('Error uploading category photo:', error)
    return NextResponse.json({ 
      error: 'Failed to upload photo',
      details: error.message 
    }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const categoryName = searchParams.get('categoryName')

    if (!categoryName) {
      return NextResponse.json({ error: 'Missing category name' }, { status: 400 })
    }

    // Find and delete the existing photo
    const stockPhotosDir = join(process.cwd(), 'public', 'stock-photos', 'categories')
    const sanitizedName = categoryName.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-')
    
    // Check for common image extensions
    const extensions = ['jpg', 'jpeg', 'png', 'webp']
    let deleted = false

    for (const ext of extensions) {
      const filePath = join(stockPhotosDir, `${sanitizedName}.${ext}`)
      if (existsSync(filePath)) {
        await unlink(filePath)
        deleted = true
        break
      }
    }

    if (deleted) {
      return NextResponse.json({ 
        success: true, 
        message: `Stock photo removed for ${categoryName}` 
      })
    } else {
      return NextResponse.json({ 
        error: 'No stock photo found to delete' 
      }, { status: 404 })
    }

  } catch (error: any) {
    console.error('Error deleting category photo:', error)
    return NextResponse.json({ 
      error: 'Failed to delete photo',
      details: error.message 
    }, { status: 500 })
  }
} 