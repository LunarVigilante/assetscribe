import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params
    const locationId = parseInt(id)

    // Check if location is in use
    const usage = await prisma.location.findUnique({
      where: { id: locationId },
      include: {
        _count: {
          select: {
            users: true,
            assets: true,
            child_locations: true
          }
        }
      }
    })

    if (!usage) {
      return NextResponse.json(
        { error: 'Location not found' },
        { status: 404 }
      )
    }

    if (usage._count.users > 0 || usage._count.assets > 0 || usage._count.child_locations > 0) {
      return NextResponse.json(
        { error: `Cannot delete location. It has ${usage._count.users} users, ${usage._count.assets} assets, and ${usage._count.child_locations} child locations.` },
        { status: 400 }
      )
    }

    await prisma.location.delete({
      where: { id: locationId }
    })

    return NextResponse.json({
      success: true,
      message: 'Location deleted successfully'
    })
  } catch (error) {
    console.error('Failed to delete location:', error)
    return NextResponse.json(
      { error: 'Failed to delete location' },
      { status: 500 }
    )
  }
} 