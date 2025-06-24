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
    const { id } = await params
    const body = await request.json()
    const { action, user_id, department_id, location_id } = body

    const assetId = parseInt(id)

    // Get status IDs
    const deployedStatus = await prisma.statusLabel.findFirst({ where: { name: 'Deployed' } })
    const inStockStatus = await prisma.statusLabel.findFirst({ where: { name: 'In-Stock' } })

    if (!deployedStatus || !inStockStatus) {
      throw new Error('Required status labels not found')
    }

    switch (action) {
      case 'check_out':
        // Check out asset to user/department
        await prisma.asset.update({
          where: { id: assetId },
          data: {
            assigned_to_user_id: user_id ? parseInt(user_id) : null,
            department_id: department_id ? parseInt(department_id) : null,
            location_id: location_id ? parseInt(location_id) : null,
            status_id: deployedStatus.id,
            updated_at: new Date()
          }
        })
        
        // Log the activity (find first available user or skip if none exist)
        const firstUser = await prisma.user.findFirst({ select: { id: true } })
        if (firstUser) {
          await prisma.activityLog.create({
            data: {
              user_id: firstUser.id,
              action_type: 'ASSET_CHECKOUT',
              target_id: assetId,
              target_type: 'Asset',
              details: {
                action: 'checked_out',
                asset_tag: (await prisma.asset.findUnique({ where: { id: assetId }, select: { asset_tag: true } }))?.asset_tag,
                assigned_to: user_id ? `user_${user_id}` : `department_${department_id}`
              },
              external_ticket_id: `AUTO-${Date.now()}`, // Auto-generated ticket ID
              timestamp: new Date()
            }
          })
        }
        
        return NextResponse.json({ 
          success: true, 
          message: 'Asset checked out successfully' 
        })

      case 'check_in':
        // Check in asset (unassign)
        await prisma.asset.update({
          where: { id: assetId },
          data: {
            assigned_to_user_id: null,
            department_id: null,
            // Keep location for inventory tracking
            status_id: inStockStatus.id,
            updated_at: new Date()
          }
        })
        
        // Log the activity (find first available user or skip if none exist)
        const firstUserForCheckin = await prisma.user.findFirst({ select: { id: true } })
        if (firstUserForCheckin) {
          await prisma.activityLog.create({
            data: {
              user_id: firstUserForCheckin.id,
              action_type: 'ASSET_CHECKIN',
              target_id: assetId,
              target_type: 'Asset',
              details: {
                action: 'checked_in',
                asset_tag: (await prisma.asset.findUnique({ where: { id: assetId }, select: { asset_tag: true } }))?.asset_tag,
                note: 'Asset returned to inventory'
              },
              external_ticket_id: `AUTO-${Date.now()}`, // Auto-generated ticket ID
              timestamp: new Date()
            }
          })
        }
        
        return NextResponse.json({ 
          success: true, 
          message: 'Asset checked in successfully' 
        })

      case 'transfer':
        // Get current asset to understand what we're transferring from
        const currentAsset = await prisma.asset.findUnique({
          where: { id: assetId },
          include: {
            assigned_to_user: true,
            department: true
          }
        })

        if (!currentAsset) {
          return NextResponse.json({ error: 'Asset not found' }, { status: 404 })
        }

        // Transfer asset to new user/department
        await prisma.asset.update({
          where: { id: assetId },
          data: {
            assigned_to_user_id: user_id ? parseInt(user_id) : null,
            department_id: department_id ? parseInt(department_id) : null,
            location_id: location_id ? parseInt(location_id) : null,
            updated_at: new Date()
          }
        })
        
        // Log the activity with more details
        const fromDetails = currentAsset.assigned_to_user 
          ? `${currentAsset.assigned_to_user.first_name} ${currentAsset.assigned_to_user.last_name}`
          : currentAsset.department?.name || 'Unassigned'
        const toDetails = user_id 
          ? `user ID ${user_id}` 
          : department_id 
            ? `department ID ${department_id}`
            : 'Unassigned'

        // Log the activity (find first available user or skip if none exist)
        const firstUserForTransfer = await prisma.user.findFirst({ select: { id: true } })
        if (firstUserForTransfer) {
          await prisma.activityLog.create({
            data: {
              user_id: firstUserForTransfer.id,
              action_type: 'ASSET_TRANSFER',
              target_id: assetId,
              target_type: 'Asset',
              details: {
                action: 'transferred',
                asset_tag: currentAsset.asset_tag,
                from: fromDetails,
                to: toDetails
              },
              external_ticket_id: `AUTO-${Date.now()}`, // Auto-generated ticket ID
              timestamp: new Date()
            }
          })
        }
        
        return NextResponse.json({ 
          success: true, 
          message: 'Asset transferred successfully' 
        })

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Asset operation failed:', error)
    return NextResponse.json(
      { error: 'Operation failed' },
      { status: 500 }
    )
  }
}