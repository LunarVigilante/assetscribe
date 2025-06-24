'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Settings, 
  Shield, 
  Database, 
  Users, 
  Save, 
  Plus, 
  Trash2, 
  Edit3,
  Building2,
  MapPin,
  Wrench,
  Package,
  Factory,
  Tags,
  UserCheck,
  Activity,
  DollarSign,
  Calendar,
  AlertTriangle,
  Loader2,
  Camera,
  Images,
  Upload,
  Search
} from 'lucide-react'

type TabType = 'general' | 'lists' | 'photo-library' | 'security' | 'database'

interface DropdownItem {
  id: number
  name: string
  color?: string
}

interface DropdownLists {
  manufacturers: DropdownItem[]
  categories: DropdownItem[]
  suppliers: DropdownItem[]
  departments: DropdownItem[]
  locations: DropdownItem[]
  statusLabels: DropdownItem[]
  assetConditions: DropdownItem[]
  maintenanceSchedules: DropdownItem[]
  depreciationMethods: DropdownItem[]
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('general')
  const [editingItem, setEditingItem] = useState<{ type: string; index: number } | null>(null)
  const [newItemName, setNewItemName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null)
  const [models, setModels] = useState<{id: number, name: string, manufacturer: string, category: string, photo_url?: string}[]>([])
  const [isLoadingModels, setIsLoadingModels] = useState(false)
  const [dropdownLists, setDropdownLists] = useState<DropdownLists>({
    manufacturers: [],
    categories: [],
    suppliers: [],
    departments: [],
    locations: [],
    statusLabels: [],
    assetConditions: [],
    maintenanceSchedules: [],
    depreciationMethods: []
  })

  // Fetch dropdown lists and models from database
  useEffect(() => {
    fetchDropdownLists()
    if (activeTab === 'photo-library') {
      fetchModels()
    }
  }, [activeTab])

