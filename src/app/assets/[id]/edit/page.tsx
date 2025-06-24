'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, Package, User, Calendar, FileText, Camera, Upload, Trash2, ExternalLink, CheckCircle, XCircle, AlertCircle, X, Link, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'

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
  device_name?: string
  serial_number?: string
  model: AssetModel
  status: AssetStatus
  assigned_to_user?: User
  location?: Location
  department?: Department
  created_at: Date
  updated_at?: Date
  purchase_date?: Date
  purchase_cost?: number
  warranty_expiry_date?: Date
  notes?: string
  last_verified_date?: Date
  condition?: {
    id: string
    name: string
  }
  maintenance_schedule?: {
    id: string
    name: string
  }
  supplier?: {
    id: string
    name: string
  }
  verification_interval_months?: number
  // Hardware specifications
  cpu?: string
  ram_gb?: number
  storage_type?: string
  storage_size_gb?: number
  screen_size?: string
  gpu?: string
  operating_system?: string
  bitlocker_recovery_key?: string
  // Related links
  related_links?: {
    id?: number
    link_type: string
    title: string
    url: string
    description?: string
  }[]
}

export default function EditAssetPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const [asset, setAsset] = useState<Asset | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [assetId, setAssetId] = useState<string | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    asset_tag: '',
    device_name: '',
    serial_number: '',
    model_name: '',
    model_number: '',
    notes: '',
    // Hardware specs
    cpu: '',
    ram_gb: '',
    storage_type: '',
    storage_size_gb: '',
    screen_size: '',
    gpu: '',
    operating_system: '',
    bitlocker_recovery_key: '',
    // Asset information
    condition_id: '',
    maintenance_schedule_id: '',
    supplier_id: '',
    verification_interval_months: '',
    // Financial information
    purchase_date: '',
    purchase_cost: '',
    warranty_expiry_date: '',
    // Assignment & Location
    assigned_to_user_id: '',
    department_id: '',
    location_id: ''
  })

  // Dropdown data state
  const [manufacturers, setManufacturers] = useState<{id: string, name: string}[]>([])
  const [categories, setCategories] = useState<{id: string, name: string}[]>([])
  const [selectedManufacturer, setSelectedManufacturer] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')

  // Custom addition state
  const [showCustomManufacturer, setShowCustomManufacturer] = useState(false)
  const [customManufacturer, setCustomManufacturer] = useState('')
  const [showCustomCategory, setShowCustomCategory] = useState(false)
  const [customCategory, setCustomCategory] = useState('')

  const [activeTab, setActiveTab] = useState('basic')
  const [isScrolled, setIsScrolled] = useState(false)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [documentFiles, setDocumentFiles] = useState<File[]>([])
  const [relatedLinks, setRelatedLinks] = useState<{
    id?: number
    link_type: string
    title: string
    url: string
    description?: string
  }[]>([])

  // Mock dropdown data - in real app, this would come from API
  const mockUsers = [
    { id: '1', name: 'John Doe', email: 'john@company.com' },
    { id: '2', name: 'Jane Smith', email: 'jane@company.com' },
    { id: '3', name: 'Mike Johnson', email: 'mike@company.com' }
  ]

  const mockDepartments = [
    { id: '1', name: 'Information Technology' },
    { id: '2', name: 'Finance' },
    { id: '3', name: 'Human Resources' }
  ]

  const mockLocations = [
    { id: '1', name: 'New York Headquarters' },
    { id: '2', name: 'Los Angeles Office' },
    { id: '3', name: 'Remote/Home Office' }
  ]

  const mockConditions = [
    { id: '1', name: 'New' },
    { id: '2', name: 'Excellent' },
    { id: '3', name: 'Good' },
    { id: '4', name: 'Fair' }
  ]

  const mockMaintenanceSchedules = [
    { id: '1', name: 'Monthly' },
    { id: '2', name: 'Quarterly' },
    { id: '3', name: 'Annual' }
  ]

  const mockSuppliers = [
    { id: '1', name: 'Dell Technologies' },
    { id: '2', name: 'Apple Inc.' },
    { id: '3', name: 'HP Inc.' }
  ]

  useEffect(() => {
    const getParams = async () => {
      const { id } = await params
      setAssetId(id)
    }
    getParams()
  }, [params])

  // Fetch dropdown data on component mount
  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const response = await fetch('/api/settings/dropdown-lists')
        if (response.ok) {
          const data = await response.json()
          setManufacturers(data.manufacturers.map((m: any) => ({
            id: m.id.toString(),
            name: m.name
          })))
          setCategories(data.categories.map((c: any) => ({
            id: c.id.toString(),
            name: c.name
          })))
        } else {
          console.error('Failed to fetch dropdown data')
        }
      } catch (error) {
        console.error('Error fetching dropdown data:', error)
      }
    }
    fetchDropdownData()
  }, [])

  // Handle scroll events for button fade effect
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY
      setIsScrolled(scrollPosition > 100) // Fade when scrolled more than 100px
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    if (!assetId) return

    const fetchAsset = async () => {
      try {
        const response = await fetch(`/api/assets/${assetId}`)
        if (response.ok) {
          const data = await response.json()
          setAsset(data)
          
          // Populate form data
          setFormData({
            asset_tag: data.asset_tag || '',
            device_name: data.device_name || '',
            serial_number: data.serial_number || '',
            model_name: data.model.name || '',
            model_number: data.model.model_number || data.model.name || '', // Use model number if available, fallback to name
            notes: data.notes || '',
            // Hardware specs
            cpu: data.cpu || '',
            ram_gb: data.ram_gb?.toString() || '',
            storage_type: data.storage_type || '',
            storage_size_gb: data.storage_size_gb?.toString() || '',
            screen_size: data.screen_size || '',
            gpu: data.gpu || '',
            operating_system: data.operating_system || '',
            bitlocker_recovery_key: data.bitlocker_recovery_key || '',
            // Asset information
            condition_id: data.condition?.id || '',
            maintenance_schedule_id: data.maintenance_schedule?.id || '',
            supplier_id: data.supplier?.id || '',
            verification_interval_months: data.verification_interval_months?.toString() || '',
            // Financial information
            purchase_date: data.purchase_date ? new Date(data.purchase_date).toISOString().split('T')[0] : '',
            purchase_cost: data.purchase_cost?.toString() || '',
            warranty_expiry_date: data.warranty_expiry_date ? new Date(data.warranty_expiry_date).toISOString().split('T')[0] : '',
            // Assignment & Location
            assigned_to_user_id: data.assigned_to_user?.id || '',
            department_id: data.department?.id || '',
            location_id: data.location?.id || ''
          })

          // Set manufacturer and category selections
          if (data.model.manufacturer) {
            setSelectedManufacturer(data.model.manufacturer.id?.toString() || '')
          }
          if (data.model.category) {
            setSelectedCategory(data.model.category.id?.toString() || '')
          }

          // Populate related links
          if (data.related_links) {
            setRelatedLinks(data.related_links)
          }
        } else {
          setError('Asset not found')
        }
      } catch (error) {
        setError('Failed to load asset')
      } finally {
        setLoading(false)
      }
    }

    fetchAsset()
  }, [assetId])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleManufacturerChange = (value: string) => {
    if (value === 'custom') {
      setShowCustomManufacturer(true)
      setCustomManufacturer('')
    } else {
      setShowCustomManufacturer(false)
      setSelectedManufacturer(value)
    }
  }

  const handleCategoryChange = (value: string) => {
    if (value === 'custom') {
      setShowCustomCategory(true)
      setCustomCategory('')
    } else {
      setShowCustomCategory(false)
      setSelectedCategory(value)
    }
  }

  const handleAddManufacturer = async () => {
    if (customManufacturer.trim()) {
      try {
        const response = await fetch('/api/settings/dropdown-lists', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            listType: 'manufacturers',
            name: customManufacturer.trim()
          })
        })

        if (response.ok) {
          const newManufacturer = await response.json()
          const manufacturerForList = {
            id: newManufacturer.id.toString(),
            name: newManufacturer.name
          }
          setManufacturers([...manufacturers, manufacturerForList])
          setSelectedManufacturer(manufacturerForList.id)
          setCustomManufacturer('')
          setShowCustomManufacturer(false)
        } else {
          const errorData = await response.json()
          alert(errorData.error || 'Failed to add manufacturer')
        }
      } catch (error) {
        console.error('Error adding manufacturer:', error)
        alert('Error adding manufacturer. Please try again.')
      }
    }
  }

  const handleAddCategory = async () => {
    if (customCategory.trim()) {
      try {
        const response = await fetch('/api/settings/dropdown-lists', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            listType: 'categories',
            name: customCategory.trim()
          })
        })

        if (response.ok) {
          const newCategory = await response.json()
          const categoryForList = {
            id: newCategory.id.toString(),
            name: newCategory.name
          }
          setCategories([...categories, categoryForList])
          setSelectedCategory(categoryForList.id)
          setCustomCategory('')
          setShowCustomCategory(false)
        } else {
          const errorData = await response.json()
          alert(errorData.error || 'Failed to add category')
        }
      } catch (error) {
        console.error('Error adding category:', error)
        alert('Error adding category. Please try again.')
      }
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setSaveError(null)
    
    try {
      // In a real app, this would make an API call to update the asset
      const response = await fetch(`/api/assets/${assetId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          manufacturer_id: selectedManufacturer,
          category_id: selectedCategory,
          related_links: relatedLinks.filter(link => link.title && link.url) // Only save links with title and URL
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update asset')
      }

      // Redirect to asset page with success message
      router.push(`/assets/${assetId}?updated=true`)
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Failed to save changes. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-6">
              <div className="h-64 bg-muted rounded"></div>
              <div className="h-32 bg-muted rounded"></div>
            </div>
            <div className="space-y-6">
              <div className="h-40 bg-muted rounded"></div>
              <div className="h-32 bg-muted rounded"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !asset) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive mb-4">Asset Not Found</h1>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Button onClick={() => router.push('/assets')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Assets
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => router.push(`/assets/${assetId}`)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Asset
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Edit Asset</h1>
            <p className="text-muted-foreground">{asset.asset_tag} - {asset.model.name}</p>
          </div>
        </div>
        <div 
          className={`flex items-center gap-3 transition-opacity duration-300 ${
            isScrolled ? 'opacity-0 pointer-events-none' : 'opacity-100'
          }`}
        >
          <Button variant="outline" onClick={() => router.push(`/assets/${assetId}`)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      {/* Error Banner */}
      {saveError && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <div>
                <h4 className="font-semibold text-red-800">Error Saving Changes</h4>
                <p className="text-sm text-red-700">{saveError}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSaveError(null)}
              className="text-red-600 hover:text-red-700 p-1"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="flex space-x-1 border-b mb-6">
        {[
          { id: 'basic', label: 'Basic Info', icon: Package },
          { id: 'assignment', label: 'Assignment & Location', icon: User },
          { id: 'financial', label: 'Financial', icon: Calendar },
          { id: 'hardware', label: 'Hardware Specs', icon: Package },
          { id: 'documents', label: 'Documents', icon: FileText },
          { id: 'photos', label: 'Photos', icon: Camera },
          { id: 'related-links', label: 'Related Links', icon: Link }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {/* Basic Information */}
        {activeTab === 'basic' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Asset Tag *</label>
                  <Input
                    value={formData.asset_tag}
                    onChange={(e) => handleInputChange('asset_tag', e.target.value)}
                    className="mt-1"
                    placeholder="e.g., LT-003"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Device Name</label>
                  <Input
                    value={formData.device_name}
                    onChange={(e) => handleInputChange('device_name', e.target.value)}
                    className="mt-1"
                    placeholder="e.g., John's Laptop, Reception Desk PC"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    A friendly name to identify what this device is or where it's used
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Serial Number</label>
                  <Input
                    value={formData.serial_number}
                    onChange={(e) => handleInputChange('serial_number', e.target.value)}
                    className="mt-1"
                    placeholder="e.g., ABC123456789"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Model Number *</label>
                  <Input
                    value={formData.model_number}
                    onChange={(e) => handleInputChange('model_number', e.target.value)}
                    className="mt-1"
                    placeholder="e.g., MK183LL/A, 20U9S02D00"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Model Name</label>
                  <Input
                    value={formData.model_name}
                    onChange={(e) => handleInputChange('model_name', e.target.value)}
                    className="mt-1"
                    placeholder="e.g., MacBook Pro 16-inch"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Notes</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring mt-1"
                    placeholder="Add any additional notes about this asset..."
                  />
                </div>
              </div>
            </Card>



            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Asset Information</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Manufacturer *</label>
                  <div className="space-y-2">
                    <select 
                      className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm mt-1"
                      value={selectedManufacturer}
                      onChange={(e) => handleManufacturerChange(e.target.value)}
                    >
                      <option value="">Select manufacturer...</option>
                      {manufacturers.map(manufacturer => (
                        <option key={manufacturer.id} value={manufacturer.id}>
                          {manufacturer.name}
                        </option>
                      ))}
                      <option value="custom">+ Add New Manufacturer</option>
                    </select>
                    
                    {showCustomManufacturer && (
                      <div className="flex gap-2">
                        <Input
                          value={customManufacturer}
                          onChange={(e) => setCustomManufacturer(e.target.value)}
                          placeholder="Enter manufacturer name"
                          className="flex-1"
                        />
                        <Button 
                          type="button" 
                          onClick={handleAddManufacturer}
                          size="sm"
                        >
                          Add
                        </Button>
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => {
                            setShowCustomManufacturer(false)
                            setCustomManufacturer('')
                          }}
                          size="sm"
                        >
                          Cancel
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">Category *</label>
                  <div className="space-y-2">
                    <select 
                      className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm mt-1"
                      value={selectedCategory}
                      onChange={(e) => handleCategoryChange(e.target.value)}
                    >
                      <option value="">Select category...</option>
                      {categories.map(category => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                      <option value="custom">+ Add New Category</option>
                    </select>
                    
                    {showCustomCategory && (
                      <div className="flex gap-2">
                        <Input
                          value={customCategory}
                          onChange={(e) => setCustomCategory(e.target.value)}
                          placeholder="Enter category name"
                          className="flex-1"
                        />
                        <Button 
                          type="button" 
                          onClick={handleAddCategory}
                          size="sm"
                        >
                          Add
                        </Button>
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => {
                            setShowCustomCategory(false)
                            setCustomCategory('')
                          }}
                          size="sm"
                        >
                          Cancel
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">Condition</label>
                  <select
                    value={formData.condition_id}
                    onChange={(e) => handleInputChange('condition_id', e.target.value)}
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm mt-1"
                  >
                    <option value="">Select condition...</option>
                    {mockConditions.map(condition => (
                      <option key={condition.id} value={condition.id}>{condition.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Maintenance Schedule</label>
                  <select
                    value={formData.maintenance_schedule_id}
                    onChange={(e) => handleInputChange('maintenance_schedule_id', e.target.value)}
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm mt-1"
                  >
                    <option value="">Select schedule...</option>
                    {mockMaintenanceSchedules.map(schedule => (
                      <option key={schedule.id} value={schedule.id}>{schedule.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Supplier</label>
                  <select
                    value={formData.supplier_id}
                    onChange={(e) => handleInputChange('supplier_id', e.target.value)}
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm mt-1"
                  >
                    <option value="">Select supplier...</option>
                    {mockSuppliers.map(supplier => (
                      <option key={supplier.id} value={supplier.id}>{supplier.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Verification Interval (months)</label>
                  <Input
                    type="number"
                    value={formData.verification_interval_months}
                    onChange={(e) => handleInputChange('verification_interval_months', e.target.value)}
                    className="mt-1"
                    placeholder="e.g., 12"
                  />
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Assignment & Location */}
        {activeTab === 'assignment' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Assignment</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Assigned To</label>
                  <select
                    value={formData.assigned_to_user_id}
                    onChange={(e) => handleInputChange('assigned_to_user_id', e.target.value)}
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm mt-1"
                  >
                    <option value="">Unassigned</option>
                    {mockUsers.map(user => (
                      <option key={user.id} value={user.id}>{user.name} ({user.email})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Department</label>
                  <select
                    value={formData.department_id}
                    onChange={(e) => handleInputChange('department_id', e.target.value)}
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm mt-1"
                  >
                    <option value="">Select department...</option>
                    {mockDepartments.map(dept => (
                      <option key={dept.id} value={dept.id}>{dept.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Location</label>
                  <select
                    value={formData.location_id}
                    onChange={(e) => handleInputChange('location_id', e.target.value)}
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm mt-1"
                  >
                    <option value="">Select location...</option>
                    {mockLocations.map(location => (
                      <option key={location.id} value={location.id}>{location.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Button className="w-full justify-start" variant="outline" onClick={() => alert('Check out functionality will be implemented')}>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Check Out Asset
                </Button>
                <Button className="w-full justify-start" variant="outline" onClick={() => alert('Check in functionality will be implemented')}>
                  <XCircle className="h-4 w-4 mr-2" />
                  Check In Asset
                </Button>
                <Button className="w-full justify-start" variant="outline" onClick={() => alert('Transfer functionality will be implemented')}>
                  <User className="h-4 w-4 mr-2" />
                  Transfer Asset
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* Financial Information */}
        {activeTab === 'financial' && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Financial Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Purchase Date</label>
                <Input
                  type="date"
                  value={formData.purchase_date}
                  onChange={(e) => handleInputChange('purchase_date', e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Purchase Cost</label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.purchase_cost}
                  onChange={(e) => handleInputChange('purchase_cost', e.target.value)}
                  className="mt-1"
                  placeholder="2499.99"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Warranty Expiry Date</label>
                <Input
                  type="date"
                  value={formData.warranty_expiry_date}
                  onChange={(e) => handleInputChange('warranty_expiry_date', e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
          </Card>
        )}

        {/* Hardware Specifications */}
        {activeTab === 'hardware' && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Hardware Specifications</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Processor (CPU)</label>
                <Input
                  value={formData.cpu}
                  onChange={(e) => handleInputChange('cpu', e.target.value)}
                  className="mt-1"
                  placeholder="e.g., Intel Core i7-12700H"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Memory (RAM) - GB</label>
                <Input
                  type="number"
                  value={formData.ram_gb}
                  onChange={(e) => handleInputChange('ram_gb', e.target.value)}
                  className="mt-1"
                  placeholder="e.g., 16"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Storage Type</label>
                <select
                  value={formData.storage_type}
                  onChange={(e) => handleInputChange('storage_type', e.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm mt-1"
                >
                  <option value="">Select storage type...</option>
                  <option value="HDD">HDD (Hard Disk Drive)</option>
                  <option value="SSD">SSD (Solid State Drive)</option>
                  <option value="NVMe">NVMe SSD</option>
                  <option value="eMMC">eMMC</option>
                  <option value="Hybrid">Hybrid (SSHD)</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Storage Size - GB</label>
                <Input
                  type="number"
                  value={formData.storage_size_gb}
                  onChange={(e) => handleInputChange('storage_size_gb', e.target.value)}
                  className="mt-1"
                  placeholder="e.g., 512"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Screen Size</label>
                <Input
                  value={formData.screen_size}
                  onChange={(e) => handleInputChange('screen_size', e.target.value)}
                  className="mt-1"
                  placeholder="e.g., 15.6 inches"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Graphics (GPU)</label>
                <Input
                  value={formData.gpu}
                  onChange={(e) => handleInputChange('gpu', e.target.value)}
                  className="mt-1"
                  placeholder="e.g., NVIDIA GeForce RTX 3070"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Operating System</label>
                <Input
                  value={formData.operating_system}
                  onChange={(e) => handleInputChange('operating_system', e.target.value)}
                  className="mt-1"
                  placeholder="e.g., Windows 11 Pro"
                />
              </div>
              {/* BitLocker Recovery Key for Laptops and Desktops */}
              {(asset.model.category.name.toLowerCase().includes('laptop') || 
                asset.model.category.name.toLowerCase().includes('desktop')) && (
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-muted-foreground">BitLocker Recovery Key</label>
                  <Input
                    value={formData.bitlocker_recovery_key}
                    onChange={(e) => handleInputChange('bitlocker_recovery_key', e.target.value)}
                    className="mt-1 font-mono"
                    placeholder="e.g., 123456-654321-789012-345678-901234-567890-123456-789012"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    48-digit recovery key for BitLocker encryption
                  </p>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Documents */}
        {activeTab === 'documents' && (
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Attached Documents</h3>
              <label>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    const files = Array.from(e.target.files || [])
                    setDocumentFiles([...documentFiles, ...files])
                  }}
                />
                <Button variant="outline" size="sm" asChild>
                  <span>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Document
                  </span>
                </Button>
              </label>
            </div>
            <div className="space-y-3">
              {/* Existing documents */}
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Purchase Receipt</p>
                    <p className="text-sm text-muted-foreground">PDF • 245 KB</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" title="Download">
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" title="Delete" className="text-red-600 hover:text-red-700">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              {/* New uploaded documents */}
              {documentFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg bg-blue-50">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium">{file.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {file.type} • {(file.size / 1024).toFixed(1)} KB • New
                      </p>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    title="Remove"
                    onClick={() => setDocumentFiles(documentFiles.filter((_, i) => i !== index))}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Photos */}
        {activeTab === 'photos' && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Asset Photos</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Upload New Photo</label>
                <label className="mt-2 border-2 border-dashed border-muted rounded-lg p-8 block cursor-pointer hover:bg-muted/50 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => setPhotoFile(e.target.files?.[0] || null)}
                  />
                  <div className="text-center">
                    <Camera className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-sm text-muted-foreground">
                      {photoFile ? `Selected: ${photoFile.name}` : 'Click to upload or drag and drop'}
                    </p>
                  </div>
                </label>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Current Photo</label>
                <div className="mt-2 aspect-square bg-muted rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <Camera className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No photo available</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Related Links */}
        {activeTab === 'related-links' && (
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold">Related Links</h3>
                <p className="text-sm text-muted-foreground">
                  Manage custom links and external resources for this asset
                </p>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  setRelatedLinks([...relatedLinks, {
                    link_type: 'Custom',
                    title: '',
                    url: '',
                    description: ''
                  }])
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Link
              </Button>
            </div>

            <div className="space-y-4">
              {/* Default Links with Google Search fallback */}
              <div className="border rounded-lg p-4 bg-muted/30">
                <h4 className="font-medium mb-3 text-sm text-muted-foreground">Default Links (Google Search Fallback)</h4>
                <div className="grid gap-3">
                  {[
                    { type: 'Product Manual', title: 'Product Manual', description: 'Device manual and documentation' },
                    { type: 'Warranty Info', title: 'Warranty Information', description: 'Manufacturer warranty lookup' },
                    { type: 'Support Portal', title: 'Support Portal', description: 'Manufacturer support portal' }
                  ].map((defaultLink) => {
                    const customLink = relatedLinks.find(link => link.link_type === defaultLink.type)
                    return (
                      <div key={defaultLink.type} className="flex items-center justify-between p-3 border rounded bg-background">
                        <div className="flex items-center gap-3">
                          <ExternalLink className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium text-sm">{defaultLink.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {customLink ? `Custom: ${customLink.url}` : `Google Search: ${defaultLink.description}`}
                            </p>
                          </div>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            if (customLink) {
                              // Remove custom override
                              setRelatedLinks(relatedLinks.filter(link => link.link_type !== defaultLink.type))
                            } else {
                              // Add custom override
                              setRelatedLinks([...relatedLinks, {
                                link_type: defaultLink.type,
                                title: defaultLink.title,
                                url: '',
                                description: defaultLink.description
                              }])
                            }
                          }}
                        >
                          {customLink ? 'Use Default' : 'Customize'}
                        </Button>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Custom Links */}
              {relatedLinks.filter(link => !['Product Manual', 'Warranty Info', 'Support Portal'].includes(link.link_type)).length > 0 && (
                <div>
                  <h4 className="font-medium mb-3 text-sm text-muted-foreground">Custom Links</h4>
                  <div className="space-y-3">
                    {relatedLinks.filter(link => !['Product Manual', 'Warranty Info', 'Support Portal'].includes(link.link_type)).map((link, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="grid gap-3">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                              <label className="text-xs font-medium text-muted-foreground">Link Title</label>
                              <Input
                                value={link.title}
                                onChange={(e) => {
                                  const updated = [...relatedLinks]
                                  const linkIndex = relatedLinks.findIndex(l => l === link)
                                  updated[linkIndex] = { ...link, title: e.target.value }
                                  setRelatedLinks(updated)
                                }}
                                placeholder="e.g., User Guide"
                                className="mt-1"
                              />
                            </div>
                            <div>
                              <label className="text-xs font-medium text-muted-foreground">Link Type</label>
                              <select
                                value={link.link_type}
                                onChange={(e) => {
                                  const updated = [...relatedLinks]
                                  const linkIndex = relatedLinks.findIndex(l => l === link)
                                  updated[linkIndex] = { ...link, link_type: e.target.value }
                                  setRelatedLinks(updated)
                                }}
                                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm mt-1"
                              >
                                <option value="Custom">Custom Link</option>
                                <option value="Documentation">Documentation</option>
                                <option value="Training">Training Materials</option>
                                <option value="Video">Video Tutorial</option>
                                <option value="Driver">Driver Download</option>
                                <option value="Firmware">Firmware Update</option>
                              </select>
                            </div>
                          </div>
                          <div>
                            <label className="text-xs font-medium text-muted-foreground">URL</label>
                            <Input
                              value={link.url}
                              onChange={(e) => {
                                const updated = [...relatedLinks]
                                const linkIndex = relatedLinks.findIndex(l => l === link)
                                updated[linkIndex] = { ...link, url: e.target.value }
                                setRelatedLinks(updated)
                              }}
                              placeholder="https://example.com/manual"
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-medium text-muted-foreground">Description (Optional)</label>
                            <Input
                              value={link.description || ''}
                              onChange={(e) => {
                                const updated = [...relatedLinks]
                                const linkIndex = relatedLinks.findIndex(l => l === link)
                                updated[linkIndex] = { ...link, description: e.target.value }
                                setRelatedLinks(updated)
                              }}
                              placeholder="Brief description of the link"
                              className="mt-1"
                            />
                          </div>
                          <div className="flex justify-end">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => {
                                setRelatedLinks(relatedLinks.filter(l => l !== link))
                              }}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Remove Link
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Customized Default Links */}
              {relatedLinks.filter(link => ['Product Manual', 'Warranty Info', 'Support Portal'].includes(link.link_type)).length > 0 && (
                <div>
                  <h4 className="font-medium mb-3 text-sm text-muted-foreground">Customized Default Links</h4>
                  <div className="space-y-3">
                    {relatedLinks.filter(link => ['Product Manual', 'Warranty Info', 'Support Portal'].includes(link.link_type)).map((link, index) => (
                      <div key={index} className="border rounded-lg p-4 bg-blue-50">
                        <div className="grid gap-3">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                              <label className="text-xs font-medium text-muted-foreground">Link Title</label>
                              <Input
                                value={link.title}
                                onChange={(e) => {
                                  const updated = [...relatedLinks]
                                  const linkIndex = relatedLinks.findIndex(l => l === link)
                                  updated[linkIndex] = { ...link, title: e.target.value }
                                  setRelatedLinks(updated)
                                }}
                                className="mt-1"
                              />
                            </div>
                            <div>
                              <label className="text-xs font-medium text-muted-foreground">Link Type</label>
                              <Input
                                value={link.link_type}
                                disabled
                                className="mt-1 bg-muted"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="text-xs font-medium text-muted-foreground">Custom URL</label>
                            <Input
                              value={link.url}
                              onChange={(e) => {
                                const updated = [...relatedLinks]
                                const linkIndex = relatedLinks.findIndex(l => l === link)
                                updated[linkIndex] = { ...link, url: e.target.value }
                                setRelatedLinks(updated)
                              }}
                              placeholder="https://example.com/manual"
                              className="mt-1"
                            />
                          </div>
                          <div className="flex justify-end">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => {
                                setRelatedLinks(relatedLinks.filter(l => l !== link))
                              }}
                              className="text-red-600 hover:text-red-700"
                            >
                              Remove Override
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>
        )}
      </div>

      {/* Save Actions Footer - Only show when scrolled */}
      <div 
        className={`mt-8 flex justify-end gap-3 p-6 bg-muted/20 rounded-lg transition-opacity duration-300 ${
          isScrolled ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <Button variant="outline" onClick={() => router.push(`/assets/${assetId}`)}>
          Cancel Changes
        </Button>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Saving Changes...' : 'Save All Changes'}
        </Button>
      </div>
    </div>
  )
} 