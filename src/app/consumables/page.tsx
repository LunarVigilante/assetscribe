import React, { Suspense } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Package, 
  Search, 
  Filter, 
  Plus,
  MoreHorizontal,
  Eye,
  Edit,
  AlertTriangle,
  CheckCircle,
  TrendingDown,
  TrendingUp,
  Building,
  Loader2
} from 'lucide-react'
import { prisma } from '@/lib/prisma'

async function getConsumablesData() {
  try {
    // Get consumables with related data
    const consumables = await prisma.consumable.findMany({
      include: {
        category: true,
        manufacturer: true,
        compatible_models: {
          include: {
            model: {
              include: {
                manufacturer: true,
                category: true
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

    // Get consumable statistics
    const totalConsumables = await prisma.consumable.count()
    
    // Count low stock items (using raw query for comparison)
    const allConsumables = await prisma.consumable.findMany()
    const lowStockConsumables = allConsumables.filter(c => c.current_stock <= c.min_stock_level)
    const lowStockCount = lowStockConsumables.length
    
    const outOfStockCount = await prisma.consumable.count({
      where: {
        current_stock: 0
      }
    })
    const wellStockedCount = totalConsumables - lowStockCount

    // Get categories
    const categories = await prisma.category.findMany({
      orderBy: {
        name: 'asc'
      }
    })

    // Get manufacturers
    const manufacturers = await prisma.manufacturer.findMany({
      orderBy: {
        name: 'asc'
      }
    })

    return {
      consumables,
      categories,
      manufacturers,
      totalConsumables,
      lowStockCount,
      outOfStockCount,
      wellStockedCount
    }
  } catch (error) {
    console.error('Error fetching consumables:', error)
    return {
      consumables: [],
      categories: [],
      manufacturers: [],
      totalConsumables: 0,
      lowStockCount: 0,
      outOfStockCount: 0,
      wellStockedCount: 0
    }
  }
}

function ConsumablesLoading() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="flex items-center gap-2">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="text-muted-foreground">Loading consumables...</span>
      </div>
    </div>
  )
}

function getStockStatusBadge(consumable: any) {
  if (consumable.current_stock === 0) {
    return <Badge variant="destructive">Out of Stock</Badge>
  }
  if (consumable.current_stock <= consumable.min_stock_level) {
    return <Badge variant="outline" className="text-amber-600 border-amber-600">Low Stock</Badge>
  }
  return <Badge variant="default">In Stock</Badge>
}

function getStockIcon(consumable: any) {
  if (consumable.current_stock === 0) {
    return <AlertTriangle className="h-4 w-4 text-destructive" />
  }
  if (consumable.current_stock <= consumable.min_stock_level) {
    return <TrendingDown className="h-4 w-4 text-amber-500" />
  }
  return <TrendingUp className="h-4 w-4 text-green-500" />
}

async function ConsumablesContent() {
  const data = await getConsumablesData()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Consumables</h1>
          <p className="text-muted-foreground">
            Manage inventory and stock levels
          </p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Consumable
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalConsumables}</div>
            <p className="text-xs text-muted-foreground">
              Consumable types
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Well Stocked</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.wellStockedCount}</div>
            <p className="text-xs text-muted-foreground">
              {data.totalConsumables > 0 ? ((data.wellStockedCount / data.totalConsumables) * 100).toFixed(1) : 0}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.lowStockCount}</div>
            <p className="text-xs text-muted-foreground">
              Need reordering
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
            <TrendingDown className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.outOfStockCount}</div>
            <p className="text-xs text-muted-foreground">
              Urgent reorder
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Consumable Inventory</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <input
                  placeholder="Search consumables..."
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
              <span>Showing {data.consumables.length} of {data.totalConsumables} consumables</span>
            </div>

            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 font-medium text-sm text-muted-foreground border-b pb-2">
              <div className="col-span-3">Item</div>
              <div className="col-span-2">Category</div>
              <div className="col-span-2">Current Stock</div>
              <div className="col-span-2">Min. Level</div>
              <div className="col-span-1">Status</div>
              <div className="col-span-1">Compatible</div>
              <div className="col-span-1">Actions</div>
            </div>

            {/* Table Rows */}
            {data.consumables.length > 0 ? (
              data.consumables.map((consumable) => (
                <div key={consumable.id} className="grid grid-cols-12 gap-4 items-center py-4 border-b border-border/50 hover:bg-muted/50 transition-colors">
                  <div className="col-span-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                        <Package className="h-5 w-5 text-green-500" />
                      </div>
                      <div>
                        <div className="font-medium">{consumable.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {consumable.manufacturer?.name || 'Unknown Manufacturer'}
                        </div>
                        {consumable.model_number && (
                          <div className="text-xs text-muted-foreground">
                            Model: {consumable.model_number}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="col-span-2">
                    <Badge variant="outline">
                      {consumable.category.name}
                    </Badge>
                  </div>
                  <div className="col-span-2">
                    <div className="flex items-center gap-2">
                      {getStockIcon(consumable)}
                      <span className="font-medium">{consumable.current_stock}</span>
                      <span className="text-muted-foreground text-sm">units</span>
                    </div>
                  </div>
                  <div className="col-span-2">
                    <span className="text-sm">{consumable.min_stock_level} units</span>
                  </div>
                  <div className="col-span-1">
                    {getStockStatusBadge(consumable)}
                  </div>
                  <div className="col-span-1">
                    <div className="text-sm">
                      {consumable.compatible_models.length > 0 ? (
                        <span>{consumable.compatible_models.length} model{consumable.compatible_models.length !== 1 ? 's' : ''}</span>
                      ) : (
                        <span className="text-muted-foreground">None</span>
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
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No consumables found</h3>
                <p className="text-muted-foreground mb-4">
                  Get started by adding consumable items to track inventory.
                </p>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Consumable
                </Button>
              </div>
            )}

            {/* Pagination */}
            {data.consumables.length > 0 && (
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="text-sm text-muted-foreground">
                  Showing {data.consumables.length} of {data.totalConsumables} consumables
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

export default function ConsumablesPage() {
  return (
    <div className="p-6">
      <Suspense fallback={<ConsumablesLoading />}>
        <ConsumablesContent />
      </Suspense>
    </div>
  )
}