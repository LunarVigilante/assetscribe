'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, Save, Package, User, Calendar, FileText, Camera, Upload, Trash2, ExternalLink, CheckCircle, XCircle, AlertCircle, X, Link, Plus, Shield, ArrowUp, ArrowDown } from 'lucide-react'
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
  storage_unit?: string
  screen_size?: string
  gpu?: string
  operating_system?: string
  bitlocker_recovery_key?: string
  bitlocker_enabled: boolean
  // Desktop-specific fields
  usb_ports_type?: string
  display_ports_type?: string
  has_builtin_wifi?: boolean
  has_cd_drive?: boolean
  psu_type?: string
  psu_wattage?: number
  psu_cable_type?: string
  // System and Network tracking
  os_install_date?: Date
  backup_type?: string
  last_backup_date?: Date
  network_type?: string
  static_ip_address?: string
  vlan?: string
  switch_name?: string
  switch_port?: string
  mac_address: string
  // Lifecycle Management
  planned_refresh_date?: Date
  end_of_life_date?: Date
  disposal_method?: string
  business_criticality?: string
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
  const searchParams = useSearchParams()
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
    storage_unit: 'GB', // New field for GB/TB selection
    screen_size: '',
    gpu: '',
    operating_system: '',
    bitlocker_recovery_key: '',
    bitlocker_enabled: false,
    // Desktop-specific fields
    usb_ports_type: '',
    display_ports_type: '',
    has_builtin_wifi: false,
    has_cd_drive: false,
    psu_type: '',
    psu_wattage: '',
    psu_cable_type: '',
    // System and Network tracking
    os_install_date: '',
    backup_type: '',
    last_backup_date: '',
    network_type: '',
    static_ip_address: '',
    vlan: '',
    switch_name: '',
    switch_port: '',
    mac_address: '',
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
    location_id: '',
    // Lifecycle Management
    planned_refresh_date: '',
    end_of_life_date: '',
    disposal_method: '',
    business_criticality: ''
  })

  // Dropdown data state
  const [dropdownError, setDropdownError] = useState<string | null>(null)
  const [users, setUsers] = useState<{ id: string; name: string; email: string }[]>([])
  const [departments, setDepartments] = useState<{ id: string; name: string }[]>([])
  const [locations, setLocations] = useState<{ id: string; name: string }[]>([])
  const [conditions, setConditions] = useState<{ id: string; name: string }[]>([])
  const [maintenanceSchedules, setMaintenanceSchedules] = useState<{ id: string; name: string }[]>([])
  const [suppliers, setSuppliers] = useState<{ id: string; name: string }[]>([])
  const [manufacturers, setManufacturers] = useState<{ id: string; name: string }[]>([])
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([])

  // Related links state
  const [relatedLinks, setRelatedLinks] = useState<{
    id?: number;
    link_type: string;
    title: string;
    url: string;
    description?: string;
  }[]>([])

  // Linked assets state
  const [linkedAssets, setLinkedAssets] = useState<{
    parent_relationships: Array<{
      id: string;
      asset_tag: string;
      model_name: string;
      relationship_type: string;
    }>;
    child_relationships: Array<{
      id: string;
      asset_tag: string;
      model_name: string;
      relationship_type: string;
    }>;
  }>({
    parent_relationships: [],
    child_relationships: []
  })

  const [availableAssets, setAvailableAssets] = useState<Array<{
    id: string;
    asset_tag: string;
    model_name: string;
    status: string;
  }>>([])

  const [newRelationship, setNewRelationship] = useState({
    asset_id: '',
    relationship_type: '',
    direction: 'child' // 'parent' or 'child'
  })

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

  useEffect(() => {
    const getParams = async () => {
      const { id } = await params
      setAssetId(id)
    }
    getParams()
  }, [params])

  // Handle section parameter from URL
  useEffect(() => {
    const section = searchParams.get('section')
    if (section) {
      // Map section names to tab IDs
      const sectionToTab: {[key: string]: string} = {
        'overview': 'basic',
        'basic': 'basic',
        'information': 'basic',
        'assignment': 'assignment',
        'financial': 'financial',
        'hardware': 'hardware',
        'documents': 'documents',
        'photos': 'photos',
        'photo': 'photos',
        'relationships': 'linked-assets',
        'linked-assets': 'linked-assets',
        'links': 'related-links'
      }
      
      if (sectionToTab[section]) {
        setActiveTab(sectionToTab[section])
      }
    }
  }, [searchParams])

  // Fetch dropdown data on component mount
  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        // Fetch settings data
        const settingsResponse = await fetch('/api/settings/dropdown-lists')
        if (settingsResponse.ok) {
          const data = await settingsResponse.json()
          
          // Safely map manufacturers
          if (data.manufacturers && Array.isArray(data.manufacturers)) {
            setManufacturers(data.manufacturers.map((m: any) => ({
              id: m.id.toString(),
              name: m.name
            })))
          }
          
          // Safely map categories
          if (data.categories && Array.isArray(data.categories)) {
            setCategories(data.categories.map((c: any) => ({
              id: c.id.toString(),
              name: c.name
            })))
          }
          
          // Safely map departments
          if (data.departments && Array.isArray(data.departments)) {
            setDepartments(data.departments.map((d: any) => ({
              id: d.id.toString(),
              name: d.name
            })))
          }
          
          // Safely map locations
          if (data.locations && Array.isArray(data.locations)) {
            setLocations(data.locations.map((l: any) => ({
              id: l.id.toString(),
              name: l.name
            })))
          }
          
          // Safely map conditions  
          if (data.assetConditions && Array.isArray(data.assetConditions)) {
            setConditions(data.assetConditions.map((c: any) => ({
              id: c.id.toString(),
              name: c.name
            })))
          }
          
          // Safely map maintenance schedules
          if (data.maintenanceSchedules && Array.isArray(data.maintenanceSchedules)) {
            setMaintenanceSchedules(data.maintenanceSchedules.map((m: any) => ({
              id: m.id.toString(),
              name: m.name
            })))
          }
          
          // Safely map suppliers
          if (data.suppliers && Array.isArray(data.suppliers)) {
            setSuppliers(data.suppliers.map((s: any) => ({
              id: s.id.toString(),
              name: s.name
            })))
          }
        }

        // Fetch users separately
        try {
          const usersResponse = await fetch('/api/users')
          if (usersResponse.ok) {
            const usersData = await usersResponse.json()
            setUsers(usersData.map((u: any) => ({
              id: u.id.toString(),
              name: `${u.first_name} ${u.last_name}`,
              email: u.email
            })))
          }
        } catch (error) {
          console.error('Error fetching users:', error)
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
            storage_size_gb: data.storage_size_gb ? (data.storage_unit === 'TB' ? (data.storage_size_gb / 1024).toString() : data.storage_size_gb.toString()) : '',
            storage_unit: data.storage_unit || (data.storage_size_gb && data.storage_size_gb >= 1024 ? 'TB' : 'GB'),
            screen_size: data.screen_size || '',
            gpu: data.gpu || '',
            operating_system: data.operating_system || '',
            bitlocker_recovery_key: data.bitlocker_recovery_key || '',
            bitlocker_enabled: data.bitlocker_enabled || false,
            // Desktop-specific fields
            usb_ports_type: data.usb_ports_type || '',
            display_ports_type: data.display_ports_type || '',
            has_builtin_wifi: data.has_builtin_wifi || false,
            has_cd_drive: data.has_cd_drive || false,
            psu_type: data.psu_type || '',
            psu_wattage: data.psu_wattage?.toString() || '',
            psu_cable_type: data.psu_cable_type || '',
            // System and Network tracking
            os_install_date: data.os_install_date ? new Date(data.os_install_date).toISOString().split('T')[0] : '',
            backup_type: data.backup_type || '',
            last_backup_date: data.last_backup_date ? new Date(data.last_backup_date).toISOString().split('T')[0] : '',
            network_type: data.network_type || '',
            static_ip_address: data.static_ip_address || '',
            vlan: data.vlan || '',
            switch_name: data.switch_name || '',
            switch_port: data.switch_port || '',
            mac_address: data.mac_address || '',
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
            location_id: data.location?.id || '',
            // Lifecycle Management
            planned_refresh_date: data.planned_refresh_date ? new Date(data.planned_refresh_date).toISOString().split('T')[0] : '',
            end_of_life_date: data.end_of_life_date ? new Date(data.end_of_life_date).toISOString().split('T')[0] : '',
            disposal_method: data.disposal_method || '',
            business_criticality: data.business_criticality || ''
          })

          // Populate related links
          if (data.related_links) {
            setRelatedLinks(data.related_links)
          }

          // Set manufacturer and category selections
          if (data.model.manufacturer) {
            setSelectedManufacturer(data.model.manufacturer.id?.toString() || '')
          }
          if (data.model.category) {
            setSelectedCategory(data.model.category.id?.toString() || '')
          }

          // Fetch available assets for relationships (now that we have assetId)
          try {
            const assetsResponse = await fetch('/api/assets')
            if (assetsResponse.ok) {
              const assetsData = await assetsResponse.json()
              // Check if the API returned data in the correct format
              const assetsArray = assetsData.data || assetsData.assets || []
              
              if (Array.isArray(assetsArray)) {
                // Filter out the current asset
                const filteredAssets = assetsArray.filter((a: any) => {
                  const assetIdStr = String(a.id)
                  const currentIdStr = String(assetId)
                  return assetIdStr !== currentIdStr
                })
                
                const mappedAssets = filteredAssets.map((a: any) => ({
                  id: a.id.toString(),
                  asset_tag: a.asset_tag,
                  model_name: a.model ? a.model.name : 'Unknown Model',
                  status: a.status ? a.status.name : 'Unknown Status'
                }))
                
                setAvailableAssets(mappedAssets)
              } else {
                console.error('Unexpected assets data structure:', assetsData)
              }
            }
          } catch (error) {
            console.error('Error fetching available assets:', error)
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

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: field === 'has_builtin_wifi' || field === 'has_cd_drive' ? value === 'true' || value === true : value
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
          <Button variant="outline" onClick={() => router.push(`/assets/${assetId}`)} className="cursor-pointer">
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving} className="cursor-pointer">
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
          { id: 'photos', label: 'Photos', icon: Camera },
          { id: 'documents', label: 'Documents', icon: FileText },
          { id: 'linked-assets', label: 'Linked Assets', icon: Package },
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
                    {conditions.map(condition => (
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
                    {maintenanceSchedules.map(schedule => (
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
                    {suppliers.map(supplier => (
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
                  <label className="text-sm font-medium text-muted-foreground">Current Status</label>
                  <div className="flex items-center gap-2 mt-2">
                    {asset.status && (
                      <>
                        {asset.status.name.toLowerCase() === 'active' || asset.status.name.toLowerCase() === 'deployed' ? (
                          <Shield className="h-4 w-4 text-green-500" />
                        ) : asset.status.name.toLowerCase() === 'available' ? (
                          <Package className="h-4 w-4 text-blue-500" />
                        ) : (
                          <Package className="h-4 w-4 text-muted-foreground" />
                        )}
                        <span className="font-medium">{asset.status.name}</span>
                      </>
                    )}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Assigned To</label>
                  <select
                    value={formData.assigned_to_user_id}
                    onChange={(e) => handleInputChange('assigned_to_user_id', e.target.value)}
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm mt-1"
                  >
                    <option value="">Unassigned</option>
                    {users.map(user => (
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
                    {departments.map(dept => (
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
                    {locations.map(location => (
                      <option key={location.id} value={location.id}>{location.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
              <div className="space-y-3">
                {/* Only show appropriate action based on current assignment */}
                {!(asset.assigned_to_user || asset.department) ? (
                  <Button className="w-full justify-start" variant="outline" onClick={() => alert('Check out functionality will be implemented')}>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Check Out Asset
                  </Button>
                ) : (
                  <>
                    <Button className="w-full justify-start" variant="outline" onClick={() => alert('Check in functionality will be implemented')}>
                      <XCircle className="h-4 w-4 mr-2" />
                      Check In Asset
                    </Button>
                    <Button className="w-full justify-start" variant="outline" onClick={() => alert('Transfer functionality will be implemented')}>
                      <User className="h-4 w-4 mr-2" />
                      Transfer Asset
                    </Button>
                  </>
                )}
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
                <label className="text-sm font-medium text-muted-foreground">Storage Size</label>
                <div className="flex gap-2 mt-1">
                  <Input
                    type="number"
                    value={formData.storage_size_gb}
                    onChange={(e) => handleInputChange('storage_size_gb', e.target.value)}
                    className="flex-1"
                    placeholder="e.g., 512"
                  />
                  <select
                    value={formData.storage_unit}
                    onChange={(e) => handleInputChange('storage_unit', e.target.value)}
                    className="flex h-9 w-20 rounded-md border border-input bg-background px-3 py-1 text-sm"
                  >
                    <option value="GB">GB</option>
                    <option value="TB">TB</option>
                  </select>
                </div>
              </div>
              {/* Only show screen size for laptops, tablets, and mobile devices */}
              {!asset.model.category.name.toLowerCase().includes('desktop') && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Screen Size</label>
                  <Input
                    value={formData.screen_size}
                    onChange={(e) => handleInputChange('screen_size', e.target.value)}
                    className="mt-1"
                    placeholder="e.g., 15.6 inches"
                  />
                </div>
              )}
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
              
              {/* Desktop-specific fields */}
              {asset.model.category.name.toLowerCase().includes('desktop') && (
                <>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">USB Ports</label>
                    <Input
                      value={formData.usb_ports_type}
                      onChange={(e) => handleInputChange('usb_ports_type', e.target.value)}
                      className="mt-1"
                      placeholder="e.g., 4x USB 3.0, 2x USB-C, 1x USB 2.0"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      List all USB ports with their types and quantities
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Display Ports</label>
                    <Input
                      value={formData.display_ports_type}
                      onChange={(e) => handleInputChange('display_ports_type', e.target.value)}
                      className="mt-1"
                      placeholder="e.g., 1x HDMI, 2x DisplayPort, 1x VGA"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      List all display outputs with their types and quantities
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="builtin-wifi"
                      checked={formData.has_builtin_wifi}
                      onChange={(e) => handleInputChange('has_builtin_wifi', e.target.checked.toString())}
                      className="rounded border-input"
                    />
                    <label htmlFor="builtin-wifi" className="text-sm font-medium text-muted-foreground">
                      Has Built-in WiFi
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="cd-drive"
                      checked={formData.has_cd_drive}
                      onChange={(e) => handleInputChange('has_cd_drive', e.target.checked.toString())}
                      className="rounded border-input"
                    />
                    <label htmlFor="cd-drive" className="text-sm font-medium text-muted-foreground">
                      Has CD/DVD Drive
                    </label>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">PSU Type</label>
                    <select
                      value={formData.psu_type}
                      onChange={(e) => handleInputChange('psu_type', e.target.value)}
                      className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm mt-1"
                    >
                      <option value="">Select PSU type...</option>
                      <option value="Universal">Universal (Standard ATX)</option>
                      <option value="Proprietary">Proprietary</option>
                      <option value="External Adapter">External Adapter</option>
                      <option value="Built-in">Built-in (All-in-One)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">PSU Wattage</label>
                    <Input
                      type="number"
                      value={formData.psu_wattage}
                      onChange={(e) => handleInputChange('psu_wattage', e.target.value)}
                      className="mt-1"
                      placeholder="e.g., 450"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-muted-foreground">Power Cable Type</label>
                    <select
                      value={formData.psu_cable_type}
                      onChange={(e) => handleInputChange('psu_cable_type', e.target.value)}
                      className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm mt-1"
                    >
                      <option value="">Select cable type...</option>
                      <option value="Standard IEC C13">Standard IEC C13 (Universal)</option>
                      <option value="IEC C19">IEC C19 (High Power)</option>
                      <option value="Proprietary">Proprietary Connector</option>
                      <option value="External Adapter">External Adapter (Wall Plug)</option>
                      <option value="Built-in">Built-in (No External Cable)</option>
                    </select>
                    <p className="text-xs text-muted-foreground mt-1">
                      Important for power requirements and cable management
                    </p>
                  </div>

                  {/* System and Network Tracking */}
                  <div className="md:col-span-2 border-t pt-4 mt-4">
                    <h4 className="text-base font-semibold mb-4 text-muted-foreground">System & Network Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">OS Install Date</label>
                        <Input
                          type="date"
                          value={formData.os_install_date}
                          onChange={(e) => handleInputChange('os_install_date', e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Backup Type</label>
                        <select
                          value={formData.backup_type}
                          onChange={(e) => handleInputChange('backup_type', e.target.value)}
                          className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm mt-1"
                        >
                          <option value="">Select backup type...</option>
                          <option value="Cloud">Cloud Backup</option>
                          <option value="Local">Local Backup</option>
                          <option value="Network">Network/Server Backup</option>
                          <option value="None">No Backup</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Last Backup Date</label>
                        <Input
                          type="date"
                          value={formData.last_backup_date}
                          onChange={(e) => handleInputChange('last_backup_date', e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Network Configuration</label>
                        <select
                          value={formData.network_type}
                          onChange={(e) => handleInputChange('network_type', e.target.value)}
                          className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm mt-1"
                        >
                          <option value="">Select network type...</option>
                          <option value="DHCP">DHCP (Dynamic IP)</option>
                          <option value="Static">Static IP</option>
                        </select>
                      </div>
                      {formData.network_type === 'Static' && (
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Static IP Address</label>
                          <Input
                            value={formData.static_ip_address}
                            onChange={(e) => handleInputChange('static_ip_address', e.target.value)}
                            className="mt-1"
                            placeholder="e.g., 192.168.1.100"
                          />
                        </div>
                      )}
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">VLAN</label>
                        <Input
                          value={formData.vlan}
                          onChange={(e) => handleInputChange('vlan', e.target.value)}
                          className="mt-1"
                          placeholder="e.g., VLAN 10, Management"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Switch Name</label>
                        <Input
                          value={formData.switch_name}
                          onChange={(e) => handleInputChange('switch_name', e.target.value)}
                          className="mt-1"
                          placeholder="e.g., SW-Floor1-01"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Switch Port</label>
                        <Input
                          value={formData.switch_port}
                          onChange={(e) => handleInputChange('switch_port', e.target.value)}
                          className="mt-1"
                          placeholder="e.g., Gi0/24, Port 12"
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}

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

        {/* Linked Assets */}
        {activeTab === 'linked-assets' && (
          <div className="space-y-6">
            <Card className="p-6">
              <div className="mb-4">
                <h3 className="text-lg font-semibold">Asset Relationships</h3>
                <p className="text-sm text-muted-foreground">
                  Manage parent/child relationships and CMDB connections for this asset
                </p>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Parent Relationships */}
                <div>
                  <h4 className="font-medium mb-3 text-sm text-muted-foreground flex items-center gap-2">
                    <ArrowUp className="h-4 w-4" />
                    Parent Assets (This asset depends on)
                  </h4>
                  <div className="space-y-3">
                    {linkedAssets.parent_relationships.length === 0 ? (
                      <div className="border-2 border-dashed border-muted rounded-lg p-6 text-center">
                        <Package className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">No parent relationships</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Add relationships to assets this device depends on
                        </p>
                      </div>
                    ) : (
                      linkedAssets.parent_relationships.map((parent, index) => (
                        <div key={index} className="border rounded-lg p-4 bg-blue-50">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Package className="h-5 w-5 text-blue-600" />
                              <div>
                                <p className="font-medium">{parent.asset_tag}</p>
                                <p className="text-sm text-muted-foreground">{parent.model_name}</p>
                                <p className="text-xs text-muted-foreground">
                                  Relationship: {parent.relationship_type}
                                </p>
                              </div>
                            </div>
                            <div className="flex gap-1">
                              <Button variant="ghost" size="sm" title="View Asset">
                                <ExternalLink className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                title="Remove Relationship"
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Child Relationships */}
                <div>
                  <h4 className="font-medium mb-3 text-sm text-muted-foreground flex items-center gap-2">
                    <ArrowDown className="h-4 w-4" />
                    Child Assets (Assets that depend on this)
                  </h4>
                  <div className="space-y-3">
                    {linkedAssets.child_relationships.length === 0 ? (
                      <div className="border-2 border-dashed border-muted rounded-lg p-6 text-center">
                        <Package className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">No child relationships</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Add relationships to assets that depend on this device
                        </p>
                      </div>
                    ) : (
                      linkedAssets.child_relationships.map((child, index) => (
                        <div key={index} className="border rounded-lg p-4 bg-green-50">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Package className="h-5 w-5 text-green-600" />
                              <div>
                                <p className="font-medium">{child.asset_tag}</p>
                                <p className="text-sm text-muted-foreground">{child.model_name}</p>
                                <p className="text-xs text-muted-foreground">
                                  Relationship: {child.relationship_type}
                                </p>
                              </div>
                            </div>
                            <div className="flex gap-1">
                              <Button variant="ghost" size="sm" title="View Asset">
                                <ExternalLink className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                title="Remove Relationship"
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </Card>

            {/* Add New Relationship Form */}
            <Card className="p-6">
              <h4 className="font-medium mb-4">Add New Relationship</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Asset</label>
                  <select
                    value={newRelationship.asset_id}
                    onChange={(e) => setNewRelationship({...newRelationship, asset_id: e.target.value})}
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm mt-1"
                  >
                    <option value="">Select an asset...</option>
                    {availableAssets.map(asset => (
                      <option key={asset.id} value={asset.id}>
                        {asset.asset_tag} - {asset.model_name} ({asset.status})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Relationship Type</label>
                  <select
                    value={newRelationship.relationship_type}
                    onChange={(e) => setNewRelationship({...newRelationship, relationship_type: e.target.value})}
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm mt-1"
                  >
                    <option value="">Select relationship...</option>
                    <option value="depends_on">Depends On</option>
                    <option value="connected_to">Connected To</option>
                    <option value="powered_by">Powered By</option>
                    <option value="managed_by">Managed By</option>
                    <option value="backup_of">Backup Of</option>
                    <option value="cluster_member">Cluster Member</option>
                    <option value="virtual_host">Virtual Host</option>
                    <option value="load_balancer">Load Balancer</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Direction</label>
                  <select
                    value={newRelationship.direction}
                    onChange={(e) => setNewRelationship({...newRelationship, direction: e.target.value as 'parent' | 'child'})}
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm mt-1"
                  >
                    <option value="child">This asset depends on selected asset (Parent)</option>
                    <option value="parent">Selected asset depends on this asset (Child)</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end mt-4">
                <Button 
                  onClick={() => {
                    if (newRelationship.asset_id && newRelationship.relationship_type) {
                      // Handle adding the relationship
                      alert('Relationship functionality will be implemented in the next phase')
                    }
                  }}
                  disabled={!newRelationship.asset_id || !newRelationship.relationship_type}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Relationship
                </Button>
              </div>
            </Card>

            {/* CMDB Integration Info */}
            <Card className="p-6">
              <h4 className="font-medium mb-4">CMDB Integration</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h5 className="text-sm font-medium text-muted-foreground mb-2">Configuration Item (CI) Details</h5>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">CI Type:</span>
                      <span>{asset.model.category.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">CI Class:</span>
                      <span>Hardware</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Environment:</span>
                      <span>{asset.status.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Business Service:</span>
                      <span>{asset.department?.name || 'Not Assigned'}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h5 className="text-sm font-medium text-muted-foreground mb-2">Relationship Summary</h5>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Parent Relations:</span>
                      <span>{linkedAssets.parent_relationships.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Child Relations:</span>
                      <span>{linkedAssets.child_relationships.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Dependencies:</span>
                      <span>{linkedAssets.parent_relationships.length + linkedAssets.child_relationships.length}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Service Dependencies */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="font-medium">Service Dependencies</h4>
                  <p className="text-sm text-muted-foreground">
                    Manage business services, software, and network information for this asset
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => alert('Service dependency functionality will be implemented in the next phase')}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Service Link
                </Button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Business Services */}
                <div>
                  <h5 className="font-medium mb-3 text-sm text-muted-foreground flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Business Services
                  </h5>
                  <div className="space-y-3">
                    <div className="border-2 border-dashed border-muted rounded-lg p-4 text-center">
                      <Shield className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
                      <p className="text-xs text-muted-foreground">No business services linked</p>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="mt-2 text-xs cursor-pointer"
                        onClick={() => alert('Service linking functionality will be implemented in the next phase')}
                      >
                        Link Service
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Installed Software */}
                <div>
                  <h5 className="font-medium mb-3 text-sm text-muted-foreground flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    Installed Software
                  </h5>
                  <div className="space-y-3">
                    <div className="border-2 border-dashed border-muted rounded-lg p-4 text-center">
                      <Package className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
                      <p className="text-xs text-muted-foreground">No software tracked</p>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="mt-2 text-xs cursor-pointer"
                        onClick={() => alert('Software tracking functionality will be implemented in the next phase')}
                      >
                        Add Software
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Network Information */}
                <div>
                  <h5 className="font-medium mb-3 text-sm text-muted-foreground flex items-center gap-2">
                    <ExternalLink className="h-4 w-4" />
                    Network Details
                  </h5>
                  <div className="space-y-3">
                    <div className="border rounded-lg p-3 bg-muted/30">
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">IP Address:</span>
                          <span className="font-mono">{formData.static_ip_address || 'DHCP'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">MAC Address:</span>
                          <span className="font-mono">{formData.mac_address || 'Not Set'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">VLAN:</span>
                          <span>{formData.vlan || 'Default'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Switch Port:</span>
                          <span>{formData.switch_port || 'Unknown'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>


            </Card>
          </div>
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