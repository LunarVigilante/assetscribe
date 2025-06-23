// Core types based on our Prisma schema
export type UserWithRelations = {
  id: number
  employee_id: string
  first_name: string
  last_name: string
  nickname?: string
  username: string
  email: string
  job_title?: string
  is_active: boolean
  department?: {
    id: number
    name: string
  }
  location?: {
    id: number
    name: string
  }
  user_roles: {
    role: {
      id: number
      role_name: string
    }
  }[]
}

export type AssetWithRelations = {
  id: number
  asset_tag: string
  serial_number?: string
  model: {
    id: number
    name: string
    manufacturer: {
      name: string
    }
  }
  status: {
    name: string
    color?: string
  }
  assigned_to_user?: {
    id: number
    first_name: string
    last_name: string
  }
  location?: {
    name: string
  }
  department?: {
    name: string
  }
}

// Activity Log types
export type ActivityLogEntry = {
  id: number
  user_id: number
  action_type: string
  target_id: number
  target_type: string
  details?: any
  external_ticket_id: string
  timestamp: Date
  user: {
    first_name: string
    last_name: string
  }
}

// API Response types
export type ApiResponse<T = any> = {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// Pagination types
export type PaginatedResponse<T> = {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// Permission constants based on our RBAC system
export const PERMISSIONS = {
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
} as const

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS]