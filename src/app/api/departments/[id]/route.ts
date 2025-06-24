import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params
    const departmentId = parseInt(id)

    // Check if department is in use
    const usage = await prisma.department.findUnique({
      where: { id: departmentId },
      include: {
        _count: {
          select: {
            users: true,
            assets: true
          }
        }
      }
    })

    if (!usage) {
      return NextResponse.json(
        { error: 'Department not found' },
        { status: 404 }
      )
    }

    if (usage._count.users > 0 || usage._count.assets > 0) {
      return NextResponse.json(
        { error: `Cannot delete department. It has ${usage._count.users} users and ${usage._count.assets} assets assigned.` },
        { status: 400 }
      )
    }

    await prisma.department.delete({
      where: { id: departmentId }
    })

    return NextResponse.json({
      success: true,
      message: 'Department deleted successfully'
    })
  } catch (error) {
    console.error('Failed to delete department:', error)
    return NextResponse.json(
      { error: 'Failed to delete department' },
      { status: 500 }
    )
  }
} 