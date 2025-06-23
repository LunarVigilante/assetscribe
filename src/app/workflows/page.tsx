import React, { Suspense } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Calendar, 
  Search, 
  Filter, 
  Plus,
  MoreHorizontal,
  Eye,
  Edit,
  CheckCircle,
  Clock,
  User,
  Users,
  Play,
  Pause,
  AlertTriangle,
  Loader2,
  ArrowRight
} from 'lucide-react'
import { prisma } from '@/lib/prisma'

async function getWorkflowsData() {
  try {
    // Get workflow templates
    const workflowTemplates = await prisma.workflowTemplate.findMany({
      include: {
        tasks: {
          orderBy: {
            display_order: 'asc'
          }
        },
        instances: {
          include: {
            target_user: true,
            tasks: {
              include: {
                task: true,
                completed_by_user: true
              }
            }
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    })

    // Get workflow instances with details
    const workflowInstances = await prisma.workflowInstance.findMany({
      include: {
        template: true,
        target_user: true,
        tasks: {
          include: {
            task: true,
            completed_by_user: true
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      },
      take: 50
    })

    // Get workflow statistics
    const totalTemplates = await prisma.workflowTemplate.count()
    const totalInstances = await prisma.workflowInstance.count()
    const activeInstances = await prisma.workflowInstance.count({
      where: {
        status: 'In Progress'
      }
    })
    const completedInstances = await prisma.workflowInstance.count({
      where: {
        status: 'Completed'
      }
    })

    return {
      workflowTemplates,
      workflowInstances,
      totalTemplates,
      totalInstances,
      activeInstances,
      completedInstances
    }
  } catch (error) {
    console.error('Error fetching workflows data:', error)
    return {
      workflowTemplates: [],
      workflowInstances: [],
      totalTemplates: 0,
      totalInstances: 0,
      activeInstances: 0,
      completedInstances: 0
    }
  }
}

function WorkflowsLoading() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="flex items-center gap-2">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="text-muted-foreground">Loading workflows...</span>
      </div>
    </div>
  )
}

function getWorkflowStatusBadge(status: string) {
  switch (status.toLowerCase()) {
    case 'in progress':
      return <Badge variant="default">In Progress</Badge>
    case 'completed':
      return <Badge variant="outline" className="text-green-600 border-green-600">Completed</Badge>
    case 'cancelled':
      return <Badge variant="destructive">Cancelled</Badge>
    case 'paused':
      return <Badge variant="outline" className="text-amber-600 border-amber-600">Paused</Badge>
    default:
      return <Badge variant="secondary">Unknown</Badge>
  }
}

function getTaskTypeIcon(taskType: string) {
  switch (taskType.toLowerCase()) {
    case 'manual_checkbox':
      return <CheckCircle className="h-4 w-4" />
    case 'link_to_action':
      return <ArrowRight className="h-4 w-4" />
    default:
      return <Calendar className="h-4 w-4" />
  }
}

function calculateWorkflowProgress(instance: any) {
  if (instance.tasks.length === 0) return 0
  const completedTasks = instance.tasks.filter((t: any) => t.is_completed).length
  return (completedTasks / instance.tasks.length) * 100
}

async function WorkflowsContent() {
  const data = await getWorkflowsData()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Workflow Management</h1>
          <p className="text-muted-foreground">
            Manage workflow templates and track execution
          </p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create Workflow
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Templates</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalTemplates}</div>
            <p className="text-xs text-muted-foreground">
              Workflow templates
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Workflows</CardTitle>
            <Play className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.activeInstances}</div>
            <p className="text-xs text-muted-foreground">
              Currently in progress
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.completedInstances}</div>
            <p className="text-xs text-muted-foreground">
              Successfully finished
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Instances</CardTitle>
            <Users className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalInstances}</div>
            <p className="text-xs text-muted-foreground">
              All time executions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Workflow Templates */}
      <Card>
        <CardHeader>
          <CardTitle>Workflow Templates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data.workflowTemplates.length > 0 ? (
              data.workflowTemplates.map((template) => (
                <div key={template.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                      <Calendar className="h-5 w-5 text-purple-500" />
                    </div>
                    <div>
                      <div className="font-medium">{template.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {template.description || 'No description'}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {template.tasks.length} task{template.tasks.length !== 1 ? 's' : ''} • {template.instances.length} instance{template.instances.length !== 1 ? 's' : ''}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Play className="h-4 w-4 mr-1" />
                      Start
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No workflow templates</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first workflow template to get started.
                </p>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Template
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Active Workflow Instances */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Workflow Instances</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <input
                  placeholder="Search workflows..."
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
              <span>Showing {data.workflowInstances.length} of {data.totalInstances} workflow instances</span>
            </div>

            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 font-medium text-sm text-muted-foreground border-b pb-2">
              <div className="col-span-3">Workflow</div>
              <div className="col-span-2">Target User</div>
              <div className="col-span-2">Progress</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-1">Created</div>
              <div className="col-span-1">Updated</div>
              <div className="col-span-1">Actions</div>
            </div>

            {/* Table Rows */}
            {data.workflowInstances.length > 0 ? (
              data.workflowInstances.map((instance) => {
                const progress = calculateWorkflowProgress(instance)
                return (
                  <div key={instance.id} className="grid grid-cols-12 gap-4 items-center py-4 border-b border-border/50 hover:bg-muted/50 transition-colors">
                    <div className="col-span-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                          <Calendar className="h-5 w-5 text-blue-500" />
                        </div>
                        <div>
                          <div className="font-medium">{instance.template.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {instance.template.description || 'No description'}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="col-span-2">
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        <span className="text-sm">
                          {instance.target_user.first_name} {instance.target_user.last_name}
                        </span>
                      </div>
                    </div>
                    <div className="col-span-2">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span>{Math.round(progress)}% complete</span>
                          <span>{instance.tasks.filter((t: any) => t.is_completed).length}/{instance.tasks.length}</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full transition-all" 
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="col-span-2">
                      {getWorkflowStatusBadge(instance.status)}
                    </div>
                    <div className="col-span-1">
                      <div className="text-xs text-muted-foreground">
                        {instance.created_at.toLocaleDateString()}
                      </div>
                    </div>
                    <div className="col-span-1">
                      <div className="text-xs text-muted-foreground">
                        {instance.updated_at.toLocaleDateString()}
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
                )
              })
            ) : (
              <div className="text-center py-12">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No workflow instances found</h3>
                <p className="text-muted-foreground mb-4">
                  Start a workflow from a template to see instances here.
                </p>
                <Button>
                  <Play className="h-4 w-4 mr-2" />
                  Start Workflow
                </Button>
              </div>
            )}

            {/* Pagination */}
            {data.workflowInstances.length > 0 && (
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="text-sm text-muted-foreground">
                  Showing {data.workflowInstances.length} of {data.totalInstances} workflow instances
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

export default function WorkflowsPage() {
  return (
    <div className="p-6">
      <Suspense fallback={<WorkflowsLoading />}>
        <WorkflowsContent />
      </Suspense>
    </div>
  )
} 