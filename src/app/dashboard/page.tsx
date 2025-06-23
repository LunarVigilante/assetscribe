'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
// Layout is handled by root layout, no need to import MainLayout
import { PlusCircle, AlertTriangle, Clock, Package, Users, HardDrive } from 'lucide-react'

// Dashboard widget data types
interface DashboardData {
  assetsByStatus: { status: string; count: number; color?: string }[]
  assetsByCategory: { category: string; count: number }[]
  upcomingExpirations: { id: number; asset_tag: string; type: string; expiry_date: string }[]
  recentActivity: { id: number; action: string; asset_tag: string; user: string; timestamp: string }[]
  lowStockConsumables: { id: number; name: string; current_stock: number; min_stock: number }[]
  outOfStandardAssets: { id: number; asset_tag: string; model: string; issue: string }[]
  upcomingVerifications: { id: number; type: string; name: string; due_date: string }[]
}

export default function DashboardPage() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // TODO: Replace with actual API call
    // This simulates the dashboard data as described in the blueprint
    const mockData: DashboardData = {
      assetsByStatus: [
        { status: 'Deployed', count: 1247, color: '#10b981' },
        { status: 'In-Stock', count: 89, color: '#3b82f6' },
        { status: 'In-Repair', count: 23, color: '#f59e0b' },
        { status: 'Archived', count: 156, color: '#6b7280' },
      ],
      assetsByCategory: [
        { category: 'Laptops', count: 456 },
        { category: 'Desktops', count: 234 },
        { category: 'Monitors', count: 567 },
        { category: 'Mobile Devices', count: 123 },
        { category: 'Servers', count: 45 },
      ],
      upcomingExpirations: [
        { id: 1, asset_tag: 'LT-001', type: 'Warranty', expiry_date: '2024-07-15' },
        { id: 2, asset_tag: 'SR-045', type: 'Support Contract', expiry_date: '2024-07-20' },
        { id: 3, asset_tag: 'SW-123', type: 'Software License', expiry_date: '2024-07-25' },
      ],
      recentActivity: [
        { id: 1, action: 'Checked out', asset_tag: 'LT-234', user: 'John Doe', timestamp: '2024-06-20 10:30' },
        { id: 2, action: 'Created', asset_tag: 'DT-567', user: 'Jane Smith', timestamp: '2024-06-20 09:15' },
        { id: 3, action: 'Updated', asset_tag: 'MN-890', user: 'Bob Wilson', timestamp: '2024-06-19 16:45' },
      ],
      lowStockConsumables: [
        { id: 1, name: 'HP 85A Black Toner', current_stock: 2, min_stock: 5 },
        { id: 2, name: 'Zebra 4x6 Labels', current_stock: 1, min_stock: 3 },
      ],
      outOfStandardAssets: [
        { id: 1, asset_tag: 'LT-101', model: 'Dell Latitude 5420', issue: 'Running Windows 10' },
        { id: 2, asset_tag: 'DT-205', model: 'HP EliteDesk 800', issue: 'RAM < 16GB' },
        { id: 3, asset_tag: 'LT-309', model: 'Lenovo ThinkPad X1', issue: 'Using HDD instead of SSD' },
      ],
      upcomingVerifications: [
        { id: 1, type: 'User', name: 'Alice Johnson', due_date: '2024-06-25' },
        { id: 2, type: 'Asset', name: 'SR-001 (Primary Server)', due_date: '2024-06-28' },
      ],
    }

    // Simulate API delay
    setTimeout(() => {
      setDashboardData(mockData)
      setLoading(false)
    }, 1000)
  }, [])

  if (loading) {
    return (
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-20 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (!dashboardData) return null

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">AssetScribe Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome to your Asset and Configuration Management Platform
          </p>
        </div>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Quick Add Asset
        </Button>
      </div>

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Assets by Status Widget */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <HardDrive className="mr-2 h-5 w-5" />
              Assets by Status
            </CardTitle>
            <CardDescription>Current distribution of asset statuses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {dashboardData.assetsByStatus.map((item) => (
                <div key={item.status} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm">{item.status}</span>
                  </div>
                  <Badge variant="secondary">{item.count}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Assets by Category Widget */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Package className="mr-2 h-5 w-5" />
              Assets by Category
            </CardTitle>
            <CardDescription>Asset breakdown by type</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {dashboardData.assetsByCategory.map((item) => (
                <div key={item.category} className="flex items-center justify-between">
                  <span className="text-sm">{item.category}</span>
                  <Badge variant="outline">{item.count}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Expirations Widget */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="mr-2 h-5 w-5" />
              Upcoming Expirations
            </CardTitle>
            <CardDescription>Items expiring within 30 days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {dashboardData.upcomingExpirations.map((item) => (
                <div key={item.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{item.asset_tag}</p>
                    <p className="text-xs text-muted-foreground">{item.type}</p>
                  </div>
                  <Badge variant="destructive" className="text-xs">
                    {new Date(item.expiry_date).toLocaleDateString()}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Out-of-Standard Assets Widget */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="mr-2 h-5 w-5 text-amber-500" />
              Non-Compliant Assets
            </CardTitle>
            <CardDescription>Assets flagged as out-of-standard</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {dashboardData.outOfStandardAssets.map((item) => (
                <div key={item.id} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{item.asset_tag}</span>
                    <Badge variant="destructive" className="text-xs">
                      Non-Compliant
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{item.model}</p>
                  <p className="text-xs text-amber-600">{item.issue}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Low Stock Consumables Widget */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Package className="mr-2 h-5 w-5" />
              Low Stock Alerts
            </CardTitle>
            <CardDescription>Consumables below minimum stock</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {dashboardData.lowStockConsumables.map((item) => (
                <div key={item.id} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{item.name}</span>
                    <Badge variant="destructive">
                      {item.current_stock}/{item.min_stock}
                    </Badge>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-destructive h-2 rounded-full" 
                      style={{ width: `${(item.current_stock / item.min_stock) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Verifications Widget */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="mr-2 h-5 w-5" />
              Upcoming Verifications
            </CardTitle>
            <CardDescription>Scheduled data verification tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {dashboardData.upcomingVerifications.map((item) => (
                <div key={item.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{item.type} Verification</p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {new Date(item.due_date).toLocaleDateString()}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

      </div>

      {/* Recent Activity Section */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest asset management activities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {dashboardData.recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                  </div>
                  <div>
                    <p className="text-sm">
                      <span className="font-medium">{activity.user}</span> {activity.action.toLowerCase()} asset{' '}
                      <span className="font-medium">{activity.asset_tag}</span>
                    </p>
                    <p className="text-xs text-muted-foreground">{activity.timestamp}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
             </Card>
     </div>
  )
} 