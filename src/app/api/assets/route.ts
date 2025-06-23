import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { logAssetActivity } from '@/lib/activity-log'
import { z } from 'zod'

// Asset creation schema
const createAssetSchema = z.object({
  asset_tag: z.string().min(1, 'Asset tag is required'),
  serial_number: z.string().optional(),
  model_id: z.number().int().positive('Valid model ID is required'),
  status_id: z.number().int().positive('Valid status ID is required'),
  assigned_to_user_id: z.number().int().positive().optional(),
  location_id: z.number().int().positive().optional(),
  department_id: z.number().int().positive().optional(),
  supplier_id: z.number().int().positive().optional(),
  purchase_date: z.string().datetime().optional(),
  purchase_cost: z.number().optional(),
  warranty_expiry_date: z.string().datetime().optional(),
  notes: z.string().optional(),
  external_ticket_id: z.string().min(1, 'External ticket ID is required'),
  user_id: z.number().int().positive('User ID is required for audit trail'),
})

// GET /api/assets - List assets with pagination and filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const status = searchParams.get('status')
    const category = searchParams.get('category')
    const assigned_to = searchParams.get('assigned_to')
    const search = searchParams.get('search')

    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}
    if (status) where.status = { name: status }
    if (assigned_to) where.assigned_to_user_id = parseInt(assigned_to)
    if (search) {
      where.OR = [
        { asset_tag: { contains: search, mode: 'insensitive' } },
        { serial_number: { contains: search, mode: 'insensitive' } },
        { model: { name: { contains: search, mode: 'insensitive' } } },
      ]
    }

    const [assets, total] = await Promise.all([
      prisma.asset.findMany({
        where,
        include: {
          model: {
            include: {
              manufacturer: true,
              category: true,
            },
          },
          status: true,
          assigned_to_user: {
            select: {
              id: true,
              first_name: true,
              last_name: true,
              email: true,
            },
          },
          location: true,
          department: true,
        },
        orderBy: {
          created_at: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.asset.count({ where }),
    ])

    return NextResponse.json({
      success: true,
      data: assets,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Failed to fetch assets:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch assets' },
      { status: 500 }
    )
  }
}

// POST /api/assets - Create new asset
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = createAssetSchema.parse(body)

    const { external_ticket_id, user_id, ...assetData } = validatedData

    // Convert date strings to Date objects
    const processedData = {
      ...assetData,
      purchase_date: assetData.purchase_date ? new Date(assetData.purchase_date) : undefined,
      warranty_expiry_date: assetData.warranty_expiry_date ? new Date(assetData.warranty_expiry_date) : undefined,
    }

    // Create asset
    const asset = await prisma.asset.create({
      data: processedData,
      include: {
        model: {
          include: {
            manufacturer: true,
            category: true,
          },
        },
        status: true,
        assigned_to_user: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
          },
        },
        location: true,
        department: true,
      },
    })

    // Log the activity
    await logAssetActivity.create(user_id, asset.id, external_ticket_id, {
      asset_tag: asset.asset_tag,
      model: asset.model.name,
      manufacturer: asset.model.manufacturer.name,
    })

    return NextResponse.json({
      success: true,
      data: asset,
      message: 'Asset created successfully',
    }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Failed to create asset:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create asset' },
      { status: 500 }
    )
  }
} 