import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const locations = await prisma.location.findMany({
      select: {
        id: true,
        name: true,
        parent_location_id: true,
        created_at: true,
        parent_location: {
          select: {
            name: true
          }
        },
        _count: {
          select: {
            users: true,
            assets: true,
            child_locations: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    })

    return NextResponse.json(locations)
  } catch (error) {
    console.error('Failed to fetch locations:', error)
    return NextResponse.json(
      { error: 'Failed to fetch locations' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, parent_location_id } = body

    if (!name) {
      return NextResponse.json(
        { error: 'Location name is required' },
        { status: 400 }
      )
    }

    const location = await prisma.location.create({
      data: {
        name: name.trim(),
        parent_location_id: parent_location_id ? parseInt(parent_location_id) : null
      }
    })

    return NextResponse.json({
      success: true,
      location
    })
  } catch (error: any) {
    console.error('Failed to create location:', error)
    
    return NextResponse.json(
      { error: 'Failed to create location' },
      { status: 500 }
    )
  }
} 