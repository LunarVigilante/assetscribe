import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const departments = await prisma.department.findMany({
      select: {
        id: true,
        name: true,
        created_at: true,
        _count: {
          select: {
            users: true,
            assets: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    })

    return NextResponse.json(departments)
  } catch (error) {
    console.error('Failed to fetch departments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch departments' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name } = body

    if (!name) {
      return NextResponse.json(
        { error: 'Department name is required' },
        { status: 400 }
      )
    }

    const department = await prisma.department.create({
      data: {
        name: name.trim()
      }
    })

    return NextResponse.json({
      success: true,
      department
    })
  } catch (error: any) {
    console.error('Failed to create department:', error)
    
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Department name already exists' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create department' },
      { status: 500 }
    )
  }
} 