import React, { Suspense } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  FileText, 
  Search, 
  Filter, 
  Plus,
  MoreHorizontal,
  Eye,
  Edit,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  Download,
  Calendar,
  Building,
  Loader2
} from 'lucide-react'
import { prisma } from '@/lib/prisma'

async function getLicensesData() {
  try {
    // Get licenses with related data
    const licenses = await prisma.license.findMany({
      include: {
        vendor: true,
        assignments: {
          include: {
            user: true,
            asset: {
              include: {
                model: {
                  include: {
                    category: true
                  }
                }
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

    // Get license statistics
    const totalLicenses = await prisma.license.count()
    const licenseAssignments = await prisma.licenseAssignment.count()
    const assignedLicenses = licenseAssignments
    const availableLicenses = totalLicenses - assignedLicenses

    // Get licenses expiring soon
    const expiringLicenses = await prisma.license.count({
      where: {
        expiry_date: {
          lte: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) // Next 90 days
        }
      }
    })

    // License categories are not available in this schema
    const categories: any[] = []

    // Get manufacturers for software licenses
    const manufacturers = await prisma.manufacturer.findMany({
      orderBy: {
        name: 'asc'
      }
    })

    return {
      licenses,
      categories,
      manufacturers,
      totalLicenses,
      availableLicenses,
      assignedLicenses,
      expiringLicenses
    }
  } catch (error) {
    console.error('Error fetching licenses:', error)
    return {
      licenses: [],
      categories: [],
      manufacturers: [],
      totalLicenses: 0,
      availableLicenses: 0,
      assignedLicenses: 0,
      expiringLicenses: 0
    }
  }
}

function LicensesLoading() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="flex items-center gap-2">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="text-muted-foreground">Loading licenses...</span>
      </div>
    </div>
  )
}

function getLicenseStatusBadge(license: any) {
  const now = new Date()
  const isExpired = license.expiry_date && new Date(license.expiry_date) < now
  const isExpiringSoon = license.expiry_date && new Date(license.expiry_date) < new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000)
  const isAssigned = license.assigned_to_user_id || license.assigned_to_asset_id

  if (isExpired) {
    return <Badge variant="destructive">Expired</Badge>
  }
  if (isExpiringSoon) {
    return <Badge variant="outline" className="text-amber-600 border-amber-600">Expiring Soon</Badge>
  }
  if (isAssigned) {
    return <Badge variant="default">In Use</Badge>
  }
  return <Badge variant="secondary">Available</Badge>
}

async function LicensesContent() {
  const data = await getLicensesData()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Software Licenses</h1>
          <p className="text-muted-foreground">
            Manage software licenses and compliance
          </p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add License
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Licenses</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalLicenses}</div>
            <p className="text-xs text-muted-foreground">
              All software licenses
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.availableLicenses}</div>
            <p className="text-xs text-muted-foreground">
              {data.totalLicenses > 0 ? ((data.availableLicenses / data.totalLicenses) * 100).toFixed(1) : 0}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Use</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.assignedLicenses}</div>
            <p className="text-xs text-muted-foreground">
              {data.totalLicenses > 0 ? ((data.assignedLicenses / data.totalLicenses) * 100).toFixed(1) : 0}% assigned
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.expiringLicenses}</div>
            <p className="text-xs text-muted-foreground">
              Next 90 days
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>License Directory</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <input
                  placeholder="Search licenses..."
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
              <span>Showing {data.licenses.length} of {data.totalLicenses} licenses</span>
            </div>

            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 font-medium text-sm text-muted-foreground border-b pb-2">
              <div className="col-span-3">License</div>
              <div className="col-span-2">Category</div>
              <div className="col-span-2">Assigned To</div>
              <div className="col-span-2">Expiry Date</div>
              <div className="col-span-1">Status</div>
              <div className="col-span-1">Seats</div>
              <div className="col-span-1">Actions</div>
            </div>

            {/* Table Rows */}
            {data.licenses.length > 0 ? (
              data.licenses.map((license) => (
                <div key={license.id} className="grid grid-cols-12 gap-4 items-center py-4 border-b border-border/50 hover:bg-muted/50 transition-colors">
                  <div className="col-span-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                        <FileText className="h-5 w-5 text-blue-500" />
                      </div>
                      <div>
                        <div className="font-medium">{license.software_name}</div>
                        <div className="text-sm text-muted-foreground">
                          {license.manufacturer?.name || 'Unknown Manufacturer'}
                        </div>
                        {license.version && (
                          <div className="text-xs text-muted-foreground">
                            v{license.version}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="col-span-2">
                    <Badge variant="outline">
                      {license.category?.name || 'Uncategorized'}
                    </Badge>
                  </div>
                  <div className="col-span-2">
                    {license.assigned_to_user ? (
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        <span className="text-sm">
                          {license.assigned_to_user.first_name} {license.assigned_to_user.last_name}
                        </span>
                      </div>
                    ) : license.assigned_to_asset ? (
                      <div className="flex items-center gap-1">
                        <Building className="h-3 w-3" />
                        <span className="text-sm">
                          {license.assigned_to_asset.asset_tag}
                        </span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-sm">Unassigned</span>
                    )}
                  </div>
                  <div className="col-span-2">
                    {license.expiry_date ? (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span className="text-sm">
                          {new Date(license.expiry_date).toLocaleDateString()}
                        </span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-sm">No expiry</span>
                    )}
                  </div>
                  <div className="col-span-1">
                    {getLicenseStatusBadge(license)}
                  </div>
                  <div className="col-span-1">
                    <div className="text-sm">
                      {license.seats_total ? (
                        <span>{license.seats_used || 0}/{license.seats_total}</span>
                      ) : (
                        <span className="text-muted-foreground">N/A</span>
                      )}
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
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No licenses found</h3>
                <p className="text-muted-foreground mb-4">
                  Get started by adding software licenses to track compliance.
                </p>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First License
                </Button>
              </div>
            )}

            {/* Pagination */}
            {data.licenses.length > 0 && (
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="text-sm text-muted-foreground">
                  Showing {data.licenses.length} of {data.totalLicenses} licenses
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

export default function LicensesPage() {
  return (
    <div className="p-6">
      <Suspense fallback={<LicensesLoading />}>
        <LicensesContent />
      </Suspense>
    </div>
  )
} 