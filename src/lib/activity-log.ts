import { prisma } from './prisma'
import { ActivityLogEntry } from '@/types'

// Activity log action types
export const ACTIVITY_ACTIONS = {
  // User actions
  USER_CREATE: 'USER_CREATE',
  USER_UPDATE: 'USER_UPDATE',
  USER_DEACTIVATE: 'USER_DEACTIVATE',
  USER_ACCESS_GRANT: 'USER_ACCESS_GRANT',
  USER_ACCESS_REVOKE: 'USER_ACCESS_REVOKE',
  
  // Asset actions
  ASSET_CREATE: 'ASSET_CREATE',
  ASSET_UPDATE: 'ASSET_UPDATE',
  ASSET_CHECKOUT: 'ASSET_CHECKOUT',
  ASSET_CHECKIN: 'ASSET_CHECKIN',
  ASSET_DELETE: 'ASSET_DELETE',
  ASSET_VERIFY: 'ASSET_VERIFY',
  
  // License actions
  LICENSE_CREATE: 'LICENSE_CREATE',
  LICENSE_UPDATE: 'LICENSE_UPDATE',
  LICENSE_ASSIGN: 'LICENSE_ASSIGN',
  LICENSE_UNASSIGN: 'LICENSE_UNASSIGN',
  LICENSE_DELETE: 'LICENSE_DELETE',
  
  // Workflow actions
  WORKFLOW_START: 'WORKFLOW_START',
  WORKFLOW_COMPLETE: 'WORKFLOW_COMPLETE',
  WORKFLOW_TASK_COMPLETE: 'WORKFLOW_TASK_COMPLETE',
  
  // CMDB actions
  CI_CREATE: 'CI_CREATE',
  CI_UPDATE: 'CI_UPDATE',
  CI_RELATE: 'CI_RELATE',
  CI_UNRELATE: 'CI_UNRELATE',
  CI_DELETE: 'CI_DELETE',
} as const

export type ActivityAction = typeof ACTIVITY_ACTIONS[keyof typeof ACTIVITY_ACTIONS]

// Log an activity with mandatory external ticket ID
export async function logActivity({
  userId,
  action,
  targetId,
  targetType,
  externalTicketId,
  details,
}: {
  userId: number
  action: ActivityAction
  targetId: number
  targetType: string
  externalTicketId: string
  details?: Record<string, any>
}) {
  try {
    const activity = await prisma.activityLog.create({
      data: {
        user_id: userId,
        action_type: action,
        target_id: targetId,
        target_type: targetType,
        external_ticket_id: externalTicketId,
        details: details || {},
      },
      include: {
        user: {
          select: {
            first_name: true,
            last_name: true,
            email: true,
          },
        },
      },
    })

    return activity
  } catch (error) {
    console.error('Failed to log activity:', error)
    throw new Error('Failed to log activity')
  }
}

// Get activity log entries with pagination
export async function getActivityLog({
  page = 1,
  limit = 50,
  targetType,
  targetId,
  userId,
  actionType,
}: {
  page?: number
  limit?: number
  targetType?: string
  targetId?: number
  userId?: number
  actionType?: ActivityAction
} = {}) {
  const skip = (page - 1) * limit

  const where: any = {}
  if (targetType) where.target_type = targetType
  if (targetId) where.target_id = targetId
  if (userId) where.user_id = userId
  if (actionType) where.action_type = actionType

  const [activities, total] = await Promise.all([
    prisma.activityLog.findMany({
      where,
      include: {
        user: {
          select: {
            first_name: true,
            last_name: true,
            email: true,
          },
        },
      },
      orderBy: {
        timestamp: 'desc',
      },
      skip,
      take: limit,
    }),
    prisma.activityLog.count({ where }),
  ])

  return {
    data: activities,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  }
}

// Helper functions for specific entity types
export const logUserActivity = {
  create: (userId: number, targetUserId: number, externalTicketId: string, details?: Record<string, any>) =>
    logActivity({
      userId,
      action: ACTIVITY_ACTIONS.USER_CREATE,
      targetId: targetUserId,
      targetType: 'User',
      externalTicketId,
      details,
    }),

  update: (userId: number, targetUserId: number, externalTicketId: string, details?: Record<string, any>) =>
    logActivity({
      userId,
      action: ACTIVITY_ACTIONS.USER_UPDATE,
      targetId: targetUserId,
      targetType: 'User',
      externalTicketId,
      details,
    }),

  deactivate: (userId: number, targetUserId: number, externalTicketId: string, details?: Record<string, any>) =>
    logActivity({
      userId,
      action: ACTIVITY_ACTIONS.USER_DEACTIVATE,
      targetId: targetUserId,
      targetType: 'User',
      externalTicketId,
      details,
    }),
}

export const logAssetActivity = {
  create: (userId: number, assetId: number, externalTicketId: string, details?: Record<string, any>) =>
    logActivity({
      userId,
      action: ACTIVITY_ACTIONS.ASSET_CREATE,
      targetId: assetId,
      targetType: 'Asset',
      externalTicketId,
      details,
    }),

  checkout: (userId: number, assetId: number, externalTicketId: string, details?: Record<string, any>) =>
    logActivity({
      userId,
      action: ACTIVITY_ACTIONS.ASSET_CHECKOUT,
      targetId: assetId,
      targetType: 'Asset',
      externalTicketId,
      details,
    }),

  checkin: (userId: number, assetId: number, externalTicketId: string, details?: Record<string, any>) =>
    logActivity({
      userId,
      action: ACTIVITY_ACTIONS.ASSET_CHECKIN,
      targetId: assetId,
      targetType: 'Asset',
      externalTicketId,
      details,
    }),
}