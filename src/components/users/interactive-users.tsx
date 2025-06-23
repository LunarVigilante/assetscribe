'use client'

import React, { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Users, 
  Search, 
  Filter, 
  Plus,
  MoreHorizontal,
  Eye,
  Edit,
  Shield,
  UserCheck,
  UserX,
  Mail,
  Phone,
  Building,
  MapPin,
  X,
  Loader2
} from 'lucide-react'

interface User {
  id: number
  first_name: string
  last_name: string
  email: string
  username: string
  job_title?: string
  phone?: string
  is_active: boolean
  created_at: Date
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
  assigned_assets: {
    id: number
    asset_tag: string
    model: {
      name: string
      category: {
        name: string
      }
    }
  }[]
}

interface Department {
  id: number
  name: string
}

interface InteractiveUsersProps {
  initialUsers: User[]
  departments: Department[]
  totalUsers: number
  activeUsers: number
  inactiveUsers: number
}

function getUserStatusBadge(isActive: boolean) {
  return (
    <Badge variant={isActive ? "default" : "secondary"}>
      {isActive ? "Active" : "Inactive"}
    </Badge>
  )
}

function getRoleBadgeVariant(roleName: string): "default" | "secondary" | "destructive" | "outline" {
  switch (roleName.toLowerCase()) {
    case 'admin':
      return 'destructive'
    case 'manager':
      return 'default'
    case 'technician':
      return 'outline'
    default:
      return 'secondary'
  }
}

