import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const models = await prisma.assetModel.findMany({
      include: {
        manufacturer: {
          select: { name: true }
        },
        category: {
          select: { name: true }
        }
      },
      orderBy: [
        { manufacturer: { name: 'asc' } },
        { name: 'asc' }
      ]
    })

    const transformedModels = models.map(model => ({
      id: model.id,
      name: model.name,
      manufacturer: model.manufacturer.name,
      category: model.category.name,
      photo_url: model.image_url
    }))

    return NextResponse.json(transformedModels)
  } catch (error) {
    console.error('Failed to fetch models:', error)
    return NextResponse.json(
      { error: 'Failed to fetch models' },
      { status: 500 }
    )
  }
} 