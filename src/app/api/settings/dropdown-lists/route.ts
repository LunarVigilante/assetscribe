import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Fetch all dropdown lists in parallel
    const [
      manufacturers,
      categories,
      suppliers,
      departments,
      locations,
      statusLabels,
      assetConditions,
      maintenanceSchedules,
      depreciationMethods
    ] = await Promise.all([
      prisma.manufacturer.findMany({
        select: { id: true, name: true },
        orderBy: { name: 'asc' }
      }),
      prisma.category.findMany({
        select: { id: true, name: true },
        orderBy: { name: 'asc' }
      }),
      prisma.supplier.findMany({
        select: { id: true, name: true },
        orderBy: { name: 'asc' }
      }),
      prisma.department.findMany({
        select: { id: true, name: true },
        orderBy: { name: 'asc' }
      }),
      prisma.location.findMany({
        select: { id: true, name: true },
        orderBy: { name: 'asc' }
      }),
      prisma.statusLabel.findMany({
        select: { id: true, name: true, color: true },
        orderBy: { name: 'asc' }
      }),
      prisma.assetCondition.findMany({
        select: { id: true, name: true },
        orderBy: { name: 'asc' }
      }),
      prisma.maintenanceSchedule.findMany({
        select: { id: true, name: true },
        orderBy: { name: 'asc' }
      }),
      prisma.depreciationMethod.findMany({
        select: { id: true, name: true },
        orderBy: { name: 'asc' }
      })
    ])

    return NextResponse.json({
      manufacturers,
      categories,
      suppliers: suppliers, // vendors
      departments,
      locations,
      statusLabels,
      assetConditions,
      maintenanceSchedules,
      depreciationMethods
    })
  } catch (error) {
    console.error('Failed to fetch dropdown lists:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dropdown lists' },
      { status: 500 }
    )
  }
}

// POST route to add new items to any list
export async function POST(request: Request) {
  try {
    const { listType, name, description } = await request.json()

    if (!listType || !name) {
      return NextResponse.json(
        { error: 'List type and name are required' },
        { status: 400 }
      )
    }

    let result

    switch (listType) {
      case 'manufacturers':
        result = await prisma.manufacturer.create({ 
          data: { name: name.trim() }
        })
        break
      case 'categories':
        result = await prisma.category.create({ 
          data: { name: name.trim() }
        })
        break
      case 'suppliers':
        result = await prisma.supplier.create({ 
          data: { name: name.trim() }
        })
        break
      case 'departments':
        result = await prisma.department.create({ 
          data: { name: name.trim() }
        })
        break
      case 'locations':
        result = await prisma.location.create({ 
          data: { name: name.trim() }
        })
        break
      case 'statusLabels':
        result = await prisma.statusLabel.create({ 
          data: { name: name.trim() }
        })
        break
      case 'assetConditions':
        result = await prisma.assetCondition.create({ 
          data: { 
            name: name.trim(), 
            description: description || null 
          }
        })
        break
      case 'maintenanceSchedules':
        result = await prisma.maintenanceSchedule.create({ 
          data: { 
            name: name.trim(), 
            description: description || null 
          }
        })
        break
      case 'depreciationMethods':
        result = await prisma.depreciationMethod.create({ 
          data: { 
            name: name.trim(), 
            description: description || null 
          }
        })
        break
      default:
        return NextResponse.json(
          { error: 'Invalid list type' },
          { status: 400 }
        )
    }

    return NextResponse.json(result)
  } catch (error: any) {
    console.error('Failed to add item:', error)
    
    // Handle unique constraint violations
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: `This name already exists. Please choose a different name.` },
        { status: 409 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to add item. Please try again.' },
      { status: 500 }
    )
  }
} 