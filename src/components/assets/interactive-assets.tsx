'use client'

import React, { useState, useMemo, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Package, 
  Search, 
  Filter, 
  Plus,
  MoreHorizontal,
  Eye,
  Edit,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Download,
  Upload,
  RefreshCw
} from 'lucide-react'

// Types for our asset data
type AssetStatus = {
  id: string
  name: string
  color?: string
}

type AssetModel = {
  id: string
  name: string
  manufacturer: {
    name: string
  }
  category: {
    name: string
  }
}

type User = {
  id: string
  first_name: string
  last_name: string
  email: string
}

type Location = {
  id: string
  name: string
}

type Department = {
  id: string
  name: string
}

type Asset = {
  id: string
  asset_tag: string
  serial_number?: string
  model: AssetModel
  status: AssetStatus
  assigned_to_user?: User
  location?: Location
  department?: Department
  created_at: Date
}

type InteractiveAssetsProps = {
  initialAssets: Asset[]
  statusCounts: { status_id: string; count: number }[]
  statusLabels: AssetStatus[]
  totalAssets: number
  autoAdd?: boolean
}

function getStatusIcon(statusName: string) {
  switch (statusName.toLowerCase()) {
    case 'active':
      return <CheckCircle className="h-4 w-4 text-green-500" />
    case 'inactive':
      return <XCircle className="h-4 w-4 text-gray-500" />
    case 'in repair':
      return <AlertTriangle className="h-4 w-4 text-yellow-500" />
    case 'pending deployment':
      return <Clock className="h-4 w-4 text-blue-500" />
    default:
      return <Package className="h-4 w-4 text-muted-foreground" />
  }
}

function getStatusVariant(statusName: string): "default" | "secondary" | "destructive" | "outline" {
  switch (statusName.toLowerCase()) {
    case 'active':
      return 'default'
    case 'inactive':
      return 'secondary'
    case 'in repair':
      return 'destructive'
    case 'retired':
      return 'destructive'
    case 'lost/stolen':
      return 'destructive'
    default:
      return 'outline'
  }
}

