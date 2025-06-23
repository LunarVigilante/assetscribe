import React, { Suspense } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Network, 
  Search, 
  Filter, 
  Plus,
  MoreHorizontal,
  Eye,
  Edit,
  AlertTriangle,
  CheckCircle,
  GitBranch,
  Database,
  Server,
  Loader2,
  Users,
  Building
} from 'lucide-react'
import { prisma } from '@/lib/prisma'

async function getCMDBData() {
  try {
    // Get configuration items with related data
    const configurationItems = await prisma.configurationItem.findMany({
      include: {
        ci_type: true,
        responsible_user: true,
        status: true,
        parent_relationships: {
          include: {
            child_ci: {
              include: {
                ci_type: true
              }
            }
          }
        },
        child_relationships: {
          include: {
            parent_ci: {
              include: {
                ci_type: true
              }
            }
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      },
      take: 50
    })

    // Get CI types
    const ciTypes = await prisma.cIType.findMany({
      orderBy: {
        name: 'asc'
      }
    })

    // Get status labels for CIs
    const statusLabels = await prisma.statusLabel.findMany({
      orderBy: {
        name: 'asc'
      }
    })

    // Get CI statistics
    const totalCIs = await prisma.configurationItem.count()
    const activeCIs = await prisma.configurationItem.count({
      where: {
        status: {
          name: 'Active'
        }
      }
    })
    const totalRelationships = await prisma.cIRelationship.count()

    // Get CI type distribution
    const ciTypeDistribution = await prisma.configurationItem.groupBy({
      by: ['ci_type_id'],
      _count: {
        id: true
      },
      orderBy: {
        _count: {
          id: 'desc'
        }
      }
    })

    return {
      configurationItems,
      ciTypes,
      statusLabels,
      totalCIs,
      activeCIs,
      totalRelationships,
      ciTypeDistribution
    }
  } catch (error) {
    console.error('Error fetching CMDB data:', error)
    return {
      configurationItems: [],
      ciTypes: [],
      statusLabels: [],
      totalCIs: 0,
      activeCIs: 0,
      totalRelationships: 0,
      ciTypeDistribution: []
    }
  }
}

function CMDBLoading() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="flex items-center gap-2">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="text-muted-foreground">Loading CMDB...</span>
      </div>
    </div>
  )
}

function getCIStatusBadge(status: any) {
  switch (status?.name?.toLowerCase()) {
    case 'active':
      return <Badge variant="default">Active</Badge>
    case 'inactive':
      return <Badge variant="secondary">Inactive</Badge>
    case 'deprecated':
      return <Badge variant="destructive">Deprecated</Badge>
    case 'maintenance':
      return <Badge variant="outline" className="text-amber-600 border-amber-600">Maintenance</Badge>
    default:
      return <Badge variant="outline">Unknown</Badge>
  }
}

function getCITypeIcon(typeName: string) {
  switch (typeName.toLowerCase()) {
    case 'server':
    case 'database':
      return <Server className="h-4 w-4" />
    case 'application':
    case 'software':
      return <Database className="h-4 w-4" />
    case 'network':
    case 'infrastructure':
      return <Network className="h-4 w-4" />
    default:
      return <GitBranch className="h-4 w-4" />
  }
}

async function CMDBContent() {
  const data = await getCMDBData()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Configuration Management Database</h1>
          <p className="text-muted-foreground">
            Manage configuration items and their relationships
          </p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Configuration Item
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total CIs</CardTitle>
            <Network className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalCIs}</div>
            <p className="text-xs text-muted-foreground">
              Configuration items
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active CIs</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.activeCIs}</div>
            <p className="text-xs text-muted-foreground">
              {data.totalCIs > 0 ? ((data.activeCIs / data.totalCIs) * 100).toFixed(1) : 0}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Relationships</CardTitle>
            <GitBranch className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalRelationships}</div>
            <p className="text-xs text-muted-foreground">
              CI dependencies
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CI Types</CardTitle>
            <Database className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.ciTypes.length}</div>
            <p className="text-xs text-muted-foreground">
              Different categories
            </p>
          </CardContent>
        </Card>
      </div>

      {/* CI Type Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>CI Type Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {data.ciTypeDistribution.map((item, index) => {
              const ciType = data.ciTypes.find(t => t.id === item.ci_type_id)
              return (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getCITypeIcon(ciType?.name || '')}
                    <span className="text-sm">{ciType?.name || 'Unknown'}</span>
                  </div>
                  <Badge variant="outline">{item._count.id}</Badge>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Configuration Items Directory */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Configuration Items</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <input
                  placeholder="Search configuration items..."
                  className="flex h-9 w-80 rounded-md border border-input bg-background px-8 py-1 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Results Summary */}
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Showing {data.configurationItems.length} of {data.totalCIs} configuration items</span>
            </div>

            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 font-medium text-sm text-muted-foreground border-b pb-2">
              <div className="col-span-3">Configuration Item</div>
              <div className="col-span-2">Type</div>
              <div className="col-span-2">Responsible User</div>
              <div className="col-span-2">Relationships</div>
              <div className="col-span-1">Status</div>
              <div className="col-span-1">Updated</div>
              <div className="col-span-1">Actions</div>
            </div>

            {/* Table Rows */}
            {data.configurationItems.length > 0 ? (
              data.configurationItems.map((ci) => (
                <div key={ci.id} className="grid grid-cols-12 gap-4 items-center py-4 border-b border-border/50 hover:bg-muted/50 transition-colors">
                  <div className="col-span-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                        {getCITypeIcon(ci.ci_type.name)}
                      </div>
                      <div>
                        <div className="font-medium">{ci.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {ci.description || 'No description'}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-span-2">
                    <Badge variant="outline">
                      {ci.ci_type.name}
                    </Badge>
                  </div>
                  <div className="col-span-2">
                    {ci.responsible_user ? (
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        <span className="text-sm">
                          {ci.responsible_user.first_name} {ci.responsible_user.last_name}
                        </span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-sm">Unassigned</span>
                    )}
                  </div>
                  <div className="col-span-2">
                    <div className="text-sm">
                      {ci.parent_relationships.length + ci.child_relationships.length > 0 ? (
                        <div className="flex items-center gap-1">
                          <GitBranch className="h-3 w-3" />
                          <span>
                            {ci.parent_relationships.length + ci.child_relationships.length} relationship{ci.parent_relationships.length + ci.child_relationships.length !== 1 ? 's' : ''}
                          </span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">No relationships</span>
                      )}
                    </div>
                  </div>
                  <div className="col-span-1">
                    {getCIStatusBadge(ci.status)}
                  </div>
                  <div className="col-span-1">
                    <div className="text-xs text-muted-foreground">
                      {ci.updated_at.toLocaleDateString()}
                    </div>
                  </div>
                  <div className="col-span-1">
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <Network className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No configuration items found</h3>
                <p className="text-muted-foreground mb-4">
                  Get started by adding configuration items to your CMDB.
                </p>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First CI
                </Button>
              </div>
            )}

            {/* Pagination */}
            {data.configurationItems.length > 0 && (
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="text-sm text-muted-foreground">
                  Showing {data.configurationItems.length} of {data.totalCIs} configuration items
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
  )
}

export default function CMDBPage() {
  return (
    <div className="p-6">
      <Suspense fallback={<CMDBLoading />}>
        <CMDBContent />
      </Suspense>
    </div>
  )
} 