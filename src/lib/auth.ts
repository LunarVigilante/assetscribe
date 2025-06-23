import { User, Role, Permission } from '@/generated/prisma'
import { prisma } from './prisma'
import { Permission as PermissionType } from '@/types'

// Get user with their roles and permissions
export async function getUserWithPermissions(userId: number) {
  return await prisma.user.findUnique({
    where: { id: userId },
    include: {
      user_roles: {
        include: {
          role: {
            include: {
              role_permissions: {
                include: {
                  permission: true
                }
              }
            }
          }
        }
      },
      department: true,
      location: true,
    }
  })
}

// Check if user has a specific permission
export async function userHasPermission(userId: number, requiredPermission: PermissionType): Promise<boolean> {
  const user = await getUserWithPermissions(userId)
  
  if (!user || !user.is_active) {
    return false
  }

  // Get all permissions for the user through their roles
  const userPermissions = user.user_roles.flatMap(userRole => 
    userRole.role.role_permissions.map(rolePermission => 
      rolePermission.permission.permission_name
    )
  )

  return userPermissions.includes(requiredPermission)
}

// Check if user has any of the specified permissions
export async function userHasAnyPermission(userId: number, permissions: PermissionType[]): Promise<boolean> {
  const user = await getUserWithPermissions(userId)
  
  if (!user || !user.is_active) {
    return false
  }

  const userPermissions = user.user_roles.flatMap(userRole => 
    userRole.role.role_permissions.map(rolePermission => 
      rolePermission.permission.permission_name
    )
  )

  return permissions.some(permission => userPermissions.includes(permission))
}

// Get all permissions for a user
export async function getUserPermissions(userId: number): Promise<string[]> {
  const user = await getUserWithPermissions(userId)
  
  if (!user || !user.is_active) {
    return []
  }

  return user.user_roles.flatMap(userRole => 
    userRole.role.role_permissions.map(rolePermission => 
      rolePermission.permission.permission_name
    )
  )
}

// Middleware function to check permissions
export function requirePermission(permission: PermissionType) {
  return async (userId: number) => {
    const hasPermission = await userHasPermission(userId, permission)
    if (!hasPermission) {
      throw new Error(`Access denied. Required permission: ${permission}`)
    }
    return true
  }
}

// Initialize default roles and permissions (run once during setup)
export async function initializeRBAC() {
  try {
    // Create default permissions
    const defaultPermissions = Object.values({
      // Asset permissions
      ASSET_CREATE: 'asset:create',
      ASSET_READ: 'asset:read',
      ASSET_UPDATE: 'asset:update',
      ASSET_DELETE: 'asset:delete',
      ASSET_CHECKOUT: 'asset:checkout',
      ASSET_CHECKIN: 'asset:checkin',
      
      // User permissions
      USER_CREATE: 'user:create',
      USER_READ: 'user:read',
      USER_UPDATE: 'user:update',
      USER_DELETE: 'user:delete',
      USER_DEACTIVATE: 'user:deactivate',
      
      // License permissions
      LICENSE_CREATE: 'license:create',
      LICENSE_READ: 'license:read',
      LICENSE_UPDATE: 'license:update',
      LICENSE_DELETE: 'license:delete',
      LICENSE_ASSIGN: 'license:assign',
      
      // Admin permissions
      ADMIN_SETTINGS: 'admin:settings',
      ADMIN_RBAC: 'admin:rbac',
      ADMIN_AUDIT: 'admin:audit',
      
      // CMDB permissions
      CMDB_CREATE: 'cmdb:create',
      CMDB_READ: 'cmdb:read',
      CMDB_UPDATE: 'cmdb:update',
      CMDB_DELETE: 'cmdb:delete',
      CMDB_ANALYZE: 'cmdb:analyze',
    })

    // Create permissions if they don't exist
    for (const permissionName of defaultPermissions) {
      await prisma.permission.upsert({
        where: { permission_name: permissionName },
        update: {},
        create: {
          permission_name: permissionName,
          display_name: formatPermissionDisplayName(permissionName),
        },
      })
    }

    // Create Administrator role if it doesn't exist
    const adminRole = await prisma.role.upsert({
      where: { role_name: 'Administrator' },
      update: {},
      create: {
        role_name: 'Administrator',
        description: 'Full system administrator with all permissions',
      },
    })

    // Get all permissions
    const allPermissions = await prisma.permission.findMany()

    // Assign all permissions to Administrator role
    for (const permission of allPermissions) {
      await prisma.rolePermission.upsert({
        where: {
          role_id_permission_id: {
            role_id: adminRole.id,
            permission_id: permission.id,
          },
        },
        update: {},
        create: {
          role_id: adminRole.id,
          permission_id: permission.id,
        },
      })
    }

    console.log('RBAC system initialized successfully')
    return { success: true }
  } catch (error) {
    console.error('Failed to initialize RBAC system:', error)
    return { success: false, error }
  }
}

// Helper function to format permission names for display
function formatPermissionDisplayName(permissionName: string): string {
  const [resource, action] = permissionName.split(':')
  const formattedResource = resource.charAt(0).toUpperCase() + resource.slice(1)
  const formattedAction = action.charAt(0).toUpperCase() + action.slice(1)
  return `${formattedAction} ${formattedResource}`
} 