  const fetchDropdownLists = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/settings/dropdown-lists')
      if (response.ok) {
        const data = await response.json()
        setDropdownLists(data)
      } else {
        console.error('Failed to fetch dropdown lists')
      }
    } catch (error) {
      console.error('Error fetching dropdown lists:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchModels = async () => {
    setIsLoadingModels(true)
    try {
      const response = await fetch('/api/settings/models')
      if (response.ok) {
        const data = await response.json()
        setModels(data)
      } else {
        console.error('Failed to fetch models')
      }
    } catch (error) {
      console.error('Error fetching models:', error)
    } finally {
      setIsLoadingModels(false)
    }
  }

  const handleAddItem = async (listType: string) => {
    if (!newItemName.trim()) return

    try {
      let response
      let endpoint = '/api/settings/dropdown-lists'
      let requestBody: any = {
        listType,
        name: newItemName.trim()
      }

      // Special handling for departments and locations
      if (listType === 'departments') {
        endpoint = '/api/departments'
        requestBody = { name: newItemName.trim() }
      } else if (listType === 'locations') {
        endpoint = '/api/locations'
        requestBody = { name: newItemName.trim() }
      }

      response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      })

      if (response.ok) {
        const result = await response.json()
        const newItem = listType === 'departments' || listType === 'locations' 
          ? { id: result.department?.id || result.location?.id, name: newItemName.trim(), _count: { users: 0, assets: 0 } }
          : result
        
        setDropdownLists(prev => ({
          ...prev,
          [listType]: [...prev[listType as keyof DropdownLists], newItem]
        }))
        setNewItemName('')
        alert(`${newItemName.trim()} added successfully`)
      } else {
        const error = await response.json()
        alert(`Failed to add item: ${error.error}`)
      }
    } catch (error) {
      console.error('Error adding item:', error)
      alert('Failed to add item')
    }
  }

  const handleDeleteItem = async (listType: string, index: number) => {
    const items = dropdownLists[listType as keyof DropdownLists]
    const item = items[index]
    
    if (!item?.id) return
    
    // Special handling for departments and locations
    if (listType === 'departments' || listType === 'locations') {
      if (!confirm(`Are you sure you want to delete "${item.name}"? This action cannot be undone.`)) {
        return
      }
      
      try {
        const endpoint = listType === 'departments' ? '/api/departments' : '/api/locations'
        const response = await fetch(`${endpoint}/${item.id}`, {
          method: 'DELETE'
        })
        
        if (response.ok) {
          // Remove from local state
          setDropdownLists(prev => ({
            ...prev,
            [listType]: prev[listType as keyof DropdownLists].filter((_, i) => i !== index)
          }))
          alert(`${item.name} deleted successfully`)
        } else {
          const error = await response.json()
          alert(`Failed to delete: ${error.error}`)
        }
      } catch (error) {
        console.error('Error deleting item:', error)
        alert('Failed to delete item')
      }
    } else {
      // For other list types, implement generic delete
      console.log('Delete functionality for', listType, 'to be implemented')
    }
  }

  const handleEditItem = async (listType: string, index: number, newValue: string) => {
    // TODO: Implement PUT API endpoint  
    console.log('Edit functionality to be implemented')
    setEditingItem(null)
  }

  const handleCategoryPhotoUpload = async (categoryId: number, categoryName: string, file: File) => {
    try {
      const formData = new FormData()
      formData.append('photo', file)
      formData.append('categoryId', categoryId.toString())
      formData.append('categoryName', categoryName)

      const response = await fetch('/api/settings/category-photos', {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        const result = await response.json()
        console.log('Category photo uploaded:', result)
        // Optionally refresh the categories or show success message
      } else {
        const errorData = await response.json()
        console.error('Failed to upload category photo:', errorData.error)
        alert(`Failed to upload photo: ${errorData.error}`)
      }
    } catch (error) {
      console.error('Error uploading category photo:', error)
      alert('Error uploading photo. Please try again.')
    }
  }

  const handleCategoryPhotoDelete = async (categoryName: string) => {
    if (!confirm(`Are you sure you want to remove the stock photo for ${categoryName}?`)) {
      return
    }

    try {
      const response = await fetch(`/api/settings/category-photos?categoryName=${encodeURIComponent(categoryName)}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        console.log('Category photo deleted')
        // Optionally refresh the categories or show success message
      } else {
        const errorData = await response.json()
        console.error('Failed to delete category photo:', errorData.error)
        alert(`Failed to delete photo: ${errorData.error}`)
      }
    } catch (error) {
      console.error('Error deleting category photo:', error)
      alert('Error deleting photo. Please try again.')
    }
  }

  const handlePhotoUpload = async (modelId: number, file: File) => {
    const formData = new FormData()
    formData.append('photo', file)
    formData.append('modelId', modelId.toString())

    try {
      const response = await fetch('/api/settings/model-photos', {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        const result = await response.json()
        // Update the model with the new photo URL
        setModels(prev => prev.map(model => 
          model.id === modelId 
            ? { ...model, photo_url: result.photo_url }
            : model
        ))
        setSelectedPhoto(null)
      } else {
        console.error('Failed to upload photo')
      }
    } catch (error) {
      console.error('Error uploading photo:', error)
    }
  }

  const filteredModels = models.filter(model =>
    model.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    model.manufacturer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    model.category.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const renderListManager = (
    title: string,
    items: DropdownItem[],
    listType: string,
    icon: React.ReactNode,
    description: string
  ) => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {icon}
          {title}
        </CardTitle>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder={`Add new ${title.toLowerCase()}`}
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddItem(listType)}
          />
          <Button onClick={() => handleAddItem(listType)} size="sm">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {items.map((item, index) => (
            <div key={item.id} className="flex items-center justify-between p-2 bg-muted/50 rounded">
              {editingItem?.type === listType && editingItem?.index === index ? (
                <div className="flex-1 flex gap-2">
                  <Input
                    defaultValue={item.name}
                    className="h-8"
                    onBlur={(e) => handleEditItem(listType, index, e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleEditItem(listType, index, (e.target as HTMLInputElement).value)
                      }
                    }}
                    autoFocus
                  />
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{item.name}</span>
                    {item.color && (
                      <div 
                        className="w-3 h-3 rounded-full border" 
                        style={{ backgroundColor: item.color }}
                      />
                    )}
                  </div>
                  {/* Show usage counts for departments and locations */}
                  {(listType === 'departments' || listType === 'locations') && (item as any)._count && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{(item as any)._count.users} users</span>
                      <span>•</span>
                      <span>{(item as any)._count.assets} assets</span>
                      {listType === 'locations' && (item as any)._count.child_locations && (
                        <>
                          <span>•</span>
                          <span>{(item as any)._count.child_locations} child locations</span>
                        </>
                      )}
                    </div>
                  )}
                </div>
              )}
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditingItem({ type: listType, index })}
                  className="h-8 w-8 p-0"
                >
                  <Edit3 className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteItem(listType, index)}
                  disabled={
                    (listType === 'departments' || listType === 'locations') &&
                    (item as any)._count && 
                    ((item as any)._count.users > 0 || (item as any)._count.assets > 0 || 
                     ((item as any)._count.child_locations && (item as any)._count.child_locations > 0))
                  }
                  className="h-8 w-8 p-0 text-destructive hover:text-destructive disabled:opacity-50 disabled:cursor-not-allowed"
                  title={
                    (listType === 'departments' || listType === 'locations') &&
                    (item as any)._count && 
                    ((item as any)._count.users > 0 || (item as any)._count.assets > 0 || 
                     ((item as any)._count.child_locations && (item as any)._count.child_locations > 0))
                      ? "Cannot delete - item is in use"
                      : "Delete item"
                  }
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )

  const tabs = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'lists', label: 'Dropdown Lists', icon: Tags },
    { id: 'photo-library', label: 'Photo Library', icon: Images },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'database', label: 'Database', icon: Database }
  ]

  return (
    <div className="p-6">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Settings</h1>
            <p className="text-muted-foreground">
              Configure system preferences and manage dropdown lists
            </p>
          </div>
          <Button className="flex items-center gap-2">
            <Save className="h-4 w-4" />
            Save Changes
          </Button>
        </div>

        {/* Tab Navigation */}
        <div className="border-b">
          <nav className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              )
            })}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'general' && (
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  System Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Organization Name</label>
                  <Input defaultValue="Your Company" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Asset Tag Prefix</label>
                  <Input defaultValue="AS-" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Default Currency</label>
                  <select className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm">
                    <option>USD - US Dollar</option>
                    <option>EUR - Euro</option>
                    <option>GBP - British Pound</option>
                  </select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  User Management
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Default Role</label>
                  <select className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm">
                    <option>User</option>
                    <option>Technician</option>
                    <option>Manager</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Auto-assign Location</label>
                  <select className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm">
                    <option>No auto-assignment</option>
                    {dropdownLists.locations.map(location => (
                      <option key={location.id}>{location.name}</option>
                    ))}
                  </select>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'lists' && (
          <div className="space-y-4">
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span>Loading dropdown lists...</span>
                </div>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {renderListManager(
                  'Vendors/Suppliers',
                  dropdownLists.suppliers,
                  'suppliers',
                  <Building2 className="h-5 w-5" />,
                  'Manage vendor and supplier options for purchase tracking'
                )}
                
                {renderListManager(
                  'Manufacturers',
                  dropdownLists.manufacturers,
                  'manufacturers',
                  <Factory className="h-5 w-5" />,
                  'Manage manufacturer options for asset models'
                )}
                
                {renderListManager(
                  'Categories',
                  dropdownLists.categories,
                  'categories',
                  <Package className="h-5 w-5" />,
                  'Manage asset category classifications'
                )}
                
                {renderListManager(
                  'Departments',
                  dropdownLists.departments,
                  'departments',
                  <Users className="h-5 w-5" />,
                  'Manage organizational departments'
                )}
                
                {renderListManager(
                  'Locations',
                  dropdownLists.locations,
                  'locations',
                  <MapPin className="h-5 w-5" />,
                  'Manage physical locations and offices'
                )}
                
                {renderListManager(
                  'Asset Status',
                  dropdownLists.statusLabels,
                  'statusLabels',
                  <Activity className="h-5 w-5" />,
                  'Manage asset lifecycle status options'
                )}
                
                {renderListManager(
                  'Asset Conditions',
                  dropdownLists.assetConditions,
                  'assetConditions',
                  <UserCheck className="h-5 w-5" />,
                  'Manage asset physical condition ratings'
                )}
                
                {renderListManager(
                  'Maintenance Schedules',
                  dropdownLists.maintenanceSchedules,
                  'maintenanceSchedules',
                  <Wrench className="h-5 w-5" />,
                  'Manage maintenance frequency options'
                )}
                
                {renderListManager(
                  'Depreciation Methods',
                  dropdownLists.depreciationMethods,
                  'depreciationMethods',
                  <DollarSign className="h-5 w-5" />,
                  'Manage asset depreciation calculation methods'
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'photo-library' && (
          <div className="space-y-8">
            {/* Category Stock Photos Section */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold">Category Stock Photos</h3>
                <p className="text-sm text-muted-foreground">
                  Set default stock photos for each asset category. These will be available as quick options when creating assets.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {dropdownLists.categories.map((category) => (
                  <Card key={category.id} className="p-4">
                    <div className="space-y-4">
                      {/* Category Stock Photo */}
                      <div className="aspect-square bg-muted rounded-lg overflow-hidden">
                        <div className="w-full h-full flex items-center justify-center">
                          <div className="text-center">
                            <Images className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                            <p className="text-sm text-muted-foreground">Stock Photo</p>
                          </div>
                        </div>
                      </div>

                      {/* Category Information */}
                      <div className="space-y-2">
                        <h4 className="font-semibold text-sm">{category.name}</h4>
                        <p className="text-xs text-muted-foreground">Category stock photo</p>
                      </div>

                      {/* Photo Upload */}
                      <div className="space-y-2">
                        <label className="block">
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0]
                              if (file) {
                                handleCategoryPhotoUpload(category.id, category.name, file)
                              }
                            }}
                          />
                          <Button variant="outline" size="sm" className="w-full" asChild>
                            <span>
                              <Upload className="h-4 w-4 mr-2" />
                              Upload Stock Photo
                            </span>
                          </Button>
                        </label>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full text-red-600 hover:text-red-700"
                          onClick={() => handleCategoryPhotoDelete(category.name)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Remove Photo
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Divider */}
            <div className="border-t pt-8">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Model Photo Library</h3>
                  <p className="text-sm text-muted-foreground">
                    Assign photos to asset models. These photos will be used as defaults for all assets of that model.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search models..."
                      className="w-80 pl-8"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Statistics */}
            {!isLoadingModels && models.length > 0 && (
              <div className="grid gap-4 md:grid-cols-3">
                <Card className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Package className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Total Models</p>
                      <p className="text-2xl font-bold">{models.length}</p>
                    </div>
                  </div>
                </Card>
                <Card className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Camera className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">With Photos</p>
                      <p className="text-2xl font-bold">{models.filter(m => m.photo_url).length}</p>
                    </div>
                  </div>
                </Card>
                <Card className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <AlertTriangle className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Missing Photos</p>
                      <p className="text-2xl font-bold">{models.filter(m => !m.photo_url).length}</p>
                    </div>
                  </div>
                </Card>
              </div>
            )}

            {isLoadingModels ? (
              <div className="flex items-center justify-center h-64">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span>Loading models...</span>
                </div>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredModels.map((model) => (
                  <Card key={model.id} className="p-4">
                    <div className="space-y-4">
                      {/* Model Photo */}
                      <div className="aspect-square bg-muted rounded-lg overflow-hidden">
                        {model.photo_url ? (
                          <img
                            src={model.photo_url}
                            alt={model.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <div className="text-center">
                              <Camera className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                              <p className="text-sm text-muted-foreground">No photo</p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Model Information */}
                      <div className="space-y-2">
                        <h4 className="font-semibold text-sm">{model.name}</h4>
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">
                            <span className="font-medium">Manufacturer:</span> {model.manufacturer}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            <span className="font-medium">Category:</span> {model.category}
                          </p>
                        </div>
                      </div>

                      {/* Photo Upload */}
                      <div className="space-y-2">
                        <label className="block">
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0]
                              if (file) {
                                handlePhotoUpload(model.id, file)
                              }
                            }}
                          />
                          <Button variant="outline" size="sm" className="w-full" asChild>
                            <span>
                              <Upload className="h-4 w-4 mr-2" />
                              {model.photo_url ? 'Replace Photo' : 'Upload Photo'}
                            </span>
                          </Button>
                        </label>
                        {model.photo_url && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full text-red-600 hover:text-red-700"
                            onClick={async () => {
                              if (confirm('Are you sure you want to remove this photo?')) {
                                try {
                                  const response = await fetch(`/api/settings/model-photos?modelId=${model.id}`, {
                                    method: 'DELETE'
                                  })
                                  
                                  if (response.ok) {
                                    setModels(prev => prev.map(m => 
                                      m.id === model.id 
                                        ? { ...m, photo_url: undefined }
                                        : m
                                    ))
                                  } else {
                                    console.error('Failed to remove photo')
                                  }
                                } catch (error) {
                                  console.error('Error removing photo:', error)
                                }
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Remove Photo
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {filteredModels.length === 0 && !isLoadingModels && (
              <div className="text-center py-12">
                <Images className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No models found</h3>
                <p className="text-muted-foreground">
                  {searchTerm 
                    ? 'No models match your search criteria.'
                    : 'No asset models have been created yet. Models are automatically created when you add assets.'
                  }
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'security' && (
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Authentication Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-sm">Two-Factor Authentication</div>
                    <div className="text-xs text-muted-foreground">Enhanced security for all users</div>
                  </div>
                  <Badge variant="secondary">Disabled</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-sm">Session Timeout</div>
                    <div className="text-xs text-muted-foreground">Auto-logout after inactivity</div>
                  </div>
                  <select className="h-8 rounded border px-2 text-sm">
                    <option>30 minutes</option>
                    <option>1 hour</option>
                    <option>4 hours</option>
                    <option>8 hours</option>
                  </select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Data Protection
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-sm">Data Encryption</div>
                    <div className="text-xs text-muted-foreground">Encrypt sensitive data at rest</div>
                  </div>
                  <Badge variant="default">Active</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-sm">Audit Logging</div>
                    <div className="text-xs text-muted-foreground">Log all user actions</div>
                  </div>
                  <Badge variant="default">Active</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'database' && (
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Backup Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-sm">Automatic Backups</div>
                    <div className="text-xs text-muted-foreground">Daily at 2:00 AM</div>
                  </div>
                  <Badge variant="default">Active</Badge>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Backup Retention</label>
                  <select className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm">
                    <option>30 days</option>
                    <option>90 days</option>
                    <option>1 year</option>
                    <option>Indefinite</option>
                  </select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Maintenance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button variant="outline" className="w-full">
                  Run Database Optimization
                </Button>
                <Button variant="outline" className="w-full">
                  Clear Cache
                </Button>
                <Button variant="outline" className="w-full">
                  Export System Logs
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
} 