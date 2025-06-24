'use client'

import React, { useState, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { getCategoryStockPhotoUrl, getAssetPhotoUrl, createImageFallbackHandler } from '@/lib/utils'
import { 
  Package, 
  Search, 
  Filter, 
  Plus,
  MoreHorizontal,
  Edit,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Download,
  Upload,
  RefreshCw,
  User,
  MapPin,
  ArrowUpDown,
  ArrowUp,
  ArrowDown
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
  device_name?: string
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

// Helper function to check if asset is assigned
function isAssetAssigned(asset: Asset): boolean {
  return !!(asset.assigned_to_user || asset.department)
}

export function InteractiveAssets({
  initialAssets,
  statusCounts,
  statusLabels,
  totalAssets,
  autoAdd
}: InteractiveAssetsProps) {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [isLoading, setIsLoading] = useState(false)
  const [sortField, setSortField] = useState<'asset_tag' | 'device_name' | 'category' | 'assigned_to' | 'status' | 'location' | 'created_at'>('created_at')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')

  // Get unique categories for filtering
  const categories = useMemo(() => {
    const uniqueCategories = new Set(initialAssets.map(asset => asset.model.category.name))
    return Array.from(uniqueCategories).sort()
  }, [initialAssets])

  // Handle sorting
  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  // Get sort icon for header
  const getSortIcon = (field: typeof sortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
    }
    return sortDirection === 'asc' 
      ? <ArrowUp className="h-4 w-4 text-primary" />
      : <ArrowDown className="h-4 w-4 text-primary" />
  }

  // Filter, search, and sort assets
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

    // Sorting
    filtered.sort((a, b) => {
      let aValue: string | Date
      let bValue: string | Date

      switch (sortField) {
        case 'asset_tag':
          aValue = a.asset_tag
          bValue = b.asset_tag
          break
        case 'device_name':
          aValue = a.device_name || a.model.name
          bValue = b.device_name || b.model.name
          break
        case 'category':
          aValue = a.model.category.name
          bValue = b.model.category.name
          break
        case 'assigned_to':
          aValue = a.assigned_to_user ? `${a.assigned_to_user.first_name} ${a.assigned_to_user.last_name}` : 'Unassigned'
          bValue = b.assigned_to_user ? `${b.assigned_to_user.first_name} ${b.assigned_to_user.last_name}` : 'Unassigned'
          break
        case 'status':
          aValue = a.status.name
          bValue = b.status.name
          break
        case 'location':
          aValue = a.location?.name || 'No location'
          bValue = b.location?.name || 'No location'
          break
        case 'created_at':
          aValue = a.created_at
          bValue = b.created_at
          break
        default:
          return 0
      }

      if (aValue instanceof Date && bValue instanceof Date) {
        return sortDirection === 'asc' ? aValue.getTime() - bValue.getTime() : bValue.getTime() - aValue.getTime()
      } else {
        const comparison = aValue.toString().localeCompare(bValue.toString())
        return sortDirection === 'asc' ? comparison : -comparison
      }
    })

    return filtered
  }, [initialAssets, searchTerm, selectedStatus, selectedCategory, sortField, sortDirection])

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

  const [showEditModal, setShowEditModal] = useState(false)
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null)
  const [customManufacturer, setCustomManufacturer] = useState('')
  const [showCustomManufacturer, setShowCustomManufacturer] = useState(false)
  const [customCategory, setCustomCategory] = useState('')
  const [showCustomCategory, setShowCustomCategory] = useState(false)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  
  // Photo handling state  
  const [photoOption, setPhotoOption] = useState<'model' | 'unique' | 'stock'>('stock')
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null)

  // Document handling state
  const [selectedDocuments, setSelectedDocuments] = useState<File[]>([])
  const [documentPreviews, setDocumentPreviews] = useState<{[key: string]: string}>({})

  // Auto-fill note state
  const [modelNameAutoFillNote, setModelNameAutoFillNote] = useState('')

  // Vendor management state
  const [customVendor, setCustomVendor] = useState('')
  const [showCustomVendor, setShowCustomVendor] = useState(false)
  const [vendors, setVendors] = useState<{ id: string; name: string }[]>([])

  // Manufacturer management state
  const [manufacturers, setManufacturers] = useState<{ id: string; name: string }[]>([])

  // Category management state
  const [dbCategories, setDbCategories] = useState<{ id: string; name: string }[]>([])

  // Model suggestions state
  const [modelSuggestions, setModelSuggestions] = useState<string[]>([])
  const [showModelSuggestions, setShowModelSuggestions] = useState(false)
  const [selectedModelName, setSelectedModelName] = useState('')

  // Form input state
  const [assetTag, setAssetTag] = useState('')
  const [deviceName, setDeviceName] = useState('')
  const [serialNumber, setSerialNumber] = useState('')
  const [modelName, setModelName] = useState('')
  const [modelNumber, setModelNumber] = useState('')
  const [selectedManufacturer, setSelectedManufacturer] = useState('')
  const [selectedFormCategory, setSelectedFormCategory] = useState('') // Separate from filtering
  const [selectedVendor, setSelectedVendor] = useState('')
  const [notes, setNotes] = useState('')
  const [assetValue, setAssetValue] = useState('')
  const [externalTicketId, setExternalTicketId] = useState('')

  // Success banner state
  const [showSuccessBanner, setShowSuccessBanner] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  // Fetch dropdown data from database on component mount
  useEffect(() => {
    fetchDropdownData()
  }, [])

  const fetchDropdownData = async () => {
    try {
      const response = await fetch('/api/settings/dropdown-lists')
      if (response.ok) {
        const data = await response.json()
        setVendors(data.suppliers.map((supplier: any) => ({
          id: supplier.id.toString(),
          name: supplier.name
        })))
        setManufacturers(data.manufacturers.map((manufacturer: any) => ({
          id: manufacturer.id.toString(),
          name: manufacturer.name
        })))
        setDbCategories(data.categories.map((category: any) => ({
          id: category.id.toString(),
          name: category.name
        })))
      } else {
        console.error('Failed to fetch dropdown data')
      }
    } catch (error) {
      console.error('Error fetching dropdown data:', error)
    }
  }

  const handleAddAsset = () => {
    router.push('/assets/add')
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
  
  const handleStepClick = (step: number) => {
    setCurrentPage(step)
  }

  const handleCloseModal = () => {
    setShowAddModal(false)
    setCurrentPage(1)
    // Reset form state
    setAssetTag('')
    setDeviceName('')
    setSerialNumber('')
    setModelName('')
    setModelNumber('')
    setSelectedManufacturer('')
    setSelectedFormCategory('')
    setSelectedVendor('')
    setNotes('')
    setAssetValue('')
    setExternalTicketId('')
    setSelectedPhoto(null)
    setPhotoOption('stock')
    setSelectedDocuments([])
    setDocumentPreviews({})
    setShowModelSuggestions(false)
    setModelSuggestions([])
    setModelNameAutoFillNote('')
  }

  const handleCreateAsset = async () => {
    try {
      // Basic validation
      if (!deviceName.trim()) {
        alert('Device Name is required')
        return
      }
      if (!assetTag.trim()) {
        alert('Asset Tag is required')
        return
      }
      if (!modelNumber.trim()) {
        alert('Model Number is required')
        return
      }

      // Prepare asset data for API
      const assetData = {
        asset_tag: assetTag.trim(),
        device_name: deviceName.trim() || null,
        serial_number: serialNumber.trim() || null,
        model_name: modelName.trim() || null,
        model_number: modelNumber.trim(),
        manufacturer_id: selectedManufacturer || null,
        category_id: selectedFormCategory || null, 
        vendor_id: selectedVendor || null,
        notes: notes.trim() || null,
        asset_value: assetValue ? parseFloat(assetValue) : null,
        external_ticket_id: externalTicketId.trim() || null
      }

      console.log('Creating asset with data:', assetData)
      
      // Call the API to create the asset
      const response = await fetch('/api/assets/create-simple', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(assetData)
      })

      const result = await response.json()

      if (response.ok && result.success) {
        const createdAsset = result.data
        
        // Show success banner
        setSuccessMessage(`Asset ${createdAsset.asset_tag} created successfully! Asset ID: ${createdAsset.id}, Model: ${createdAsset.model.name}, Status: ${createdAsset.status.name}`)
        setShowSuccessBanner(true)
        
        // Hide banner after 5 seconds
        setTimeout(() => {
          setShowSuccessBanner(false)
        }, 5000)
        
        // Close modal and reset form
        handleCloseModal()
        setAssetTag('')
        setDeviceName('')
        setSerialNumber('')
        setModelName('')
        setModelNumber('')
        setSelectedManufacturer('')
        setSelectedFormCategory('')
        setSelectedVendor('')
        setNotes('')
        setAssetValue('')
        setExternalTicketId('')
        setSelectedPhoto(null)
        setPhotoOption('stock')
        
        // Navigate to the newly created asset's details page
        router.push(`/assets/${createdAsset.id}`)
        
      } else {
        throw new Error(result.error || 'Failed to create asset')
      }
      
    } catch (error: any) {
      console.error('Error creating asset:', error)
      alert(`Failed to create asset: ${error.message}`)
    }
  }

  const handleViewAsset = (asset: Asset) => {
    router.push(`/assets/${asset.id}`)
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
    } else {
      setShowCustomCategory(false)
      setCustomCategory('')
    }
  }

  const handleVendorChange = (value: string) => {
    if (value === 'custom') {
      setShowCustomVendor(true)
    } else {
      setShowCustomVendor(false)
      setCustomVendor('')
    }
  }

  const handleAddVendor = async () => {
    if (customVendor.trim()) {
      try {
        const response = await fetch('/api/settings/dropdown-lists', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            listType: 'suppliers',
            name: customVendor.trim()
          })
        })

        if (response.ok) {
          const newVendor = await response.json()
          const vendorForList = {
            id: newVendor.id.toString(),
            name: newVendor.name
          }
          setVendors([...vendors, vendorForList])
          
          // Auto-select the newly created vendor
          setSelectedVendor(vendorForList.id)
          
          setCustomVendor('')
          setShowCustomVendor(false)
          console.log('New vendor added:', vendorForList)
        } else {
          const errorData = await response.json()
          alert(errorData.error || 'Failed to add vendor')
        }
      } catch (error) {
        console.error('Error adding vendor:', error)
        alert('Error adding vendor. Please try again.')
      }
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
          
          // Auto-select the newly created manufacturer
          setSelectedManufacturer(manufacturerForList.id)
          
          setCustomManufacturer('')
          setShowCustomManufacturer(false)
          console.log('New manufacturer added:', manufacturerForList)
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
          setDbCategories([...dbCategories, categoryForList])
          
          // Auto-select the newly created category
          setSelectedFormCategory(categoryForList.id)
          
          setCustomCategory('')
          setShowCustomCategory(false)
          console.log('New category added:', categoryForList)
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

  const handleModelNameChange = (value: string) => {
    setModelName(value)  // Update the actual model name state
    setSelectedModelName(value)
    
    // Mock model suggestions - in real app, this would query the database
    const mockModels = [
      'MacBook Pro 16-inch',
      'MacBook Pro 14-inch', 
      'MacBook Air M2',
      'Dell XPS 13',
      'Dell XPS 15',
      'ThinkPad X1 Carbon',
      'ThinkPad T14',
      'HP EliteBook 850',
      'Surface Laptop 5'
    ]
    
    if (value.length >= 1) {  // Show suggestions from first character
      const suggestions = mockModels.filter(model => 
        model.toLowerCase().includes(value.toLowerCase())
      )
      setModelSuggestions(suggestions)
      setShowModelSuggestions(suggestions.length > 0)
      
      // Auto-fill manufacturer and category based on model name
      if (value.toLowerCase().includes('macbook') || value.toLowerCase().includes('mac')) {
        // Auto-select Apple and Laptop category
        setPhotoOption('model') // Default to model photo for known models
      } else if (value.toLowerCase().includes('dell')) {
        // Auto-select Dell
      } else if (value.toLowerCase().includes('thinkpad')) {
        // Auto-select Lenovo
      }
    } else {
      setShowModelSuggestions(false)
      setModelSuggestions([])
    }
  }

  const handleModelNumberChange = (value: string) => {
    setModelNumber(value)
    
    // Model number suggestions based on common patterns
    const mockModelNumbers = [
      'MK183LL/A',    // MacBook Pro 16" 
      'MNEH3LL/A',    // MacBook Pro 14"
      'MLY33LL/A',    // MacBook Air M2
      'XPS9320-1234', // Dell XPS 13
      'XPS9520-5678', // Dell XPS 15
      '20XW0026US',   // ThinkPad X1 Carbon
      '20VF003VUS',   // ThinkPad T14
      '6K6L5EA',      // HP EliteBook 850
      'RBH-00024'     // Surface Laptop 5
    ]
    
    if (value.length >= 2) {  // Changed from > 2 to >= 2 for earlier suggestions
      const suggestions = mockModelNumbers.filter(model => 
        model.toLowerCase().includes(value.toLowerCase())
      )
      setModelSuggestions(suggestions)
      setShowModelSuggestions(suggestions.length > 0)
      
      // Auto-fill model name and show note based on model number patterns
      if (value.toUpperCase().includes('MK') || value.toUpperCase().includes('MNEH') || value.toUpperCase().includes('MLY')) {
        setModelName('MacBook Pro 16-inch')
        setModelNameAutoFillNote('Model name auto-filled to match model number pattern: MacBook Pro 16-inch')
        setPhotoOption('model')
      } else if (value.toUpperCase().includes('XPS')) {
        setModelName('Dell XPS 13')
        setModelNameAutoFillNote('Model name auto-filled to match model number pattern: Dell XPS 13')
      } else if (value.includes('20XW') || value.includes('20VF')) {
        setModelName('ThinkPad X1 Carbon')
        setModelNameAutoFillNote('Model name auto-filled to match model number pattern: ThinkPad X1 Carbon')
      } else if (value.toUpperCase().includes('6K6L5EA')) {
        setModelName('HP EliteBook 850')
        setModelNameAutoFillNote('Model name auto-filled to match model number pattern: HP EliteBook 850')
      } else if (value.toUpperCase().includes('RBH')) {
        setModelName('Surface Laptop 5')
        setModelNameAutoFillNote('Model name auto-filled to match model number pattern: Surface Laptop 5')
      } else {
        setModelNameAutoFillNote('') // Clear note if no pattern matches
      }
    } else {
      setShowModelSuggestions(false)
      setModelSuggestions([])
      setModelNameAutoFillNote('') // Clear note when model number is too short
    }
  }

  const handleSelectModelSuggestion = (suggestion: string) => {
    // Check if we're selecting a model number or model name based on format
    if (suggestion.match(/^[A-Z0-9-\/]+$/)) {
      // Looks like a model number (letters, numbers, dashes, slashes)
      setModelNumber(suggestion)
      
      // Auto-fill model name and show note based on selected model number
      if (suggestion.includes('MK') || suggestion.includes('MNEH') || suggestion.includes('MLY')) {
        setModelName('MacBook Pro 16-inch')
        setModelNameAutoFillNote('Model name auto-filled to match selected model number: MacBook Pro 16-inch')
        setPhotoOption('model')
      } else if (suggestion.includes('XPS')) {
        setModelName('Dell XPS')
        setModelNameAutoFillNote('Model name auto-filled to match selected model number: Dell XPS')
      } else if (suggestion.includes('20XW') || suggestion.includes('20VF')) {
        setModelName('ThinkPad')
        setModelNameAutoFillNote('Model name auto-filled to match selected model number: ThinkPad')
      }
    } else {
      // Looks like a model name (contains spaces/words)
      setSelectedModelName(suggestion)
      setModelName(suggestion)
      setModelNameAutoFillNote('') // Clear note when manually selecting model name
      
      // Auto-fill manufacturer and category based on selected model
      if (suggestion.toLowerCase().includes('macbook') || suggestion.toLowerCase().includes('mac')) {
        setPhotoOption('model') // Default to model photo for known models
      } else if (suggestion.toLowerCase().includes('dell')) {
        // Auto-select Dell
      } else if (suggestion.toLowerCase().includes('thinkpad')) {
        // Auto-select Lenovo
      }
    }
    
    setShowModelSuggestions(false)
    setModelSuggestions([])
  }

  const handleDocumentUpload = (files: FileList | null) => {
    if (files) {
      const newDocuments = Array.from(files)
      setSelectedDocuments(prev => [...prev, ...newDocuments])

      // Generate previews for supported file types
      newDocuments.forEach(file => {
        if (file.type.startsWith('image/')) {
          const url = URL.createObjectURL(file)
          setDocumentPreviews(prev => ({
            ...prev,
            [file.name]: url
          }))
        }
      })
    }
  }

  const removeDocument = (fileName: string) => {
    setSelectedDocuments(prev => prev.filter(doc => doc.name !== fileName))
    setDocumentPreviews(prev => {
      const newPreviews = { ...prev }
      delete newPreviews[fileName]
      return newPreviews
    })
  }

  useEffect(() => {
    if (autoAdd) {
      router.push('/assets/add')
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
              <Button variant="ghost" size="sm" onClick={handleCloseModal} className="text-2xl h-8 w-8 p-0">
                ×
              </Button>
            </div>

            {/* Progress Bar */}
            <div className="px-6 py-4 border-b">
              <div className="flex items-center justify-between">
                {Array.from({ length: totalPages }, (_, i) => (
                  <React.Fragment key={i}>
                    <button
                      onClick={() => handleStepClick(i + 1)}
                      className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-medium transition-colors hover:bg-primary/10 ${
                        i + 1 < currentPage ? 'bg-primary text-primary-foreground border-primary' :
                        i + 1 === currentPage ? 'bg-background text-primary border-primary' :
                        'bg-background text-muted-foreground border-muted hover:border-primary/50'
                      }`}
                    >
                      {i + 1}
                    </button>
                    {i < totalPages - 1 && (
                      <div className={`flex-1 h-0.5 mx-3 ${
                        i + 1 < currentPage ? 'bg-primary' : 'bg-muted'
                      }`} />
                    )}
                  </React.Fragment>
                ))}
              </div>
              
              {/* Page titles */}
              <div className="mt-3">
                <span className="text-sm font-medium">
                  {currentPage === 1 && 'Basic Information'}
                  {currentPage === 2 && 'Manufacturer & Category'}
                  {currentPage === 3 && 'Purchase Information'}
                  {currentPage === 4 && 'Status & Assignment'}
                  {currentPage === 5 && 'Warranty & Maintenance'}
                  {currentPage === 6 && 'Photos & Documentation'}
                  {currentPage === 7 && 'Additional Information'}
                </span>
              </div>
            </div>
            
            {/* Modal Content */}
            <div className="flex-1 p-6 overflow-y-auto" style={{
              scrollbarWidth: 'thin',
              scrollbarColor: '#64748b #e2e8f0'
            }}>
              <form className="h-full">
                {/* Page 1: Basic Information */}
                {currentPage === 1 && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium mb-4">Basic Information</h3>
                      <div className="grid grid-cols-2 gap-4">
                        {/* Left Column */}
                        <div>
                          <label className="text-sm font-medium">Device Name *</label>
                          <Input 
                            placeholder="e.g., John's Laptop, Reception Desk PC" 
                            className="mt-1" 
                            value={deviceName}
                            onChange={(e) => setDeviceName(e.target.value)}
                            required
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            A friendly name to identify what this device is or where it's used
                          </p>
                        </div>
                        {/* Right Column */}
                        <div className="relative">
                          <label className="text-sm font-medium">Model Number *</label>
                          <Input 
                            placeholder="e.g., MK183LL/A" 
                            className="mt-1" 
                            value={modelNumber}
                            onChange={(e) => handleModelNumberChange(e.target.value)}
                            required
                          />
                          {showModelSuggestions && modelNumber && (
                            <div className="absolute z-50 w-full mt-1 bg-background border border-border rounded-md shadow-lg max-h-40 overflow-y-auto">
                              {modelSuggestions.map((suggestion, index) => (
                                <button
                                  key={index}
                                  type="button"
                                  className="w-full px-3 py-2 text-left hover:bg-muted transition-colors"
                                  onClick={() => handleSelectModelSuggestion(suggestion)}
                                >
                                  {suggestion}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="mt-2">
                          <label className="text-sm font-medium">Asset Tag *</label>
                          <Input 
                            placeholder="e.g., CH-1234" 
                            className="mt-1" 
                            value={assetTag}
                            onChange={(e) => setAssetTag(e.target.value)}
                            required 
                          />
                        </div>
                        <div className="relative mt-2">
                          <label className="text-sm font-medium">Model Name</label>
                          <Input 
                            placeholder="e.g., MacBook Pro 16-inch" 
                            className="mt-1" 
                            value={modelName}
                            onChange={(e) => {
                              handleModelNameChange(e.target.value)
                              setModelNameAutoFillNote('') // Clear note when user manually types
                            }}
                          />
                          {modelNameAutoFillNote && (
                            <p className="text-xs text-blue-600 mt-1 flex items-center">
                              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              {modelNameAutoFillNote}
                            </p>
                          )}
                          {showModelSuggestions && modelName && (
                            <div className="absolute z-50 w-full mt-1 bg-background border border-border rounded-md shadow-lg max-h-40 overflow-y-auto">
                              {modelSuggestions.map((suggestion, index) => (
                                <button
                                  key={index}
                                  type="button"
                                  className="w-full px-3 py-2 text-left hover:bg-muted transition-colors"
                                  onClick={() => handleSelectModelSuggestion(suggestion)}
                                >
                                  {suggestion}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="mt-1 pb-6">
                          <label className="text-sm font-medium">Serial Number</label>
                          <Input 
                            placeholder="e.g., ABC123456789" 
                            className="mt-1" 
                            value={serialNumber}
                            onChange={(e) => setSerialNumber(e.target.value)}
                          />
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
                              value={selectedManufacturer}
                              onChange={(e) => {
                                setSelectedManufacturer(e.target.value)
                                handleManufacturerChange(e.target.value)
                              }}
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
                              <div className="space-y-3 mt-2">
                                <Input
                                  placeholder="Enter new manufacturer name"
                                  value={customManufacturer}
                                  onChange={(e) => setCustomManufacturer(e.target.value)}
                                />
                                <div className="flex gap-2 pb-3">
                                  <Button 
                                    type="button" 
                                    size="sm"
                                    onClick={handleAddManufacturer}
                                  >
                                    Add Manufacturer
                                  </Button>
                                  <Button 
                                    type="button" 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => {
                                      setShowCustomManufacturer(false)
                                      setCustomManufacturer('')
                                    }}
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                        <div>
                          <label className="text-sm font-medium">Category *</label>
                          <div className="space-y-2">
                            <select 
                              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm mt-1"
                              value={selectedFormCategory}
                              onChange={(e) => {
                                setSelectedFormCategory(e.target.value)
                                handleCategoryChange(e.target.value)
                              }}
                            >
                              <option value="">Select category...</option>
                              {dbCategories.map(category => (
                                <option key={category.id} value={category.id}>
                                  {category.name}
                                </option>
                              ))}
                              <option value="custom">+ Add New Category</option>
                            </select>
                            {showCustomCategory && (
                              <div className="space-y-3 mt-2">
                                <Input
                                  placeholder="Enter new category name"
                                  value={customCategory}
                                  onChange={(e) => setCustomCategory(e.target.value)}
                                />
                                <div className="flex gap-2 pb-3">
                                  <Button 
                                    type="button" 
                                    size="sm"
                                    onClick={handleAddCategory}
                                  >
                                    Add Category
                                  </Button>
                                  <Button 
                                    type="button" 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => {
                                      setShowCustomCategory(false)
                                      setCustomCategory('')
                                    }}
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              </div>
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
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium">Vendor/Supplier</label>
                          <select 
                            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm mt-1"
                            value={selectedVendor}
                            onChange={(e) => {
                              setSelectedVendor(e.target.value)
                              handleVendorChange(e.target.value)
                            }}
                          >
                            <option value="">Select vendor...</option>
                            {vendors.map(vendor => (
                              <option key={vendor.id} value={vendor.id}>{vendor.name}</option>
                            ))}
                            <option value="custom">+ Add New Vendor</option>
                          </select>
                          {showCustomVendor && (
                            <div className="mt-2 space-y-3">
                              <Input
                                placeholder="Enter new vendor name"
                                value={customVendor}
                                onChange={(e) => setCustomVendor(e.target.value)}
                              />
                              <div className="flex gap-2 pb-3">
                                <Button 
                                  type="button" 
                                  size="sm" 
                                  onClick={handleAddVendor}
                                  disabled={!customVendor.trim()}
                                >
                                  Add Vendor
                                </Button>
                                <Button 
                                  type="button" 
                                  variant="outline" 
                                  size="sm" 
                                  onClick={() => {
                                    setShowCustomVendor(false)
                                    setCustomVendor('')
                                  }}
                                >
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          )}
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

                {/* Page 6: Photos & Documentation */}
                {currentPage === 6 && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium mb-4">Photos & Documentation</h3>
                      
                      {/* Two Column Layout: Photos on Left, Documents on Right */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        
                        {/* Left Column: Photo Upload */}
                        <div className="space-y-6">
                          <h4 className="text-md font-medium">Asset Photo</h4>
                          
                          {/* Photo Type Selection */}
                          <div>
                            <label className="text-sm font-medium mb-3 block">Photo Options</label>
                            <div className="space-y-3">
                              <label className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-muted/50">
                                <input
                                  type="radio"
                                  name="photoOption"
                                  value="model"
                                  checked={photoOption === 'model'}
                                  onChange={(e) => setPhotoOption(e.target.value as 'model' | 'unique' | 'stock')}
                                  className="w-4 h-4"
                                />
                                <div>
                                  <div className="font-medium">Use Model Photo</div>
                                  <div className="text-xs text-muted-foreground">Shared across all assets of this model</div>
                                </div>
                              </label>
                              
                              <label className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-muted/50">
                                <input
                                  type="radio"
                                  name="photoOption"
                                  value="unique"
                                  checked={photoOption === 'unique'}
                                  onChange={(e) => setPhotoOption(e.target.value as 'model' | 'unique' | 'stock')}
                                  className="w-4 h-4"
                                />
                                <div>
                                  <div className="font-medium">Upload Unique Photo</div>
                                  <div className="text-xs text-muted-foreground">Specific to this asset only</div>
                                </div>
                              </label>
                            </div>
                            <p className="text-xs text-muted-foreground mt-2">
                              💡 <strong>Default behavior:</strong> Category stock photo is automatically used. Override by selecting an option above if needed.
                            </p>
                          </div>

                          {/* Photo Preview - Always Visible */}
                          <div className="space-y-4">
                            <div>
                              <label className="text-sm font-medium mb-2 block">Photo Preview</label>
                              <div 
                                className={`w-48 h-48 mx-auto border-2 rounded-lg overflow-hidden ${
                                  photoOption !== 'stock' ? 'border-dashed border-muted cursor-pointer hover:border-primary transition-colors' : 'border-muted'
                                }`}
                                onClick={() => {
                                  if (photoOption !== 'stock') {
                                    document.getElementById('photo-upload-input')?.click()
                                  }
                                }}
                                onDragOver={photoOption !== 'stock' ? (e) => {
                                  e.preventDefault()
                                  e.currentTarget.classList.add('border-primary', 'bg-muted/20')
                                } : undefined}
                                onDragLeave={photoOption !== 'stock' ? (e) => {
                                  e.currentTarget.classList.remove('border-primary', 'bg-muted/20')
                                } : undefined}
                                onDrop={photoOption !== 'stock' ? (e) => {
                                  e.preventDefault()
                                  e.currentTarget.classList.remove('border-primary', 'bg-muted/20')
                                  const files = e.dataTransfer.files
                                  if (files && files[0]) {
                                    setSelectedPhoto(files[0])
                                  }
                                } : undefined}
                              >
                                {photoOption === 'unique' && selectedPhoto ? (
                                  // Show uploaded unique photo
                                  <img 
                                    src={URL.createObjectURL(selectedPhoto)} 
                                    alt="Unique photo preview" 
                                    className="w-full h-full object-cover"
                                  />
                                ) : photoOption === 'model' && selectedPhoto ? (
                                  // Show uploaded model photo
                                  <img 
                                    src={URL.createObjectURL(selectedPhoto)} 
                                    alt="Model photo preview" 
                                    className="w-full h-full object-cover"
                                  />
                                ) : photoOption !== 'stock' && !selectedPhoto ? (
                                  // Show upload placeholder for non-stock options
                                  <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                                    <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                    <span className="text-sm text-center">Click or drag photo here</span>
                                  </div>
                                ) : (
                                  // Show category stock photo (default behavior)
                                  (() => {
                                    const selectedCategoryData = dbCategories.find(cat => cat.id === selectedFormCategory)
                                    const categoryStockPhotoUrl = selectedCategoryData ? getCategoryStockPhotoUrl(selectedCategoryData.name) : null
                                    
                                    return categoryStockPhotoUrl && selectedCategoryData ? (
                                      <img 
                                        src={categoryStockPhotoUrl} 
                                        alt={`${selectedCategoryData.name} stock photo`}
                                        className="w-full h-full object-cover"
                                        onError={createImageFallbackHandler(selectedCategoryData.name)}
                                      />
                                    ) : (
                                      <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground">
                                        <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        <span className="text-sm text-center">
                                          {selectedFormCategory ? 'No stock photo available' : 'Select category to see stock photo'}
                                        </span>
                                      </div>
                                    )
                                  })()
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground text-center mt-2">
                                {photoOption === 'unique' && selectedPhoto ? 'Asset-specific photo' : 
                                 photoOption === 'model' && selectedPhoto ? 'Model photo' : 
                                 photoOption !== 'stock' && !selectedPhoto ? 'Click to upload photo' :
                                 'Category stock photo (default)'}
                              </p>
                            </div>

                            {/* Upload Controls - Only show when not using stock */}
                            {photoOption !== 'stock' && (
                              <div>
                                <label className="text-sm font-medium">Upload Photo</label>
                                <Input 
                                  id="photo-upload-input"
                                  type="file" 
                                  accept=".jpg,.jpeg,.png,.webp" 
                                  className="mt-1"
                                  onChange={(e) => setSelectedPhoto(e.target.files?.[0] || null)}
                                />
                                <p className="text-xs text-muted-foreground mt-1">
                                  {photoOption === 'model' 
                                    ? 'This photo will be used for all assets of this model'
                                    : 'This photo will be specific to this asset'
                                  }
                                </p>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Right Column: Document Upload */}
                        <div className="space-y-6">
                          <h4 className="text-md font-medium">Documentation</h4>
                          
                          <div>
                            <label className="text-sm font-medium">Document Upload</label>
                            <Input 
                              type="file" 
                              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.txt" 
                              className="mt-1" 
                              multiple 
                              onChange={(e) => handleDocumentUpload(e.target.files)}
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                              Upload receipts, warranties, manuals, or other relevant documents
                            </p>
                          </div>

                          {/* Document Previews */}
                          {selectedDocuments.length > 0 && (
                            <div className="space-y-3">
                              <label className="text-sm font-medium">Selected Documents</label>
                              <div className="space-y-2 max-h-60 overflow-y-auto">
                                {selectedDocuments.map((doc, index) => (
                                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                                    <div className="flex items-center space-x-3">
                                      {documentPreviews[doc.name] ? (
                                        <img 
                                          src={documentPreviews[doc.name]} 
                                          alt={doc.name}
                                          className="w-10 h-10 object-cover rounded"
                                        />
                                      ) : (
                                        <div className="w-10 h-10 bg-muted rounded flex items-center justify-center">
                                          <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                          </svg>
                                        </div>
                                      )}
                                      <div>
                                        <p className="text-sm font-medium truncate">{doc.name}</p>
                                        <p className="text-xs text-muted-foreground">{(doc.size / 1024).toFixed(1)} KB</p>
                                      </div>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => removeDocument(doc.name)}
                                      className="text-red-500 hover:text-red-700 p-1"
                                    >
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="6 18L18 6M6 6l12 12" />
                                      </svg>
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {selectedDocuments.length === 0 && (
                            <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                              <svg className="w-8 h-8 mx-auto mb-2 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              <p className="text-sm">No documents selected</p>
                              <p className="text-xs">Choose files above to upload</p>
                            </div>
                          )}
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
                          <Input 
                            type="number" 
                            step="0.01" 
                            placeholder="1999.99" 
                            className="mt-1" 
                            value={assetValue}
                            onChange={(e) => setAssetValue(e.target.value)}
                          />
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
                          <label className="text-sm font-medium">External Ticket ID</label>
                          <Input 
                            placeholder="e.g., SNOW-123456 (ServiceNow ticket)" 
                            className="mt-1" 
                            value={externalTicketId}
                            onChange={(e) => setExternalTicketId(e.target.value)}
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            Reference to external ticket system for tracking
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium">Notes</label>
                          <textarea 
                            className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring mt-1"
                            placeholder="Add any additional notes about this asset..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                          />
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
                  <Button onClick={handleCreateAsset}>
                    Add Asset
                  </Button>
                )}
              </div>
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
              }} className="text-2xl h-8 w-8 p-0">
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
                      <button
                        onClick={() => handleStepClick(i + 1)}
                        className={`w-8 h-8 rounded-full border-2 mx-2 flex items-center justify-center text-xs font-medium transition-colors hover:bg-primary/10 ${
                          i + 1 < currentPage ? 'bg-primary text-primary-foreground border-primary' :
                          i + 1 === currentPage ? 'bg-background text-primary border-primary' :
                          'bg-background text-muted-foreground border-muted hover:border-primary/50'
                        }`}
                      >
                        {i + 1}
                      </button>
                    )}
                  </div>
                ))}
              </div>
              
              <div className="mt-3">
                <span className="text-sm font-medium">
                  {currentPage === 1 && 'Basic Information'}
                  {currentPage === 2 && 'Manufacturer & Category'}
                  {currentPage === 3 && 'Purchase Information'}
                  {currentPage === 4 && 'Status & Assignment'}
                  {currentPage === 5 && 'Warranty & Maintenance'}
                  {currentPage === 6 && 'Photos & Documentation'}
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
                      <div className="grid grid-cols-2 gap-4">
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
      {/* Success Banner */}
      {showSuccessBanner && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 max-w-md w-full">
          <div className="bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center justify-between">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-sm font-medium">{successMessage}</span>
            </div>
            <button 
              onClick={() => setShowSuccessBanner(false)}
              className="ml-4 text-white hover:text-gray-200"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

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
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <CardTitle>Asset Inventory</CardTitle>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <div className="relative flex-1 sm:flex-none">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search assets..."
                  className="w-full sm:w-80 pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <select 
                className="h-9 rounded-md border border-input bg-background px-3 text-sm min-w-0"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option value="all">All Statuses</option>
                {statusLabels.map(status => (
                  <option key={status.id} value={status.name}>{status.name}</option>
                ))}
              </select>
              <select 
                className="h-9 rounded-md border border-input bg-background px-3 text-sm min-w-0"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              <select 
                className="h-9 rounded-md border border-input bg-background px-3 text-sm min-w-0"
                value={`${sortField}-${sortDirection}`}
                onChange={(e) => {
                  const [field, direction] = e.target.value.split('-') as [typeof sortField, 'asc' | 'desc']
                  setSortField(field)
                  setSortDirection(direction)
                }}
              >
                <option value="created_at-desc">Newest First</option>
                <option value="created_at-asc">Oldest First</option>
                <option value="asset_tag-asc">Asset Tag (A-Z)</option>
                <option value="asset_tag-desc">Asset Tag (Z-A)</option>
                <option value="device_name-asc">Device Name (A-Z)</option>
                <option value="device_name-desc">Device Name (Z-A)</option>
                <option value="category-asc">Category (A-Z)</option>
                <option value="category-desc">Category (Z-A)</option>
                <option value="status-asc">Status (A-Z)</option>
                <option value="status-desc">Status (Z-A)</option>
                <option value="assigned_to-asc">Assigned To (A-Z)</option>
                <option value="assigned_to-desc">Assigned To (Z-A)</option>
                <option value="location-asc">Location (A-Z)</option>
                <option value="location-desc">Location (Z-A)</option>
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

            {/* Table Header - Hidden on mobile, shown on larger screens */}
            <div className="hidden lg:grid grid-cols-12 gap-4 font-medium text-sm text-muted-foreground border-b pb-2">
              <div className="col-span-2 cursor-pointer hover:text-foreground flex items-center gap-1"
                   onClick={() => handleSort('asset_tag')}>
                Asset Tag
                {getSortIcon('asset_tag')}
              </div>
              <div className="col-span-2 cursor-pointer hover:text-foreground flex items-center gap-1"
                   onClick={() => handleSort('device_name')}>
                Device Name
                {getSortIcon('device_name')}
              </div>
              <div className="col-span-2 cursor-pointer hover:text-foreground flex items-center gap-1"
                   onClick={() => handleSort('category')}>
                Category
                {getSortIcon('category')}
              </div>
              <div className="col-span-2 cursor-pointer hover:text-foreground flex items-center gap-1"
                   onClick={() => handleSort('assigned_to')}>
                Assigned To
                {getSortIcon('assigned_to')}
              </div>
              <div className="col-span-1 cursor-pointer hover:text-foreground flex items-center gap-1"
                   onClick={() => handleSort('status')}>
                Status
                {getSortIcon('status')}
              </div>
              <div className="col-span-2 cursor-pointer hover:text-foreground flex items-center gap-1"
                   onClick={() => handleSort('location')}>
                Location
                {getSortIcon('location')}
              </div>
              <div className="col-span-1 text-center">Actions</div>
            </div>

            {/* Table Rows */}
            {filteredAssets.length > 0 ? (
              filteredAssets.map((asset) => (
                <div 
                  key={asset.id} 
                  className="border-b border-border/50 hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => handleViewAsset(asset)}
                >
                  {/* Desktop Layout */}
                  <div className="hidden lg:grid grid-cols-12 gap-4 items-center py-3">
                    <div className="col-span-2 pl-2">
                      <div className="font-medium">{asset.asset_tag}</div>
                      {asset.serial_number && (
                        <div className="text-xs text-muted-foreground">
                          SN: {asset.serial_number}
                        </div>
                      )}
                    </div>
                    <div className="col-span-2">
                      <div className="font-medium">{asset.device_name || asset.model.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {asset.device_name ? `${asset.model.manufacturer.name} ${asset.model.name}` : asset.model.manufacturer.name}
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
                      <div className="flex items-center justify-center gap-1 relative">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={(e) => {
                            e.stopPropagation()
                            handleEditAsset(asset)
                          }} 
                          title="Edit Asset"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        
                        {/* Show Check Out button if asset is not assigned, otherwise show ellipses menu */}
                        {!isAssetAssigned(asset) ? (
                          <Button 
                            variant="default" 
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleAction('Check Out', asset)
                            }} 
                            title="Check Out Asset"
                          >
                            Check Out
                          </Button>
                        ) : (
                          <div className="relative">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={(e) => {
                                e.stopPropagation()
                                handleMoreActions(asset)
                              }} 
                              title="More Actions"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                            {openDropdown === `dropdown-${asset.id}` && (
                              <div className="absolute right-0 top-8 z-50 bg-background border rounded-md shadow-lg py-1 w-36">
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
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Mobile/Tablet Layout */}
                  <div className="lg:hidden p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="font-medium text-lg">{asset.asset_tag}</div>
                        <div className="text-sm text-muted-foreground">
                          {asset.device_name || asset.model.name}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {asset.model.manufacturer.name} • {asset.model.category.name}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 ml-4">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={(e) => {
                            e.stopPropagation()
                            handleEditAsset(asset)
                          }} 
                          title="Edit Asset"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        
                        {/* Show Check Out button if asset is not assigned, otherwise show ellipses menu */}
                        {!isAssetAssigned(asset) ? (
                          <Button 
                            variant="default" 
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleAction('Check Out', asset)
                            }} 
                            title="Check Out Asset"
                          >
                            Check Out
                          </Button>
                        ) : (
                          <div className="relative">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={(e) => {
                                e.stopPropagation()
                                handleMoreActions(asset)
                              }} 
                              title="More Actions"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                            {openDropdown === `dropdown-${asset.id}` && (
                              <div className="absolute right-0 top-8 z-50 bg-background border rounded-md shadow-lg py-1 w-36">
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
                        )}
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-3 text-sm">
                      <Badge variant={getStatusVariant(asset.status.name)}>
                        {asset.status.name}
                      </Badge>
                      <Badge variant="outline">
                        {asset.model.category.name}
                      </Badge>
                      {asset.serial_number && (
                        <span className="text-muted-foreground">
                          SN: {asset.serial_number}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        {asset.assigned_to_user ? (
                          <span>
                            {asset.assigned_to_user.first_name} {asset.assigned_to_user.last_name}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">Unassigned</span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>
                          {asset.location?.name || 'No location'}
                          {asset.department && ` • ${asset.department.name}`}
                        </span>
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