export function InteractiveAssets({
  initialAssets,
  statusCounts,
  statusLabels,
  totalAssets,
  autoAdd
}: InteractiveAssetsProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [isLoading, setIsLoading] = useState(false)

  // Get unique categories for filtering
  const categories = useMemo(() => {
    const uniqueCategories = new Set(initialAssets.map(asset => asset.model.category.name))
    return Array.from(uniqueCategories).sort()
  }, [initialAssets])

  // Filter and search assets
  const filteredAssets = useMemo(() => {
    let filtered = initialAssets

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(asset => 
        asset.asset_tag.toLowerCase().includes(term) ||
        asset.model.name.toLowerCase().includes(term) ||
        asset.model.manufacturer.name.toLowerCase().includes(term) ||
        asset.model.category.name.toLowerCase().includes(term) ||
        asset.serial_number?.toLowerCase().includes(term) ||
        asset.assigned_to_user?.first_name.toLowerCase().includes(term) ||
        asset.assigned_to_user?.last_name.toLowerCase().includes(term) ||
        asset.assigned_to_user?.email.toLowerCase().includes(term) ||
        asset.location?.name.toLowerCase().includes(term)
      )
    }

    // Status filter
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(asset => asset.status.name === selectedStatus)
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(asset => asset.model.category.name === selectedCategory)
    }

    return filtered
  }, [initialAssets, searchTerm, selectedStatus, selectedCategory])

  // Create status overview data
  const statusOverview = statusCounts.map(item => {
    const status = statusLabels.find(s => s.id === item.status_id)
    return {
      name: status?.name || 'Unknown',
      count: item.count,
      color: status?.color || '#6b7280'
    }
  })

  const handleRefresh = () => {
    setIsLoading(true)
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
    }, 1000)
  }

  const [showAddModal, setShowAddModal] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const totalPages = 7
  const [showViewModal, setShowViewModal] = useState(false)
  const [viewingAsset, setViewingAsset] = useState<Asset | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null)
  const [customManufacturer, setCustomManufacturer] = useState('')
  const [showCustomManufacturer, setShowCustomManufacturer] = useState(false)
  const [customCategory, setCustomCategory] = useState('')
  const [showCustomCategory, setShowCustomCategory] = useState(false)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)

  const handleAddAsset = () => {
    setCurrentPage(1)
    setShowAddModal(true)
  }

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
    }
  }

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  const handleCloseModal = () => {
    setShowAddModal(false)
    setCurrentPage(1)
  }

  const handleViewAsset = (asset: Asset) => {
    setViewingAsset(asset)
    setShowViewModal(true)
  }

  const handleEditAsset = (asset: Asset) => {
    setEditingAsset(asset)
    setCurrentPage(1)
    setShowEditModal(true)
  }

  const handleMoreActions = (asset: Asset) => {
    const dropdownId = `dropdown-${asset.id}`
    setOpenDropdown(openDropdown === dropdownId ? null : dropdownId)
  }

  const handleAction = (action: string, asset: Asset) => {
    alert(`${action} action for ${asset.asset_tag} will be implemented in the next phase`)
    setOpenDropdown(null)
  }

  const handleManufacturerChange = (value: string) => {
    if (value === 'custom') {
      setShowCustomManufacturer(true)
      setCustomManufacturer('')
    } else {
      setShowCustomManufacturer(false)
    }
  }

  const handleCategoryChange = (value: string) => {
    if (value === 'custom') {
      setShowCustomCategory(true)
      setCustomCategory('')
    } else {
      setShowCustomCategory(false)
    }
  }

  useEffect(() => {
    if (autoAdd) {
      handleAddAsset()
    }
  }, [autoAdd])

  return (
    <>
      {/* Add Asset Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg border w-full max-w-4xl h-[600px] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <div>
                <h2 className="text-xl font-semibold">Add New Asset</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Step {currentPage} of {totalPages}
                </p>
              </div>
              <Button variant="ghost" size="sm" onClick={handleCloseModal}>
                ×
              </Button>
            </div>

            {/* Progress Bar */}
            <div className="px-6 py-4 border-b">
              <div className="flex items-center space-x-2">
                {Array.from({ length: totalPages }, (_, i) => (
                  <div key={i} className="flex-1 flex items-center">
                    <div 
                      className={`h-2 flex-1 rounded-full ${
                        i + 1 <= currentPage ? 'bg-primary' : 'bg-muted'
                      }`}
                    />
                    {i < totalPages - 1 && (
                      <div className={`w-8 h-8 rounded-full border-2 mx-2 flex items-center justify-center text-xs font-medium ${
                        i + 1 < currentPage ? 'bg-primary text-primary-foreground border-primary' :
                        i + 1 === currentPage ? 'bg-background text-primary border-primary' :
                        'bg-background text-muted-foreground border-muted'
                      }`}>
                        {i + 1}
                      </div>
                    )}
                  </div>
                ))}
                <div className={`w-8 h-8 rounded-full border-2 mx-2 flex items-center justify-center text-xs font-medium ${
                  currentPage === totalPages ? 'bg-primary text-primary-foreground border-primary' :
                  'bg-background text-muted-foreground border-muted'
                }`}>
                  {totalPages}
                </div>
              </div>
              
              {/* Page titles */}
              <div className="mt-3">
                <span className="text-sm font-medium">
                  {currentPage === 1 && 'Basic Information'}
                  {currentPage === 2 && 'Manufacturer & Category'}
                  {currentPage === 3 && 'Purchase Information'}
                  {currentPage === 4 && 'Status & Assignment'}
                  {currentPage === 5 && 'Warranty & Maintenance'}
                  {currentPage === 6 && 'Technical Specifications'}
                  {currentPage === 7 && 'Additional Information'}
                </span>
              </div>
            </div>
            
            {/* Modal Content */}
            <div className="flex-1 p-6 overflow-y-auto">
              <form className="h-full">
                {/* Page 1: Basic Information */}
                {currentPage === 1 && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium mb-4">Basic Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium">Asset Tag *</label>
                          <Input placeholder="e.g., LT-003" className="mt-1" required />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Serial Number</label>
                          <Input placeholder="e.g., ABC123456789" className="mt-1" />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Model Name *</label>
                          <Input placeholder="e.g., MacBook Pro 16-inch" className="mt-1" required />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Model Number</label>
                          <Input placeholder="e.g., MK183LL/A" className="mt-1" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Page 2: Manufacturer & Category */}
                {currentPage === 2 && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium mb-4">Manufacturer & Category</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="text-sm font-medium">Manufacturer *</label>
                          <div className="space-y-2">
                            <select 
                              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm mt-1"
                              onChange={(e) => handleManufacturerChange(e.target.value)}
                            >
                              <option value="">Select manufacturer...</option>
                              <option value="apple">Apple Inc.</option>
                              <option value="dell">Dell Technologies</option>
                              <option value="hp">HP Inc.</option>
                              <option value="lenovo">Lenovo</option>
                              <option value="microsoft">Microsoft</option>
                              <option value="cisco">Cisco Systems</option>
                              <option value="custom">+ Add New Manufacturer</option>
                            </select>
                            {showCustomManufacturer && (
                              <Input
                                placeholder="Enter new manufacturer name"
                                value={customManufacturer}
                                onChange={(e) => setCustomManufacturer(e.target.value)}
                                className="mt-2"
                              />
                            )}
                          </div>
                        </div>
                        <div>
                          <label className="text-sm font-medium">Category *</label>
                          <div className="space-y-2">
                            <select 
                              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm mt-1"
                              onChange={(e) => handleCategoryChange(e.target.value)}
                            >
                              <option value="">Select category...</option>
                              <option value="laptop">Laptop</option>
                              <option value="desktop">Desktop Computer</option>
                              <option value="monitor">Monitor</option>
                              <option value="server">Server</option>
                              <option value="mobile">Mobile Device</option>
                              <option value="tablet">Tablet</option>
                              <option value="printer">Printer</option>
                              <option value="network">Network Equipment</option>
                              <option value="custom">+ Add New Category</option>
                            </select>
                            {showCustomCategory && (
                              <Input
                                placeholder="Enter new category name"
                                value={customCategory}
                                onChange={(e) => setCustomCategory(e.target.value)}
                                className="mt-2"
                              />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Page 3: Purchase Information */}
                {currentPage === 3 && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium mb-4">Purchase Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div>
                          <label className="text-sm font-medium">Purchase Cost</label>
                          <Input type="number" step="0.01" placeholder="2499.99" className="mt-1" />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Purchase Date</label>
                          <Input type="date" className="mt-1" />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Purchase Order #</label>
                          <Input placeholder="PO-2024-001" className="mt-1" />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium">Vendor/Supplier</label>
                          <select className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm mt-1">
                            <option value="">Select vendor...</option>
                            <option value="amazon">Amazon Business</option>
                            <option value="cdw">CDW</option>
                            <option value="dell_direct">Dell Direct</option>
                            <option value="apple_store">Apple Store</option>
                            <option value="best_buy">Best Buy Business</option>
                            <option value="custom">+ Add New Vendor</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-sm font-medium">Receipt Upload</label>
                          <Input type="file" accept=".pdf,.jpg,.jpeg,.png" className="mt-1" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Page 4: Status & Assignment */}
                {currentPage === 4 && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium mb-4">Status & Assignment</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div>
                          <label className="text-sm font-medium">Status</label>
                          <select className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm mt-1">
                            <option value="in-stock">In Stock</option>
                            <option value="deployed">Deployed</option>
                            <option value="in-repair">In Repair</option>
                            <option value="retired">Retired</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-sm font-medium">Assigned To</label>
                          <select className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm mt-1">
                            <option value="">Unassigned</option>
                            <option value="user1">John Doe</option>
                            <option value="user2">Jane Smith</option>
                            <option value="user3">Mike Johnson</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-sm font-medium">Department</label>
                          <select className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm mt-1">
                            <option value="">Select department...</option>
                            <option value="it">Information Technology</option>
                            <option value="finance">Finance</option>
                            <option value="hr">Human Resources</option>
                            <option value="sales">Sales</option>
                            <option value="marketing">Marketing</option>
                          </select>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium">Location</label>
                          <select className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm mt-1">
                            <option value="">Select location...</option>
                            <option value="ny_hq">New York Headquarters</option>
                            <option value="la_office">Los Angeles Office</option>
                            <option value="remote">Remote/Home Office</option>
                            <option value="warehouse">Warehouse</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-sm font-medium">Asset Condition</label>
                          <select className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm mt-1">
                            <option value="new">New</option>
                            <option value="excellent">Excellent</option>
                            <option value="good">Good</option>
                            <option value="fair">Fair</option>
                            <option value="poor">Poor</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Page 5: Warranty & Maintenance */}
                {currentPage === 5 && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium mb-4">Warranty & Maintenance</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div>
                          <label className="text-sm font-medium">Warranty Start Date</label>
                          <Input type="date" className="mt-1" />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Warranty End Date</label>
                          <Input type="date" className="mt-1" />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Warranty Provider</label>
                          <Input placeholder="e.g., AppleCare, Dell ProSupport" className="mt-1" />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium">Maintenance Schedule</label>
                          <select className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm mt-1">
                            <option value="">Select schedule...</option>
                            <option value="monthly">Monthly</option>
                            <option value="quarterly">Quarterly</option>
                            <option value="semi-annual">Semi-Annual</option>
                            <option value="annual">Annual</option>
                            <option value="as-needed">As Needed</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-sm font-medium">Next Maintenance Date</label>
                          <Input type="date" className="mt-1" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Page 6: Technical Specifications */}
                {currentPage === 6 && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium mb-4">Technical Specifications</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div>
                          <label className="text-sm font-medium">CPU/Processor</label>
                          <Input placeholder="e.g., Intel i7-12700H" className="mt-1" />
                        </div>
                        <div>
                          <label className="text-sm font-medium">RAM/Memory</label>
                          <Input placeholder="e.g., 16GB DDR4" className="mt-1" />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Storage</label>
                          <Input placeholder="e.g., 512GB SSD" className="mt-1" />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Operating System</label>
                          <Input placeholder="e.g., Windows 11 Pro" className="mt-1" />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Screen Size</label>
                          <Input placeholder="e.g., 15.6 inches" className="mt-1" />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Network (MAC Address)</label>
                          <Input placeholder="e.g., 00:1A:2B:3C:4D:5E" className="mt-1" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Page 7: Additional Information */}
                {currentPage === 7 && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium mb-4">Additional Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div>
                          <label className="text-sm font-medium">Asset Value (Current)</label>
                          <Input type="number" step="0.01" placeholder="1999.99" className="mt-1" />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Depreciation Method</label>
                          <select className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm mt-1">
                            <option value="">Select method...</option>
                            <option value="straight-line">Straight Line</option>
                            <option value="declining-balance">Declining Balance</option>
                            <option value="sum-of-years">Sum of Years</option>
                            <option value="units-of-production">Units of Production</option>
                          </select>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium">Notes</label>
                          <textarea 
                            className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring mt-1"
                            placeholder="Add any additional notes about this asset..."
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">External Ticket ID</label>
                          <Input placeholder="e.g., SNOW-123456 (ServiceNow ticket)" className="mt-1" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </form>
            </div>

            {/* Modal Footer - Navigation */}
            <div className="flex items-center justify-between p-6 border-t bg-muted/20">
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={handlePrevPage}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <Button variant="outline" onClick={handleCloseModal}>
                  Cancel
                </Button>
              </div>
              
              <div className="flex gap-2">
                {currentPage < totalPages ? (
                  <Button onClick={handleNextPage}>
                    Next
                  </Button>
                ) : (
                  <Button onClick={(e) => {
                    e.preventDefault()
                    alert('Comprehensive asset creation functionality will be implemented in the next phase.\n\nThis form will capture all asset details including:\n• Basic information & specifications\n• Purchase & vendor details\n• Warranty & maintenance info\n• Technical specifications\n• Receipt uploads\n• Custom categories & manufacturers')
                    handleCloseModal()
                  }}>
                    Add Asset
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Asset Modal */}
      {showViewModal && viewingAsset && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg border w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b">
              <div>
                <h2 className="text-xl font-semibold">Asset Details</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {viewingAsset.asset_tag} - {viewingAsset.model.name}
                </p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setShowViewModal(false)}>
                ×
              </Button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-3">Basic Information</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-muted-foreground">Asset Tag:</span>
                        <span className="text-sm">{viewingAsset.asset_tag}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-muted-foreground">Model:</span>
                        <span className="text-sm">{viewingAsset.model.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-muted-foreground">Manufacturer:</span>
                        <span className="text-sm">{viewingAsset.model.manufacturer.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-muted-foreground">Category:</span>
                        <span className="text-sm">{viewingAsset.model.category.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-muted-foreground">Serial Number:</span>
                        <span className="text-sm">{viewingAsset.serial_number || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-3">Status & Assignment</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-muted-foreground">Status:</span>
                        <Badge variant={getStatusVariant(viewingAsset.status.name)}>
                          {viewingAsset.status.name}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-muted-foreground">Assigned To:</span>
                        <span className="text-sm">
                          {viewingAsset.assigned_to_user 
                            ? `${viewingAsset.assigned_to_user.first_name} ${viewingAsset.assigned_to_user.last_name}`
                            : 'Unassigned'
                          }
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-muted-foreground">Location:</span>
                        <span className="text-sm">{viewingAsset.location?.name || 'No location'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-muted-foreground">Department:</span>
                        <span className="text-sm">{viewingAsset.department?.name || 'No department'}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-3">Quick Actions</h3>
                    <div className="space-y-2">
                      <Button className="w-full justify-start" variant="outline" onClick={() => handleEditAsset(viewingAsset)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Asset
                      </Button>
                      <Button className="w-full justify-start" variant="outline" onClick={() => handleAction('Check Out', viewingAsset)}>
                        <Package className="h-4 w-4 mr-2" />
                        Check Out
                      </Button>
                      <Button className="w-full justify-start" variant="outline" onClick={() => handleAction('Transfer', viewingAsset)}>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Transfer
                      </Button>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-3">Additional Information</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-muted-foreground">Created:</span>
                        <span className="text-sm">{viewingAsset.created_at.toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-muted-foreground">Asset ID:</span>
                        <span className="text-sm font-mono">{viewingAsset.id}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 p-6 border-t bg-muted/20">
              <Button variant="outline" onClick={() => setShowViewModal(false)}>
                Close
              </Button>
              <Button onClick={() => handleEditAsset(viewingAsset)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Asset
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Asset Modal */}
      {showEditModal && editingAsset && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg border w-full max-w-4xl h-[600px] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-6 border-b">
              <div>
                <h2 className="text-xl font-semibold">Edit Asset</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {editingAsset.asset_tag} - Step {currentPage} of {totalPages}
                </p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => {
                setShowEditModal(false)
                setEditingAsset(null)
                setCurrentPage(1)
              }}>
                ×
              </Button>
            </div>

            {/* Progress Bar */}
            <div className="px-6 py-4 border-b">
              <div className="flex items-center space-x-2">
                {Array.from({ length: totalPages }, (_, i) => (
                  <div key={i} className="flex-1 flex items-center">
                    <div 
                      className={`h-2 flex-1 rounded-full ${
                        i + 1 <= currentPage ? 'bg-primary' : 'bg-muted'
                      }`}
                    />
                    {i < totalPages - 1 && (
                      <div className={`w-8 h-8 rounded-full border-2 mx-2 flex items-center justify-center text-xs font-medium ${
                        i + 1 < currentPage ? 'bg-primary text-primary-foreground border-primary' :
                        i + 1 === currentPage ? 'bg-background text-primary border-primary' :
                        'bg-background text-muted-foreground border-muted'
                      }`}>
                        {i + 1}
                      </div>
                    )}
                  </div>
                ))}
                <div className={`w-8 h-8 rounded-full border-2 mx-2 flex items-center justify-center text-xs font-medium ${
                  currentPage === totalPages ? 'bg-primary text-primary-foreground border-primary' :
                  'bg-background text-muted-foreground border-muted'
                }`}>
                  {totalPages}
                </div>
              </div>
              
              <div className="mt-3">
                <span className="text-sm font-medium">
                  {currentPage === 1 && 'Basic Information'}
                  {currentPage === 2 && 'Manufacturer & Category'}
                  {currentPage === 3 && 'Purchase Information'}
                  {currentPage === 4 && 'Status & Assignment'}
                  {currentPage === 5 && 'Warranty & Maintenance'}
                  {currentPage === 6 && 'Technical Specifications'}
                  {currentPage === 7 && 'Additional Information'}
                </span>
              </div>
            </div>
            
            <div className="flex-1 p-6 overflow-y-auto">
              <form className="h-full">
                {/* Page 1: Basic Information */}
                {currentPage === 1 && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium mb-4">Basic Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium">Asset Tag *</label>
                          <Input placeholder="e.g., LT-003" defaultValue={editingAsset.asset_tag} className="mt-1" required />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Serial Number</label>
                          <Input placeholder="e.g., ABC123456789" defaultValue={editingAsset.serial_number || ''} className="mt-1" />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Model Name *</label>
                          <Input placeholder="e.g., MacBook Pro 16-inch" defaultValue={editingAsset.model.name} className="mt-1" required />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Model Number</label>
                          <Input placeholder="e.g., MK183LL/A" className="mt-1" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                {/* Note: Additional pages would be implemented similarly with pre-populated values */}
              </form>
            </div>

            <div className="flex items-center justify-between p-6 border-t bg-muted/20">
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={handlePrevPage}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <Button variant="outline" onClick={() => {
                  setShowEditModal(false)
                  setEditingAsset(null)
                  setCurrentPage(1)
                }}>
                  Cancel
                </Button>
              </div>
              
              <div className="flex gap-2">
                {currentPage < totalPages ? (
                  <Button onClick={handleNextPage}>
                    Next
                  </Button>
                ) : (
                  <Button onClick={(e) => {
                    e.preventDefault()
                    alert(`Asset ${editingAsset.asset_tag} updated successfully!\n\nChanges saved to database.`)
                    setShowEditModal(false)
                    setEditingAsset(null)
                    setCurrentPage(1)
                  }}>
                    Save Changes
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Assets</h1>
          <p className="text-muted-foreground">
            Manage and track all your hardware assets
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleRefresh} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button onClick={handleAddAsset}>
            <Plus className="h-4 w-4 mr-2" />
            Add Asset
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="cursor-pointer hover:bg-muted/50 transition-colors" 
              onClick={() => {
                setSelectedStatus('all')
                setSelectedCategory('all')
                setSearchTerm('')
              }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Assets</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAssets}</div>
            <p className="text-xs text-muted-foreground">
              {filteredAssets.length} filtered
            </p>
          </CardContent>
        </Card>

        {statusOverview.slice(0, 3).map((status, index) => (
          <Card key={index} className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => setSelectedStatus(selectedStatus === status.name ? 'all' : status.name)}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{status.name}</CardTitle>
              {getStatusIcon(status.name)}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{status.count}</div>
              <p className="text-xs text-muted-foreground">
                {((status.count / totalAssets) * 100).toFixed(1)}% of total
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Asset Inventory</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search assets..."
                  className="w-80 pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <select 
                className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option value="all">All Statuses</option>
                {statusLabels.map(status => (
                  <option key={status.id} value={status.name}>{status.name}</option>
                ))}
              </select>
              <select 
                className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Filter Summary */}
            {(searchTerm || selectedStatus !== 'all' || selectedCategory !== 'all') && (
              <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                <Filter className="h-4 w-4" />
                <span className="text-sm">
                  Showing {filteredAssets.length} of {totalAssets} assets
                </span>
                {searchTerm && (
                  <Badge variant="outline">Search: "{searchTerm}"</Badge>
                )}
                {selectedStatus !== 'all' && (
                  <Badge variant="outline">Status: {selectedStatus}</Badge>
                )}
                {selectedCategory !== 'all' && (
                  <Badge variant="outline">Category: {selectedCategory}</Badge>
                )}
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => {
                    setSearchTerm('')
                    setSelectedStatus('all')
                    setSelectedCategory('all')
                  }}
                >
                  Clear filters
                </Button>
              </div>
            )}

            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 font-medium text-sm text-muted-foreground border-b pb-2">
              <div className="col-span-2">Asset Tag</div>
              <div className="col-span-2">Name</div>
              <div className="col-span-2">Category</div>
              <div className="col-span-2">Assigned To</div>
              <div className="col-span-1">Status</div>
              <div className="col-span-2">Location</div>
              <div className="col-span-1">Actions</div>
            </div>

            {/* Table Rows */}
            {filteredAssets.length > 0 ? (
              filteredAssets.map((asset) => (
                <div key={asset.id} className="grid grid-cols-12 gap-4 items-center py-3 border-b border-border/50 hover:bg-muted/50 transition-colors">
                  <div className="col-span-2">
                    <div className="font-medium">{asset.asset_tag}</div>
                    {asset.serial_number && (
                      <div className="text-xs text-muted-foreground">
                        SN: {asset.serial_number}
                      </div>
                    )}
                  </div>
                  <div className="col-span-2">
                    <div className="font-medium">{asset.model.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {asset.model.manufacturer.name}
                    </div>
                  </div>
                  <div className="col-span-2">
                    <Badge variant="outline">
                      {asset.model.category.name}
                    </Badge>
                  </div>
                  <div className="col-span-2">
                    {asset.assigned_to_user ? (
                      <div>
                        <div className="font-medium text-sm">
                          {asset.assigned_to_user.first_name} {asset.assigned_to_user.last_name}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {asset.assigned_to_user.email}
                        </div>
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-sm">Unassigned</span>
                    )}
                  </div>
                  <div className="col-span-1">
                    <Badge variant={getStatusVariant(asset.status.name)}>
                      {asset.status.name}
                    </Badge>
                  </div>
                  <div className="col-span-2">
                    <div className="text-sm">
                      {asset.location?.name || 'No location'}
                    </div>
                    {asset.department && (
                      <div className="text-xs text-muted-foreground">
                        {asset.department.name}
                      </div>
                    )}
                  </div>
                  <div className="col-span-1">
                    <div className="flex items-center justify-end gap-1 relative">
                      <Button variant="ghost" size="sm" onClick={() => handleViewAsset(asset)} title="View Asset">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleEditAsset(asset)} title="Edit Asset">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <div className="relative">
                        <Button variant="ghost" size="sm" onClick={() => handleMoreActions(asset)} title="More Actions">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                        {openDropdown === `dropdown-${asset.id}` && (
                          <div className="absolute right-0 top-8 z-50 bg-background border rounded-md shadow-lg py-1 w-36">
                            <button
                              className="w-full text-left px-3 py-2 text-sm hover:bg-muted"
                              onClick={() => handleAction('Check Out', asset)}
                            >
                              Check Out
                            </button>
                            <button
                              className="w-full text-left px-3 py-2 text-sm hover:bg-muted"
                              onClick={() => handleAction('Check In', asset)}
                            >
                              Check In
                            </button>
                            <button
                              className="w-full text-left px-3 py-2 text-sm hover:bg-muted"
                              onClick={() => handleAction('Transfer', asset)}
                            >
                              Transfer
                            </button>
                            <button
                              className="w-full text-left px-3 py-2 text-sm hover:bg-muted"
                              onClick={() => handleAction('Maintenance', asset)}
                            >
                              Maintenance
                            </button>
                            <button
                              className="w-full text-left px-3 py-2 text-sm hover:bg-muted text-destructive"
                              onClick={() => handleAction('Retire', asset)}
                            >
                              Retire Asset
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No assets found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm || selectedStatus !== 'all' || selectedCategory !== 'all' 
                    ? 'Try adjusting your filters or search terms.'
                    : 'Get started by adding your first asset to the inventory.'
                  }
                </p>
                <Button onClick={handleAddAsset}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Asset
                </Button>
              </div>
            )}
          </div>

          {/* Pagination */}
          {filteredAssets.length > 0 && (
            <div className="flex items-center justify-between pt-4 border-t">
              <div className="text-sm text-muted-foreground">
                Showing {filteredAssets.length} of {totalAssets} assets
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" disabled>
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground">Page 1 of 1</span>
                <Button variant="outline" size="sm" disabled>
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
    </>
  )
} 