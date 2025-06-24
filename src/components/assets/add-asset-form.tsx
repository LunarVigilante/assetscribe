'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { getCategoryStockPhotoUrl, createImageFallbackHandler } from '@/lib/utils'
import { 
  ArrowLeft,
  Package,
  Upload,
  CheckCircle,
  X
} from 'lucide-react'

export function AddAssetForm() {
  const router = useRouter()
  const [currentPage, setCurrentPage] = useState(1)
  const totalPages = 7

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
  const [customManufacturer, setCustomManufacturer] = useState('')
  const [showCustomManufacturer, setShowCustomManufacturer] = useState(false)
  const [manufacturers, setManufacturers] = useState<{ id: string; name: string }[]>([])

  // Category management state
  const [customCategory, setCustomCategory] = useState('')
  const [showCustomCategory, setShowCustomCategory] = useState(false)
  const [dbCategories, setDbCategories] = useState<{ id: string; name: string }[]>([])

  // Model suggestions state
  const [modelSuggestions, setModelSuggestions] = useState<string[]>([])
  const [showModelSuggestions, setShowModelSuggestions] = useState(false)

  // Form input state
  const [assetTag, setAssetTag] = useState('')
  const [deviceName, setDeviceName] = useState('')
  const [serialNumber, setSerialNumber] = useState('')
  const [modelName, setModelName] = useState('')
  const [modelNumber, setModelNumber] = useState('')
  const [selectedManufacturer, setSelectedManufacturer] = useState('')
  const [selectedFormCategory, setSelectedFormCategory] = useState('')
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
        
        // Hide banner after 3 seconds then redirect
        setTimeout(() => {
          setShowSuccessBanner(false)
          // Navigate to the newly created asset's details page
          router.push(`/assets/${createdAsset.id}`)
        }, 3000)
        
      } else {
        throw new Error(result.error || 'Failed to create asset')
      }
      
    } catch (error: any) {
      console.error('Error creating asset:', error)
      alert(`Failed to create asset: ${error.message}`)
    }
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
    } else {
      setShowCustomCategory(false)
      setCustomCategory('')
      setSelectedFormCategory(value)
    }
  }

  const handleVendorChange = (value: string) => {
    if (value === 'custom') {
      setShowCustomVendor(true)
    } else {
      setShowCustomVendor(false)
      setCustomVendor('')
      setSelectedVendor(value)
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
    setModelName(value)
    
    // Clear auto-fill note when user types manually
    if (modelNameAutoFillNote) {
      setModelNameAutoFillNote('')
    }

    // Show suggestions if there's a value
    if (value.trim()) {
      const mockSuggestions = [
        'MacBook Pro 16-inch',
        'MacBook Air 13-inch', 
        'MacBook Pro 14-inch',
        'ThinkPad X1 Carbon',
        'ThinkPad T14',
        'Surface Laptop Studio',
        'Surface Pro 9',
        'Dell XPS 13',
        'Dell XPS 15',
        'HP EliteBook 850'
      ].filter(suggestion => 
        suggestion.toLowerCase().includes(value.toLowerCase())
      ).slice(0, 5)

      setModelSuggestions(mockSuggestions)
      setShowModelSuggestions(mockSuggestions.length > 0)
    } else {
      setShowModelSuggestions(false)
      setModelSuggestions([])
    }
  }

  const handleModelNumberChange = (value: string) => {
    setModelNumber(value)

    // Show model number suggestions and potentially auto-fill model name
    if (value.trim()) {
      const mockModelData: {[key: string]: {name: string; manufacturer: string; category: string}} = {
        'MK183LL/A': { name: 'MacBook Pro 16-inch', manufacturer: 'Apple Inc.', category: 'Laptop' },
        'MLY33LL/A': { name: 'MacBook Air 13-inch', manufacturer: 'Apple Inc.', category: 'Laptop' },
        '20U9S02D00': { name: 'ThinkPad X1 Carbon Gen 9', manufacturer: 'Lenovo', category: 'Laptop' },
        'ZVH-00001': { name: 'Surface Laptop Studio', manufacturer: 'Microsoft', category: 'Laptop' },
        'QWH-00001': { name: 'Surface Pro 9', manufacturer: 'Microsoft', category: 'Laptop' },
        '9310-1234': { name: 'XPS 13', manufacturer: 'Dell Technologies', category: 'Laptop' },
        'HP850G8': { name: 'EliteBook 850 G8', manufacturer: 'HP Inc.', category: 'Laptop' }
      }

      // Check for exact matches
      if (mockModelData[value]) {
        const match = mockModelData[value]
        
        // Set auto-fill note for model name
        setModelNameAutoFillNote(`Auto-filled: ${match.name}`)
        
        // Actually set the model name field
        setModelName(match.name)
        
        // Auto-select manufacturer and category if they exist in dropdowns
        const manufacturerMatch = manufacturers.find(m => m.name === match.manufacturer)
        if (manufacturerMatch) {
          setSelectedManufacturer(manufacturerMatch.id)
        }
        
        const categoryMatch = dbCategories.find(c => c.name === match.category)
        if (categoryMatch) {
          setSelectedFormCategory(categoryMatch.id)
        }
      }
      
      // Show model number suggestions
      const numberSuggestions = Object.keys(mockModelData).filter(modelNum => 
        modelNum.toLowerCase().includes(value.toLowerCase())
      ).slice(0, 5)
      
      setModelSuggestions(numberSuggestions)
      setShowModelSuggestions(numberSuggestions.length > 0)
    } else {
      setShowModelSuggestions(false)
      setModelSuggestions([])
      setModelNameAutoFillNote('')
    }
  }

  const handleSelectModelSuggestion = (suggestion: string) => {
    setModelNumber(suggestion)
    setShowModelSuggestions(false)
    
    // Trigger the same logic as typing the suggestion
    handleModelNumberChange(suggestion)
  }

  const handleDocumentUpload = (files: FileList | null) => {
    if (files) {
      const newFiles = Array.from(files)
      setSelectedDocuments(prev => [...prev, ...newFiles])
      
      // Create previews for image files
      newFiles.forEach(file => {
        if (file.type.startsWith('image/')) {
          const reader = new FileReader()
          reader.onload = (e) => {
            setDocumentPreviews(prev => ({
              ...prev,
              [file.name]: e.target?.result as string
            }))
          }
          reader.readAsDataURL(file)
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

  return (
    <>
      {/* Success Banner */}
      {showSuccessBanner && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 max-w-md w-full">
          <div className="bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center justify-between">
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 mr-2" />
              <span className="text-sm font-medium">{successMessage}</span>
            </div>
            <button 
              onClick={() => setShowSuccessBanner(false)}
              className="ml-4 text-white hover:text-gray-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => router.push('/assets')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Assets
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Add New Asset</h1>
              <p className="text-muted-foreground">
                Step {currentPage} of {totalPages}
              </p>
            </div>
          </div>
        </div>

        {/* Progress Steps */}
        <Card>
          <CardHeader>
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
              <span className="text-lg font-medium">
                {currentPage === 1 && 'Basic Information'}
                {currentPage === 2 && 'Manufacturer & Category'}
                {currentPage === 3 && 'Purchase Information'}
                {currentPage === 4 && 'Status & Assignment'}
                {currentPage === 5 && 'Warranty & Maintenance'}
                {currentPage === 6 && 'Photos & Documentation'}
                {currentPage === 7 && 'Additional Information'}
              </span>
            </div>
          </CardHeader>
        </Card>

        {/* Form Content */}
        <Card>
          <CardContent className="p-6">
            <form className="space-y-6">
              {/* Page 1: Basic Information */}
              {currentPage === 1 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-4">Basic Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium">Device Name *</label>
                          <Input 
                            placeholder="e.g., John's MacBook Pro" 
                            className="mt-1" 
                            value={deviceName}
                            onChange={(e) => setDeviceName(e.target.value)}
                            required 
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            A friendly name to identify this specific asset
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium">Asset Tag *</label>
                          <Input 
                            placeholder="CH-1234" 
                            className="mt-1" 
                            value={assetTag}
                            onChange={(e) => setAssetTag(e.target.value)}
                            required 
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            Unique identifier for tracking and inventory
                          </p>
                        </div>
                        <div className="pb-6">
                          <label className="text-sm font-medium">Serial Number</label>
                          <Input 
                            placeholder="e.g., ABC123456789" 
                            className="mt-1" 
                            value={serialNumber}
                            onChange={(e) => setSerialNumber(e.target.value)}
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            Manufacturer's serial number
                          </p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium">Model Number *</label>
                          <div className="relative">
                            <Input 
                              placeholder="e.g., MK183LL/A"
                              className="mt-1" 
                              value={modelNumber}
                              onChange={(e) => handleModelNumberChange(e.target.value)}
                              required
                            />
                            {showModelSuggestions && modelSuggestions.length > 0 && (
                              <div className="absolute top-full left-0 right-0 z-50 bg-background border rounded-md shadow-lg max-h-40 overflow-y-auto">
                                {modelSuggestions.map((suggestion, index) => (
                                  <button
                                    key={index}
                                    type="button"
                                    className="w-full text-left px-3 py-2 hover:bg-muted text-sm"
                                    onClick={() => handleSelectModelSuggestion(suggestion)}
                                  >
                                    {suggestion}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            Official model/part number from manufacturer
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium">Model Name</label>
                          <Input 
                            placeholder="e.g., MacBook Pro 16-inch" 
                            className="mt-1" 
                            value={modelName}
                            onChange={(e) => handleModelNameChange(e.target.value)}
                          />
                          {modelNameAutoFillNote && (
                            <div className="flex items-center mt-2 text-xs text-blue-600">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              {modelNameAutoFillNote}
                            </div>
                          )}
                          <p className="text-xs text-muted-foreground mt-1">
                            Human-readable model name
                          </p>
                        </div>
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">Manufacturer</label>
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
                            <option key={manufacturer.id} value={manufacturer.id}>{manufacturer.name}</option>
                          ))}
                          <option value="custom">+ Add New Manufacturer</option>
                        </select>
                        {showCustomManufacturer && (
                          <div className="mt-2 space-y-3">
                            <Input
                              placeholder="Enter new manufacturer name"
                              value={customManufacturer}
                              onChange={(e) => setCustomManufacturer(e.target.value)}
                            />
                            <div className="flex gap-2">
                              <Button 
                                type="button" 
                                size="sm" 
                                onClick={handleAddManufacturer}
                                disabled={!customManufacturer.trim()}
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
                      <div>
                        <label className="text-sm font-medium">Category</label>
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
                            <option key={category.id} value={category.id}>{category.name}</option>
                          ))}
                          <option value="custom">+ Add New Category</option>
                        </select>
                        {showCustomCategory && (
                          <div className="mt-2 space-y-3">
                            <Input
                              placeholder="Enter new category name"
                              value={customCategory}
                              onChange={(e) => setCustomCategory(e.target.value)}
                            />
                            <div className="flex gap-2">
                              <Button 
                                type="button" 
                                size="sm" 
                                onClick={handleAddCategory}
                                disabled={!customCategory.trim()}
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
              )}

              {/* Additional pages would be implemented here following the same pattern */}
              {currentPage > 2 && currentPage < 7 && (
                <div className="space-y-6">
                  <div className="text-center py-12">
                    <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">Step {currentPage} Content</h3>
                    <p className="text-muted-foreground">
                      This step will be implemented based on the modal content
                    </p>
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
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={handlePrevPage}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <Button variant="outline" onClick={() => router.push('/assets')}>
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
    </>
  )
} 