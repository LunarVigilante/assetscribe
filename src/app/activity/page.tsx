import React, { Suspense } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Activity, 
  Search, 
  Filter, 
  Download,
  MoreHorizontal,
  Eye,
  Calendar,
  User,
  Package,
  FileText,
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  Loader2,
  ExternalLink
} from 'lucide-react'
import { prisma } from '@/lib/prisma'

async function getActivityData() {
  try {
    // Get activity logs with user details
    const activityLogs = await prisma.activityLog.findMany({
      include: {
        user: true
      },
      orderBy: {
        timestamp: 'desc'
      },
      take: 100
    })

    // Get activity statistics
    const totalActivities = await prisma.activityLog.count()
    const todayActivities = await prisma.activityLog.count({
      where: {
        timestamp: {
          gte: new Date(new Date().setHours(0, 0, 0, 0))
        }
      }
    })
    const thisWeekActivities = await prisma.activityLog.count({
      where: {
        timestamp: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        }
      }
    })

    // Get activity type distribution
    const activityTypeDistribution = await prisma.activityLog.groupBy({
      by: ['action_type'],
      _count: {
        id: true
      },
      orderBy: {
        _count: {
          id: 'desc'
        }
      }
    })

    // Get target type distribution
    const targetTypeDistribution = await prisma.activityLog.groupBy({
      by: ['target_type'],
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
      activityLogs,
      totalActivities,
      todayActivities,
      thisWeekActivities,
      activityTypeDistribution,
      targetTypeDistribution
    }
  } catch (error) {
    console.error('Error fetching activity data:', error)
    return {
      activityLogs: [],
      totalActivities: 0,
      todayActivities: 0,
      thisWeekActivities: 0,
      activityTypeDistribution: [],
      targetTypeDistribution: []
    }
  }
}

function ActivityLoading() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="flex items-center gap-2">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="text-muted-foreground">Loading activity log...</span>
      </div>
    </div>
  )
}

function getActivityIcon(actionType: string) {
  switch (actionType.toLowerCase()) {
    case 'user_create':
    case 'user_update':
    case 'user_delete':
      return <User className="h-4 w-4" />
    case 'asset_create':
    case 'asset_update':
    case 'asset_checkout':
    case 'asset_checkin':
    case 'asset_delete':
      return <Package className="h-4 w-4" />
    case 'license_assign':
    case 'license_unassign':
    case 'license_create':
      return <FileText className="h-4 w-4" />
    case 'system_login':
    case 'system_logout':
    case 'permission_change':
      return <Shield className="h-4 w-4" />
    default:
      return <Activity className="h-4 w-4" />
  }
}

function getActivityBadgeVariant(actionType: string): "default" | "secondary" | "destructive" | "outline" {
  switch (actionType.toLowerCase()) {
    case 'user_create':
    case 'asset_create':
    case 'license_assign':
      return 'default'
    case 'user_update':
    case 'asset_update':
    case 'asset_checkout':
    case 'asset_checkin':
      return 'outline'
    case 'user_delete':
    case 'asset_delete':
    case 'license_unassign':
      return 'destructive'
    default:
      return 'secondary'
  }
}

function formatActionType(actionType: string) {
  return actionType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
}

function getTargetTypeIcon(targetType: string) {
  switch (targetType.toLowerCase()) {
    case 'user':
      return <User className="h-3 w-3" />
    case 'asset':
      return <Package className="h-3 w-3" />
    case 'license':
      return <FileText className="h-3 w-3" />
    default:
      return <Activity className="h-3 w-3" />
  }
}

async function ActivityContent() {
  const data = await getActivityData()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Activity Log</h1>
          <p className="text-muted-foreground">
            Comprehensive audit trail and system activity monitoring
          </p>
        </div>
        <Button className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Export Log
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Activities</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalActivities}</div>
            <p className="text-xs text-muted-foreground">
              All time records
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today</CardTitle>
            <Calendar className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.todayActivities}</div>
            <p className="text-xs text-muted-foreground">
              Activities today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.thisWeekActivities}</div>
            <p className="text-xs text-muted-foreground">
              Past 7 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Action Types</CardTitle>
            <Shield className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.activityTypeDistribution.length}</div>
            <p className="text-xs text-muted-foreground">
              Different actions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Activity Type Distribution */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Activity Types</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.activityTypeDistribution.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getActivityIcon(item.action_type)}
                    <span className="text-sm">{formatActionType(item.action_type)}</span>
                  </div>
                  <Badge variant="outline">{item._count.id}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Target Types</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.targetTypeDistribution.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getTargetTypeIcon(item.target_type)}
                    <span className="text-sm">{item.target_type}</span>
                  </div>
                  <Badge variant="outline">{item._count.id}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activity Log */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Activity Log</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <input
                  placeholder="Search activities..."
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
              <span>Showing {data.activityLogs.length} of {data.totalActivities} activities</span>
            </div>

            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 font-medium text-sm text-muted-foreground border-b pb-2">
              <div className="col-span-2">Timestamp</div>
              <div className="col-span-2">User</div>
              <div className="col-span-2">Action</div>
              <div className="col-span-2">Target</div>
              <div className="col-span-2">Ticket ID</div>
              <div className="col-span-1">Details</div>
              <div className="col-span-1">Actions</div>
            </div>

            {/* Table Rows */}
            {data.activityLogs.length > 0 ? (
              data.activityLogs.map((log) => (
                <div key={log.id} className="grid grid-cols-12 gap-4 items-center py-4 border-b border-border/50 hover:bg-muted/50 transition-colors">
                  <div className="col-span-2">
                    <div className="text-sm">
                      {log.timestamp.toLocaleDateString()}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {log.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                  <div className="col-span-2">
                    <div className="flex items-center gap-2">
                      <User className="h-3 w-3" />
                      <span className="text-sm">
                        {log.user.first_name} {log.user.last_name}
                      </span>
                    </div>
                  </div>
                  <div className="col-span-2">
                    <div className="flex items-center gap-2">
                      {getActivityIcon(log.action_type)}
                      <Badge variant={getActivityBadgeVariant(log.action_type)} className="text-xs">
                        {formatActionType(log.action_type)}
                      </Badge>
                    </div>
                  </div>
                  <div className="col-span-2">
                    <div className="flex items-center gap-1">
                      {getTargetTypeIcon(log.target_type)}
                      <span className="text-sm">
                        {log.target_type} #{log.target_id}
                      </span>
                    </div>
                  </div>
                  <div className="col-span-2">
                    <div className="flex items-center gap-1">
                      <ExternalLink className="h-3 w-3" />
                      <span className="text-sm font-mono">
                        {log.external_ticket_id}
                      </span>
                    </div>
                  </div>
                  <div className="col-span-1">
                    {log.details ? (
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    ) : (
                      <span className="text-muted-foreground text-xs">None</span>
                    )}
                  </div>
                  <div className="col-span-1">
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
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
                <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No activity logs found</h3>
                <p className="text-muted-foreground mb-4">
                  Activity will appear here as users interact with the system.
                </p>
              </div>
            )}

            {/* Pagination */}
            {data.activityLogs.length > 0 && (
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="text-sm text-muted-foreground">
                  Showing {data.activityLogs.length} of {data.totalActivities} activities
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

export default function ActivityPage() {
  return (
    <div className="p-6">
      <Suspense fallback={<ActivityLoading />}>
        <ActivityContent />
      </Suspense>
    </div>
  )
}