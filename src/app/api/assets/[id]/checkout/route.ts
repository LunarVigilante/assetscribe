import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { logAssetActivity } from '@/lib/activity-log'
import { z } from 'zod'

const checkoutSchema = z.object({
  assigned_to_user_id: z.number().int().positive('Valid user ID is required'),
  external_ticket_id: z.string().min(1, 'External ticket ID is required'),
  user_id: z.number().int().positive('User ID is required for audit trail'),
  notes: z.string().optional(),
})

// POST /api/assets/[id]/checkout - Check out asset to user
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const assetId = parseInt(params.id)
    const body = await request.json()
    const validatedData = checkoutSchema.parse(body)

    const { assigned_to_user_id, external_ticket_id, user_id, notes } = validatedData

    // Check if asset exists and is available
    const asset = await prisma.asset.findUnique({
      where: { id: assetId },
      include: {
        model: {
          include: {
            manufacturer: true,
          },
        },
        status: true,
        assigned_to_user: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
          },
        },
      },
    })

    if (!asset) {
      return NextResponse.json(
        { success: false, error: 'Asset not found' },
        { status: 404 }
      )
    }

    if (asset.assigned_to_user_id) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Asset is already checked out',
          assigned_to: asset.assigned_to_user 
        },
        { status: 400 }
      )
    }

    // Get the user being assigned to
    const assignedUser = await prisma.user.findUnique({
      where: { id: assigned_to_user_id },
      select: {
        id: true,
        first_name: true,
        last_name: true,
        email: true,
        is_active: true,
      },
    })

    if (!assignedUser) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    if (!assignedUser.is_active) {
      return NextResponse.json(
        { success: false, error: 'Cannot assign asset to inactive user' },
        { status: 400 }
      )
    }

    // Update asset with checkout information
    const updatedAsset = await prisma.asset.update({
      where: { id: assetId },
      data: {
        assigned_to_user_id,
        notes: notes ? `${asset.notes || ''}\n[Checkout] ${notes}`.trim() : asset.notes,
        updated_at: new Date(),
      },
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

    // Log the checkout activity
    await logAssetActivity.checkout(user_id, assetId, external_ticket_id, {
      asset_tag: asset.asset_tag,
      model: asset.model.name,
      manufacturer: asset.model.manufacturer.name,
      assigned_to: {
        id: assignedUser.id,
        name: `${assignedUser.first_name} ${assignedUser.last_name}`,
        email: assignedUser.email,
      },
      notes: notes,
    })

    return NextResponse.json({
      success: true,
      data: updatedAsset,
      message: `Asset ${asset.asset_tag} checked out to ${assignedUser.first_name} ${assignedUser.last_name}`,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Failed to checkout asset:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to checkout asset' },
      { status: 500 }
    )
  }
}