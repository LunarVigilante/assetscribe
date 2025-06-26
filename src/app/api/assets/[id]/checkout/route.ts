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
    const { action, user_id, department_id, location_id, performed_by_user_id = 1 } = body

    const assetId = parseInt(id)

    // Get status IDs
    const deployedStatus = await prisma.statusLabel.findFirst({ where: { name: 'Deployed' } })
    const inStockStatus = await prisma.statusLabel.findFirst({ where: { name: 'In-Stock' } })

    if (!deployedStatus || !inStockStatus) {
      throw new Error('Required status labels not found')
    }

    // Get the user performing the action for audit logging
    const performingUser = await prisma.user.findUnique({
      where: { id: performed_by_user_id },
      select: { id: true, first_name: true, last_name: true }
    })

    if (!performingUser) {
      return NextResponse.json({ error: 'Performing user not found' }, { status: 400 })
    }

    switch (action) {
      case 'check_out':
        // Get user/department details for logging
        let assignedToName = 'Unknown'
        if (user_id) {
          const assignedUser = await prisma.user.findUnique({
            where: { id: parseInt(user_id) },
            select: { first_name: true, last_name: true }
          })
          if (assignedUser) {
            assignedToName = `${assignedUser.first_name} ${assignedUser.last_name}`
          }
        } else if (department_id) {
          const assignedDepartment = await prisma.department.findUnique({
            where: { id: parseInt(department_id) },
            select: { name: true }
          })
          if (assignedDepartment) {
            assignedToName = assignedDepartment.name
          }
        }

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
        
        // Log the activity with actual performing user
        await prisma.activityLog.create({
          data: {
            user_id: performingUser.id,
            action_type: 'ASSET_CHECKOUT',
            target_id: assetId,
            target_type: 'Asset',
            details: {
              action: 'checked_out',
              asset_tag: (await prisma.asset.findUnique({ where: { id: assetId }, select: { asset_tag: true } }))?.asset_tag,
              assigned_to_name: assignedToName,
              assigned_to: user_id ? `user_${user_id}` : `department_${department_id}`,
              performed_by: `${performingUser.first_name} ${performingUser.last_name}`
            },
            external_ticket_id: `AUTO-${Date.now()}`, // Auto-generated ticket ID
            timestamp: new Date()
          }
        })
        
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
        
        // Log the activity with actual performing user
        await prisma.activityLog.create({
          data: {
            user_id: performingUser.id,
            action_type: 'ASSET_CHECKIN',
            target_id: assetId,
            target_type: 'Asset',
            details: {
              action: 'checked_in',
              asset_tag: (await prisma.asset.findUnique({ where: { id: assetId }, select: { asset_tag: true } }))?.asset_tag,
              note: 'Asset returned to inventory',
              performed_by: `${performingUser.first_name} ${performingUser.last_name}`
            },
            external_ticket_id: `AUTO-${Date.now()}`, // Auto-generated ticket ID
            timestamp: new Date()
          }
        })
        
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

        // Get the new assignment details for proper logging
        const newAssignedToName = user_id 
          ? await prisma.user.findUnique({
              where: { id: parseInt(user_id) },
              select: { first_name: true, last_name: true }
            }).then(u => u ? `${u.first_name} ${u.last_name}` : 'Unknown User')
          : department_id 
            ? await prisma.department.findUnique({
                where: { id: parseInt(department_id) },
                select: { name: true }
              }).then(d => d?.name || 'Unknown Department')
            : 'Unassigned'

        // Log the activity with actual performing user
        await prisma.activityLog.create({
          data: {
            user_id: performingUser.id,
            action_type: 'ASSET_TRANSFER',
            target_id: assetId,
            target_type: 'Asset',
            details: {
              action: 'transferred',
              asset_tag: currentAsset.asset_tag,
              from: fromDetails,
              to: newAssignedToName,
              performed_by: `${performingUser.first_name} ${performingUser.last_name}`
            },
            external_ticket_id: `AUTO-${Date.now()}`, // Auto-generated ticket ID
            timestamp: new Date()
          }
        })
        
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