export function InteractiveUsers({ 
  initialUsers, 
  departments, 
  totalUsers, 
  activeUsers, 
  inactiveUsers 
}: InteractiveUsersProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [departmentFilter, setDepartmentFilter] = useState<string>('all')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [isLoading, setIsLoading] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)

  // Get unique roles from users
  const availableRoles = useMemo(() => {
    const roles = new Set<string>()
    initialUsers.forEach(user => {
      user.user_roles.forEach(userRole => {
        roles.add(userRole.role.role_name)
      })
    })
    return Array.from(roles).sort()
  }, [initialUsers])

  // Filter users based on search and filters
  const filteredUsers = useMemo(() => {
    return initialUsers.filter(user => {
      // Search filter
      const searchLower = searchTerm.toLowerCase()
      const matchesSearch = searchTerm === '' || 
        user.first_name.toLowerCase().includes(searchLower) ||
        user.last_name.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower) ||
        user.username.toLowerCase().includes(searchLower) ||
        (user.job_title && user.job_title.toLowerCase().includes(searchLower)) ||
        (user.department && user.department.name.toLowerCase().includes(searchLower)) ||
        user.user_roles.some(role => role.role.role_name.toLowerCase().includes(searchLower))

      // Status filter
      const matchesStatus = statusFilter === 'all' || 
        (statusFilter === 'active' && user.is_active) ||
        (statusFilter === 'inactive' && !user.is_active)

      // Department filter
      const matchesDepartment = departmentFilter === 'all' || 
        (user.department && user.department.id.toString() === departmentFilter)

      // Role filter
      const matchesRole = roleFilter === 'all' || 
        user.user_roles.some(role => role.role.role_name === roleFilter)

      return matchesSearch && matchesStatus && matchesDepartment && matchesRole
    })
  }, [initialUsers, searchTerm, statusFilter, departmentFilter, roleFilter])

  const handleStatusFilter = (status: 'all' | 'active' | 'inactive') => {
    setStatusFilter(status)
  }

  const clearFilters = () => {
    setSearchTerm('')
    setStatusFilter('all')
    setDepartmentFilter('all')
    setRoleFilter('all')
  }

  const hasActiveFilters = searchTerm !== '' || statusFilter !== 'all' || departmentFilter !== 'all' || roleFilter !== 'all'

  const getEmptyStateMessage = () => {
    if (hasActiveFilters) {
      return {
        title: "No users match your filters",
        description: "Try adjusting your search criteria or clearing filters to see more results."
      }
    }
    return {
      title: "No users found",
      description: "Get started by adding users to your organization."
    }
  }

  return (
    <>
      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background rounded-lg border p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Add New User</h2>
              <Button variant="ghost" size="sm" onClick={() => setShowAddModal(false)}>
                ×
              </Button>
            </div>
            <form className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">First Name</label>
                  <Input placeholder="John" className="mt-1" />
                </div>
                <div>
                  <label className="text-sm font-medium">Last Name</label>
                  <Input placeholder="Doe" className="mt-1" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Email</label>
                <Input placeholder="john.doe@company.com" className="mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium">Username</label>
                <Input placeholder="john.doe" className="mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium">Job Title</label>
                <Input placeholder="Software Engineer" className="mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium">Department</label>
                <select className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm mt-1">
                  <option value="">Select department...</option>
                  {departments.map(dept => (
                    <option key={dept.id} value={dept.id}>{dept.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setShowAddModal(false)}>
                  Cancel
                </Button>
                <Button onClick={(e) => {
                  e.preventDefault()
                  alert('User creation functionality will be implemented in the next phase')
                  setShowAddModal(false)
                }}>
                  Add User
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Users</h1>
          <p className="text-muted-foreground">
            Manage user accounts and permissions
          </p>
        </div>
        <Button className="flex items-center gap-2" onClick={() => setShowAddModal(true)}>
          <Plus className="h-4 w-4" />
          Add User
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card 
          className={`cursor-pointer transition-colors ${statusFilter === 'all' ? 'ring-2 ring-primary' : 'hover:bg-muted/50'}`}
          onClick={() => handleStatusFilter('all')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              All registered users
            </p>
          </CardContent>
        </Card>

        <Card 
          className={`cursor-pointer transition-colors ${statusFilter === 'active' ? 'ring-2 ring-primary' : 'hover:bg-muted/50'}`}
          onClick={() => handleStatusFilter('active')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <UserCheck className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeUsers}</div>
            <p className="text-xs text-muted-foreground">
              {totalUsers > 0 ? ((activeUsers / totalUsers) * 100).toFixed(1) : 0}% of total
            </p>
          </CardContent>
        </Card>

        <Card 
          className={`cursor-pointer transition-colors ${statusFilter === 'inactive' ? 'ring-2 ring-primary' : 'hover:bg-muted/50'}`}
          onClick={() => handleStatusFilter('inactive')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactive Users</CardTitle>
            <UserX className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inactiveUsers}</div>
            <p className="text-xs text-muted-foreground">
              {totalUsers > 0 ? ((inactiveUsers / totalUsers) * 100).toFixed(1) : 0}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Departments</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{departments.length}</div>
            <p className="text-xs text-muted-foreground">
              Active departments
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>User Directory</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-80 pl-8"
                />
              </div>
              
              {/* Department Filter */}
              <select
                value={departmentFilter}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setDepartmentFilter(e.target.value)}
                className="flex h-9 rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="all">All Departments</option>
                {departments.map(dept => (
                  <option key={dept.id} value={dept.id}>{dept.name}</option>
                ))}
              </select>

              {/* Role Filter */}
              <select
                value={roleFilter}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setRoleFilter(e.target.value)}
                className="flex h-9 rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="all">All Roles</option>
                {availableRoles.map(role => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Active Filters */}
            {hasActiveFilters && (
              <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-md">
                <span className="text-sm text-muted-foreground">Active filters:</span>
                {searchTerm && (
                  <Badge variant="outline" className="text-xs">
                    Search: "{searchTerm}"
                    <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => setSearchTerm('')} />
                  </Badge>
                )}
                {statusFilter !== 'all' && (
                  <Badge variant="outline" className="text-xs">
                    Status: {statusFilter}
                    <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => setStatusFilter('all')} />
                  </Badge>
                )}
                {departmentFilter !== 'all' && (
                  <Badge variant="outline" className="text-xs">
                    Department: {departments.find(d => d.id.toString() === departmentFilter)?.name}
                    <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => setDepartmentFilter('all')} />
                  </Badge>
                )}
                {roleFilter !== 'all' && (
                  <Badge variant="outline" className="text-xs">
                    Role: {roleFilter}
                    <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => setRoleFilter('all')} />
                  </Badge>
                )}
                <Button variant="ghost" size="sm" onClick={clearFilters} className="text-xs">
                  Clear all
                </Button>
              </div>
            )}

            {/* Results Summary */}
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>
                Showing {filteredUsers.length} of {totalUsers} users
                {hasActiveFilters && ` (filtered)`}
              </span>
            </div>

            {/* Loading State */}
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <>
                {/* Table Header */}
                <div className="grid grid-cols-12 gap-4 font-medium text-sm text-muted-foreground border-b pb-2">
                  <div className="col-span-3">User</div>
                  <div className="col-span-2">Role</div>
                  <div className="col-span-2">Department</div>
                  <div className="col-span-2">Assets</div>
                  <div className="col-span-1">Status</div>
                  <div className="col-span-1">Last Login</div>
                  <div className="col-span-1">Actions</div>
                </div>

                {/* Table Rows */}
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <div key={user.id} className="grid grid-cols-12 gap-4 items-center py-4 border-b border-border/50 hover:bg-muted/50 transition-colors">
                      <div className="col-span-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-sm font-medium text-primary">
                              {user.first_name.charAt(0)}{user.last_name.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium">
                              {user.first_name} {user.last_name}
                            </div>
                            <div className="text-sm text-muted-foreground flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {user.email}
                            </div>
                            {user.job_title && (
                              <div className="text-xs text-muted-foreground">
                                {user.job_title}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="col-span-2">
                        <div className="flex flex-wrap gap-1">
                          {user.user_roles.map((userRole) => (
                            <Badge 
                              key={userRole.role.id}
                              variant={getRoleBadgeVariant(userRole.role.role_name)}
                              className="text-xs"
                            >
                              {userRole.role.role_name}
                            </Badge>
                          ))}
                          {user.user_roles.length === 0 && (
                            <span className="text-xs text-muted-foreground">No roles</span>
                          )}
                        </div>
                      </div>
                      <div className="col-span-2">
                        {user.department ? (
                          <div>
                            <div className="font-medium text-sm flex items-center gap-1">
                              <Building className="h-3 w-3" />
                              {user.department.name}
                            </div>
                            {user.location && (
                              <div className="text-xs text-muted-foreground flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {user.location.name}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">No department</span>
                        )}
                      </div>
                      <div className="col-span-2">
                        <div className="text-sm">
                          {user.assigned_assets.length > 0 ? (
                            <div>
                              <div className="font-medium">
                                {user.assigned_assets.length} asset{user.assigned_assets.length !== 1 ? 's' : ''}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {user.assigned_assets.slice(0, 2).map(asset => 
                                  asset.model.category.name
                                ).join(', ')}
                                {user.assigned_assets.length > 2 && ` +${user.assigned_assets.length - 2} more`}
                              </div>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">No assets</span>
                          )}
                        </div>
                      </div>
                      <div className="col-span-1">
                        {getUserStatusBadge(user.is_active)}
                      </div>
                      <div className="col-span-1">
                        <div className="text-xs text-muted-foreground">
                          Never
                        </div>
                      </div>
                      <div className="col-span-1">
                        <div className="flex items-center justify-end gap-1">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            title="View User"
                            onClick={() => {
                              alert(`Viewing user: ${user.first_name} ${user.last_name}\nEmail: ${user.email}\nStatus: ${user.is_active ? 'Active' : 'Inactive'}\nDepartment: ${user.department?.name || 'No department'}\nAssets: ${user.assigned_assets.length}`)
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            title="Edit User"
                            onClick={() => {
                              alert(`Edit functionality for ${user.first_name} ${user.last_name} will be implemented in the next phase`)
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            title="More Actions"
                            onClick={() => {
                              const actions = ['Reset Password', 'Assign Role', 'Deactivate', 'Transfer Assets', 'View Audit Log']
                              const action = prompt(`More actions for ${user.first_name} ${user.last_name}:\n${actions.map((a, i) => `${i+1}. ${a}`).join('\n')}\n\nEnter action number (1-5):`)
                              if (action && action >= '1' && action <= '5') {
                                alert(`${actions[parseInt(action)-1]} action will be implemented in the next phase`)
                              }
                            }}
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">{getEmptyStateMessage().title}</h3>
                    <p className="text-muted-foreground mb-4">
                      {getEmptyStateMessage().description}
                    </p>
                    {!hasActiveFilters && (
                      <Button onClick={() => setShowAddModal(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Your First User
                      </Button>
                    )}
                  </div>
                )}
              </>
            )}

            {/* Pagination */}
            {filteredUsers.length > 0 && (
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="text-sm text-muted-foreground">
                  Showing {filteredUsers.length} of {totalUsers} users
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" disabled>
                    Previous
                  </Button>
                  <Button variant="outline" size="sm">
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
    </>
  )
} 