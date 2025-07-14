'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  ArrowLeft,
  Package,
  CheckCircle,
  X
} from 'lucide-react'

export function AddAssetForm() {
  const router = useRouter()
  const [currentPage, setCurrentPage] = useState(1)
  const totalPages = 4

  // Basic form state
  const [assetTag, setAssetTag] = useState('')
  const [deviceName, setDeviceName] = useState('')
  const [serialNumber, setSerialNumber] = useState('')
  const [modelName, setModelName] = useState('')
  const [modelNumber, setModelNumber] = useState('')
  const [selectedManufacturer, setSelectedManufacturer] = useState('')
  const [selectedFormCategory, setSelectedFormCategory] = useState('')
  const [notes, setNotes] = useState('')
  const [externalTicketId, setExternalTicketId] = useState('')

  // Purchase Information state
  const [purchaseDate, setPurchaseDate] = useState('')
  const [purchaseCost, setPurchaseCost] = useState('')
  const [vendor, setVendor] = useState('')
  const [invoiceNumber, setInvoiceNumber] = useState('')
  const [warrantyStartDate, setWarrantyStartDate] = useState('')
  const [warrantyEndDate, setWarrantyEndDate] = useState('')
  const [warrantyProvider, setWarrantyProvider] = useState('')
  const [warrantyType, setWarrantyType] = useState('')
  const [supportContactInfo, setSupportContactInfo] = useState('')

  // Status & Assignment state
  const [assetStatus, setAssetStatus] = useState('')
  const [deploymentStatus, setDeploymentStatus] = useState('')
  const [assignedUser, setAssignedUser] = useState('')
  const [assignedUserEmail, setAssignedUserEmail] = useState('')
  const [assignedLocation, setAssignedLocation] = useState('')
  const [department, setDepartment] = useState('')
  const [assignedDate, setAssignedDate] = useState('')
  const [maintenanceSchedule, setMaintenanceSchedule] = useState('')
  const [isFixedAsset, setIsFixedAsset] = useState(false)
  const [fixedAssetId, setFixedAssetId] = useState('')

  // Document upload state
  const [uploadedDocuments, setUploadedDocuments] = useState<File[]>([])

  // Desktop/Laptop Hardware Specifications state
  const [cpu, setCpu] = useState('')
  const [ramGb, setRamGb] = useState('')
  const [storageType, setStorageType] = useState('')
  const [storageSizeGb, setStorageSizeGb] = useState('')
  const [storageUnit, setStorageUnit] = useState('GB')
  const [screenSize, setScreenSize] = useState('')
  const [gpu, setGpu] = useState('')
  const [operatingSystem, setOperatingSystem] = useState('')
  const [bitlockerRecoveryKey, setBitlockerRecoveryKey] = useState('')
  const [bitlockerEnabled, setBitlockerEnabled] = useState(false)
  
  // Desktop-specific state
  const [usbPortsType, setUsbPortsType] = useState('')
  const [displayPortsType, setDisplayPortsType] = useState('')
  const [hasBuiltinWifi, setHasBuiltinWifi] = useState(false)
  const [hasCdDrive, setHasCdDrive] = useState(false)
  const [psuType, setPsuType] = useState('')
  const [psuWattage, setPsuWattage] = useState('')

  // System and Network tracking state
  const [networkType, setNetworkType] = useState('')
  const [staticIpAddress, setStaticIpAddress] = useState('')
  const [vlan, setVlan] = useState('')
  const [switchName, setSwitchName] = useState('')
  const [switchPort, setSwitchPort] = useState('')
  const [macAddress, setMacAddress] = useState('')

  // Phone/Tablet specific state
  const [phoneExpandableStorageType, setPhoneExpandableStorageType] = useState('')
  const [tabletExpandableStorageType, setTabletExpandableStorageType] = useState('')
  const [isCarrierLocked, setIsCarrierLocked] = useState(false)

  // MDM Management state
  const [appleBusinessManager, setAppleBusinessManager] = useState(false)
  const [intuneManagement, setIntuneManagement] = useState(false)
  const [mosyleManagement, setMosyleManagement] = useState(false)
  const [deviceConfigurationPolicies, setDeviceConfigurationPolicies] = useState('')
  const [groupMembership, setGroupMembership] = useState('')

  // Dropdown data
  const [manufacturers, setManufacturers] = useState<{ id: string; name: string }[]>([])
  const [dbCategories, setDbCategories] = useState<{ id: string; name: string }[]>([])
  const [vendors, setVendors] = useState<{ id: string; name: string }[]>([])
  const [users, setUsers] = useState<{ id: string; name: string; email: string; department?: string; location?: string }[]>([])
  const [departments, setDepartments] = useState<{ id: string; name: string }[]>([])
  const [locations, setLocations] = useState<{ id: string; name: string }[]>([])
  const [showSuccessBanner, setShowSuccessBanner] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  // Category detection functions
  const isPhoneCategory = () => {
    const categoryName = dbCategories.find(cat => cat.id === selectedFormCategory)?.name?.toLowerCase()
    return categoryName?.includes('phone') || categoryName?.includes('smartphone') || categoryName?.includes('mobile')
  }

  const isTabletCategory = () => {
    const categoryName = dbCategories.find(cat => cat.id === selectedFormCategory)?.name?.toLowerCase()
    return categoryName?.includes('tablet') || categoryName?.includes('ipad')
  }

  const isDesktopCategory = () => {
    const categoryName = dbCategories.find(cat => cat.id === selectedFormCategory)?.name?.toLowerCase()
    return categoryName?.includes('desktop') || categoryName?.includes('workstation')
  }

  const isLaptopCategory = () => {
    const categoryName = dbCategories.find(cat => cat.id === selectedFormCategory)?.name?.toLowerCase()
    return categoryName?.includes('laptop') || categoryName?.includes('notebook')
  }

  // Fetch dropdown data
  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        // Fetch main dropdown data
        const mainResponse = await fetch('/api/settings/dropdown-lists')
        if (mainResponse.ok) {
          const data = await mainResponse.json()
          setManufacturers(data.manufacturers?.map((m: any) => ({ id: m.id.toString(), name: m.name })) || [])
          setDbCategories(data.categories?.map((c: any) => ({ id: c.id.toString(), name: c.name })) || [])
          setVendors(data.suppliers?.map((v: any) => ({ id: v.id.toString(), name: v.name })) || [])
          setDepartments(data.departments?.map((d: any) => ({ id: d.id.toString(), name: d.name })) || [])
          setLocations(data.locations?.map((l: any) => ({ id: l.id.toString(), name: l.name })) || [])
        }

        // Fetch users separately
        const usersResponse = await fetch('/api/users')
        if (usersResponse.ok) {
          const usersData = await usersResponse.json()
          setUsers(usersData.map((u: any) => ({ 
            id: u.id.toString(), 
            name: `${u.first_name} ${u.last_name}`, 
            email: u.email,
            department: u.department?.name,
            location: u.location?.name
          })) || [])
        }
      } catch (error) {
        console.error('Error fetching dropdown data:', error)
      }
    }
    fetchDropdownData()
  }, [])

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
      if (!deviceName.trim() || !assetTag.trim() || !modelNumber.trim()) {
        alert('Please fill in all required fields')
        return
      }

      const assetData = {
        asset_tag: assetTag.trim(),
        device_name: deviceName.trim(),
        serial_number: serialNumber.trim() || null,
        model_name: modelName.trim() || null,
        model_number: modelNumber.trim(),
        manufacturer_id: selectedManufacturer || null,
        category_id: selectedFormCategory || null,
        notes: notes.trim() || null,
        external_ticket_id: externalTicketId.trim() || null,
        
        // Purchase Information
        purchase_date: purchaseDate || null,
        purchase_cost: purchaseCost ? parseFloat(purchaseCost) : null,
        supplier_id: vendor || null,
        invoice_number: invoiceNumber.trim() || null,
        warranty_start_date: warrantyStartDate || null,
        warranty_end_date: warrantyEndDate || null,
        warranty_provider: warrantyProvider.trim() || null,
        warranty_type: warrantyType || null,
        support_contact_info: supportContactInfo.trim() || null,
        
        // Status & Assignment
        asset_status: assetStatus || null,
        deployment_status: deploymentStatus || null,
        assigned_user: assignedUser.trim() || null,
        assigned_user_email: assignedUserEmail.trim() || null,
        assigned_location: assignedLocation.trim() || null,
        department: department.trim() || null,
        assigned_date: assignedDate || null,
        maintenance_schedule: maintenanceSchedule.trim() || null,
        is_fixed_asset: isFixedAsset,
        fixed_asset_id: fixedAssetId.trim() || null,
        
        // Hardware Specifications
        cpu: cpu.trim() || null,
        ram_gb: ramGb ? parseInt(ramGb) : null,
        storage_type: storageType || null,
        storage_size_gb: storageSizeGb ? (storageUnit === 'TB' ? parseInt(storageSizeGb) * 1024 : parseInt(storageSizeGb)) : null,
        storage_unit: storageUnit || 'GB',
        screen_size: screenSize.trim() || null,
        gpu: gpu.trim() || null,
        operating_system: operatingSystem.trim() || null,
        bitlocker_recovery_key: bitlockerRecoveryKey.trim() || null,
        bitlocker_enabled: bitlockerEnabled,
        
        // Desktop-specific fields
        usb_ports_type: usbPortsType.trim() || null,
        display_ports_type: displayPortsType.trim() || null,
        has_builtin_wifi: hasBuiltinWifi,
        has_cd_drive: hasCdDrive,
        psu_type: psuType || null,
        psu_wattage: psuWattage ? parseInt(psuWattage) : null,
        
        // System and Network tracking
        network_type: networkType || null,
        static_ip_address: staticIpAddress.trim() || null,
        vlan: vlan.trim() || null,
        switch_name: switchName.trim() || null,
        switch_port: switchPort.trim() || null,
        mac_address: macAddress.trim() || null,
        
        // Phone/Tablet specific fields
        phone_expandable_storage_type: phoneExpandableStorageType || null,
        tablet_expandable_storage_type: tabletExpandableStorageType || null,
        is_carrier_locked: isCarrierLocked,
        
        // MDM Management
        apple_business_manager: appleBusinessManager,
        intune_management: intuneManagement,
        mosyle_management: mosyleManagement,
        device_configuration_policies: deviceConfigurationPolicies.trim() || null,
        group_membership: groupMembership.trim() || null
      }

      const response = await fetch('/api/assets/create-simple', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(assetData)
      })

      const result = await response.json()

      if (response.ok && result.success) {
        setSuccessMessage(`Asset ${result.data.asset_tag} created successfully!`)
        setShowSuccessBanner(true)
        setTimeout(() => {
          setShowSuccessBanner(false)
          router.push(`/assets/${result.data.id}`)
        }, 3000)
      } else {
        throw new Error(result.error || 'Failed to create asset')
      }
    } catch (error: any) {
      console.error('Error creating asset:', error)
      alert(`Failed to create asset: ${error.message}`)
    }
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
            <button onClick={() => setShowSuccessBanner(false)} className="ml-4 text-white hover:text-gray-200">
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
              <p className="text-muted-foreground">Step {currentPage} of {totalPages}</p>
            </div>
          </div>
        </div>

        {/* Progress Steps */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
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
            
            <div className="mt-3">
              <span className="text-lg font-medium">
                {currentPage === 1 && 'Basic Information & Photos'}
                {currentPage === 2 && 'Purchase Information & Warranty'}
                {currentPage === 3 && 'Status & Assignment'}
                {currentPage === 4 && 'Additional Information'}
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
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium">Device Name *</label>
                          <Input 
                            placeholder="e.g., John's MacBook Pro" 
                            className="mt-1" 
                            value={deviceName}
                            onChange={(e) => setDeviceName(e.target.value)}
                            required 
                          />
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
                        </div>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium">Category</label>
                        <select 
                          className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm mt-1"
                          value={selectedFormCategory}
                          onChange={(e) => setSelectedFormCategory(e.target.value)}
                        >
                          <option value="">Select category...</option>
                          {dbCategories.map(category => (
                            <option key={category.id} value={category.id}>{category.name}</option>
                          ))}
                        </select>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium">Model Number *</label>
                          <Input 
                            placeholder="e.g., MK183LL/A" 
                            className="mt-1" 
                            value={modelNumber}
                            onChange={(e) => setModelNumber(e.target.value)}
                            required 
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Model Name</label>
                          <Input 
                            placeholder="e.g., MacBook Pro 16-inch" 
                            className="mt-1" 
                            value={modelName}
                            onChange={(e) => setModelName(e.target.value)}
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium">Manufacturer</label>
                          <select 
                            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm mt-1"
                            value={selectedManufacturer}
                            onChange={(e) => setSelectedManufacturer(e.target.value)}
                          >
                            <option value="">Select manufacturer...</option>
                            {manufacturers.map(manufacturer => (
                              <option key={manufacturer.id} value={manufacturer.id}>{manufacturer.name}</option>
                            ))}
                          </select>
                        </div>
                        <div>
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
                  
                  <div>
                    <h3 className="text-lg font-medium mb-4">Asset Photos</h3>
                    <div className="grid grid-cols-3 gap-4">
                      <button type="button" className="p-3 border rounded-lg text-center border-primary bg-primary/5">
                        <Package className="h-6 w-6 mx-auto mb-1" />
                        <span className="text-sm font-medium block">Use Category Photo</span>
                      </button>
                      <button type="button" className="p-3 border rounded-lg text-center border-muted hover:border-primary/50">
                        <Package className="h-6 w-6 mx-auto mb-1" />
                        <span className="text-sm font-medium block">Upload Photo</span>
                      </button>
                      <button type="button" className="p-3 border rounded-lg text-center border-muted hover:border-primary/50">
                        <Package className="h-6 w-6 mx-auto mb-1" />
                        <span className="text-sm font-medium block">Model Photo</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Page 2: Purchase Information */}
              {currentPage === 2 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-4">Purchase Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">Purchase Date *</label>
                        <Input 
                          type="date" 
                          className="mt-1" 
                          value={purchaseDate}
                          onChange={(e) => setPurchaseDate(e.target.value)}
                          required 
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Purchase Cost</label>
                        <Input 
                          type="number" 
                          step="0.01" 
                          placeholder="1999.99" 
                          className="mt-1" 
                          value={purchaseCost}
                          onChange={(e) => setPurchaseCost(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Vendor/Supplier</label>
                        <select 
                          className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm mt-1"
                          value={vendor}
                          onChange={(e) => setVendor(e.target.value)}
                        >
                          <option value="">Select vendor...</option>
                          {vendors.map(vendor => (
                            <option key={vendor.id} value={vendor.id}>{vendor.name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Invoice Number</label>
                        <Input 
                          placeholder="e.g., INV-2023-001" 
                          className="mt-1" 
                          value={invoiceNumber}
                          onChange={(e) => setInvoiceNumber(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">External Ticket ID</label>
                        <Input 
                          placeholder="e.g., SNOW-123456" 
                          className="mt-1" 
                          value={externalTicketId}
                          onChange={(e) => setExternalTicketId(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-4">Document Upload</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium">Upload Documents</label>
                        <input 
                          type="file"
                          multiple
                          accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                          className="mt-1 w-full"
                          onChange={(e) => setUploadedDocuments(Array.from(e.target.files || []))}
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Upload receipts, warranty documents, user manuals (PDF, images, Word docs)
                        </p>
                      </div>
                      {uploadedDocuments.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium mb-2">Uploaded Files:</h4>
                          <ul className="text-sm text-muted-foreground">
                            {uploadedDocuments.map((file, index) => (
                              <li key={index}>{file.name} ({Math.round(file.size / 1024)}KB)</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-4">Warranty Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">Warranty Start Date</label>
                        <Input 
                          type="date" 
                          className="mt-1" 
                          value={warrantyStartDate}
                          onChange={(e) => setWarrantyStartDate(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Warranty End Date</label>
                        <Input 
                          type="date" 
                          className="mt-1" 
                          value={warrantyEndDate}
                          onChange={(e) => setWarrantyEndDate(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Warranty Provider</label>
                        <Input 
                          placeholder="e.g., Manufacturer, Vendor" 
                          className="mt-1" 
                          value={warrantyProvider}
                          onChange={(e) => setWarrantyProvider(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Warranty Type</label>
                        <select 
                          className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm mt-1"
                          value={warrantyType}
                          onChange={(e) => setWarrantyType(e.target.value)}
                        >
                          <option value="">Select warranty type...</option>
                          <option value="Standard">Standard</option>
                          <option value="Extended">Extended</option>
                          <option value="Prolonged">Prolonged</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Support Contact Info</label>
                        <Input 
                          placeholder="e.g., support@example.com, 1-800-123-4567" 
                          className="mt-1" 
                          value={supportContactInfo}
                          onChange={(e) => setSupportContactInfo(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Page 3: Status & Assignment */}
              {currentPage === 3 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-4">Status & Assignment</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">Asset Status *</label>
                        <select 
                          className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm mt-1"
                          value={assetStatus}
                          onChange={(e) => setAssetStatus(e.target.value)}
                          required 
                        >
                          <option value="">Select status...</option>
                          <option value="New">New</option>
                          <option value="In Use">In Use</option>
                          <option value="In Storage">In Storage</option>
                          <option value="Retired">Retired</option>
                          <option value="Lost">Lost</option>
                          <option value="Damaged">Damaged</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Deployment Status</label>
                        <select 
                          className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm mt-1"
                          value={deploymentStatus}
                          onChange={(e) => setDeploymentStatus(e.target.value)}
                        >
                          <option value="">Select deployment status...</option>
                          <option value="Deployed">Deployed</option>
                          <option value="Not Deployed">Not Deployed</option>
                          <option value="Pending Deployment">Pending Deployment</option>
                          <option value="Returned">Returned</option>
                        </select>
                      </div>
                                              <div>
                          <label className="text-sm font-medium">Assigned User</label>
                          <select 
                            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm mt-1"
                            value={assignedUser}
                            onChange={(e) => {
                              setAssignedUser(e.target.value)
                              const selectedUser = users.find(user => user.id === e.target.value)
                              if (selectedUser) {
                                const userDept = departments.find(dept => dept.name === selectedUser.department)
                                const userLoc = locations.find(loc => loc.name === selectedUser.location)
                                if (userDept) setDepartment(userDept.id)
                                if (userLoc) setAssignedLocation(userLoc.id)
                                setAssignedUserEmail(selectedUser.email)
                              }
                            }}
                          >
                            <option value="">Select user...</option>
                            {users.map(user => (
                              <option key={user.id} value={user.id}>{user.name} ({user.email})</option>
                            ))}
                          </select>
                        </div>
                      <div>
                        <label className="text-sm font-medium">Assigned User Email</label>
                        <Input 
                          placeholder="e.g., john.doe@example.com" 
                          className="mt-1" 
                          value={assignedUserEmail}
                          onChange={(e) => setAssignedUserEmail(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Assigned Location</label>
                        <select 
                          className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm mt-1"
                          value={assignedLocation}
                          onChange={(e) => setAssignedLocation(e.target.value)}
                        >
                          <option value="">Select location...</option>
                          {locations.map(location => (
                            <option key={location.id} value={location.id}>{location.name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Department</label>
                        <select 
                          className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm mt-1"
                          value={department}
                          onChange={(e) => setDepartment(e.target.value)}
                        >
                          <option value="">Select department...</option>
                          {departments.map(dept => (
                            <option key={dept.id} value={dept.id}>{dept.name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Assigned Date</label>
                        <Input 
                          type="date" 
                          className="mt-1" 
                          value={assignedDate || new Date().toISOString().split('T')[0]}
                          onChange={(e) => setAssignedDate(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Maintenance Schedule</label>
                        <select 
                          className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm mt-1"
                          value={maintenanceSchedule}
                          onChange={(e) => setMaintenanceSchedule(e.target.value)}
                        >
                          <option value="">Select maintenance schedule...</option>
                          <option value="Monthly">Monthly</option>
                          <option value="Quarterly">Quarterly</option>
                          <option value="Semi-Annual">Semi-Annual</option>
                          <option value="Annual">Annual</option>
                          <option value="As Needed">As Needed</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div className="flex items-center space-x-2">
                        <input 
                          type="checkbox"
                          id="isFixedAsset"
                          checked={isFixedAsset}
                          onChange={(e) => setIsFixedAsset(e.target.checked)}
                          className="h-4 w-4"
                        />
                        <label htmlFor="isFixedAsset" className="text-sm font-medium">
                          Fixed Asset
                        </label>
                      </div>
                      {isFixedAsset && (
                        <div>
                          <label className="text-sm font-medium">Fixed Asset ID</label>
                          <Input 
                            placeholder="e.g., FA-2023-001"
                            className="mt-1"
                            value={fixedAssetId}
                            onChange={(e) => setFixedAssetId(e.target.value)}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Page 4: Additional Information */}
              {currentPage === 4 && (
                <div className="space-y-6">

                  {/* Desktop Category Specifications */}
                  {isDesktopCategory() && (
                    <div className="space-y-6">
                      <div className="border-t pt-6">
                        <h4 className="text-md font-medium mb-4">Hardware Specifications</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium">CPU/Processor</label>
                            <Input 
                              placeholder="e.g., Intel Core i7-12700K"
                              className="mt-1"
                              value={cpu}
                              onChange={(e) => setCpu(e.target.value)}
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium">RAM (GB)</label>
                            <Input 
                              type="number"
                              placeholder="e.g., 16"
                              className="mt-1"
                              value={ramGb}
                              onChange={(e) => setRamGb(e.target.value)}
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium">Storage Type</label>
                            <select 
                              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm mt-1"
                              value={storageType}
                              onChange={(e) => setStorageType(e.target.value)}
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
                            <label className="text-sm font-medium">Storage Size</label>
                            <div className="flex gap-2 mt-1">
                              <Input 
                                type="number"
                                placeholder="e.g., 512"
                                className="flex-1"
                                value={storageSizeGb}
                                onChange={(e) => setStorageSizeGb(e.target.value)}
                              />
                              <select 
                                className="flex h-9 w-20 rounded-md border border-input bg-background px-3 py-1 text-sm"
                                value={storageUnit}
                                onChange={(e) => setStorageUnit(e.target.value)}
                              >
                                <option value="GB">GB</option>
                                <option value="TB">TB</option>
                              </select>
                            </div>
                          </div>
                          <div>
                            <label className="text-sm font-medium">GPU/Graphics</label>
                            <Input 
                              placeholder="e.g., NVIDIA GeForce RTX 3070"
                              className="mt-1"
                              value={gpu}
                              onChange={(e) => setGpu(e.target.value)}
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium">Operating System</label>
                            <Input 
                              placeholder="e.g., Windows 11 Pro"
                              className="mt-1"
                              value={operatingSystem}
                              onChange={(e) => setOperatingSystem(e.target.value)}
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium">USB Ports</label>
                            <Input 
                              placeholder="e.g., 4x USB 3.0, 2x USB-C"
                              className="mt-1"
                              value={usbPortsType}
                              onChange={(e) => setUsbPortsType(e.target.value)}
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium">Display Ports</label>
                            <Input 
                              placeholder="e.g., 1x HDMI, 2x DisplayPort"
                              className="mt-1"
                              value={displayPortsType}
                              onChange={(e) => setDisplayPortsType(e.target.value)}
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium">PSU Type</label>
                            <select 
                              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm mt-1"
                              value={psuType}
                              onChange={(e) => setPsuType(e.target.value)}
                            >
                              <option value="">Select PSU type...</option>
                              <option value="Universal">Universal</option>
                              <option value="Proprietary">Proprietary</option>
                              <option value="External Adapter">External Adapter</option>
                            </select>
                          </div>
                          <div>
                            <label className="text-sm font-medium">PSU Wattage</label>
                            <Input 
                              type="number"
                              placeholder="e.g., 650"
                              className="mt-1"
                              value={psuWattage}
                              onChange={(e) => setPsuWattage(e.target.value)}
                            />
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                          <div className="flex items-center space-x-2">
                            <input 
                              type="checkbox"
                              id="hasBuiltinWifi"
                              checked={hasBuiltinWifi}
                              onChange={(e) => setHasBuiltinWifi(e.target.checked)}
                              className="h-4 w-4"
                            />
                            <label htmlFor="hasBuiltinWifi" className="text-sm font-medium">
                              Built-in WiFi
                            </label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input 
                              type="checkbox"
                              id="hasCdDrive"
                              checked={hasCdDrive}
                              onChange={(e) => setHasCdDrive(e.target.checked)}
                              className="h-4 w-4"
                            />
                            <label htmlFor="hasCdDrive" className="text-sm font-medium">
                              CD/DVD Drive
                            </label>
                          </div>
                        </div>
                      </div>
                      
                      {/* System and Network Information */}
                      <div className="border-t pt-6">
                        <h4 className="text-md font-medium mb-4">System & Network Information</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium">MAC Address</label>
                            <Input 
                              placeholder="e.g., 00:11:22:33:44:55"
                              className="mt-1"
                              value={macAddress}
                              onChange={(e) => setMacAddress(e.target.value)}
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium">Network Type</label>
                            <select 
                              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm mt-1"
                              value={networkType}
                              onChange={(e) => setNetworkType(e.target.value)}
                            >
                              <option value="">Select network type...</option>
                              <option value="DHCP">DHCP</option>
                              <option value="Static">Static IP</option>
                            </select>
                          </div>
                          <div>
                            <label className="text-sm font-medium">Static IP Address</label>
                            <Input 
                              placeholder="e.g., 192.168.1.100"
                              className="mt-1"
                              value={staticIpAddress}
                              onChange={(e) => setStaticIpAddress(e.target.value)}
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium">VLAN</label>
                            <Input 
                              placeholder="e.g., 100"
                              className="mt-1"
                              value={vlan}
                              onChange={(e) => setVlan(e.target.value)}
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium">Switch Name</label>
                            <Input 
                              placeholder="e.g., SW-FLOOR-01"
                              className="mt-1"
                              value={switchName}
                              onChange={(e) => setSwitchName(e.target.value)}
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium">Switch Port</label>
                            <Input 
                              placeholder="e.g., Gi1/0/24"
                              className="mt-1"
                              value={switchPort}
                              onChange={(e) => setSwitchPort(e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Laptop Category Specifications */}
                  {isLaptopCategory() && (
                    <div className="space-y-6">
                      <div className="border-t pt-6">
                        <h4 className="text-md font-medium mb-4">Hardware Specifications</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium">CPU/Processor</label>
                            <Input 
                              placeholder="e.g., Intel Core i7-1260P"
                              className="mt-1"
                              value={cpu}
                              onChange={(e) => setCpu(e.target.value)}
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium">RAM (GB)</label>
                            <Input 
                              type="number"
                              placeholder="e.g., 16"
                              className="mt-1"
                              value={ramGb}
                              onChange={(e) => setRamGb(e.target.value)}
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium">Storage Type</label>
                            <select 
                              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm mt-1"
                              value={storageType}
                              onChange={(e) => setStorageType(e.target.value)}
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
                            <label className="text-sm font-medium">Storage Size</label>
                            <div className="flex gap-2 mt-1">
                              <Input 
                                type="number"
                                placeholder="e.g., 512"
                                className="flex-1"
                                value={storageSizeGb}
                                onChange={(e) => setStorageSizeGb(e.target.value)}
                              />
                              <select 
                                className="flex h-9 w-20 rounded-md border border-input bg-background px-3 py-1 text-sm"
                                value={storageUnit}
                                onChange={(e) => setStorageUnit(e.target.value)}
                              >
                                <option value="GB">GB</option>
                                <option value="TB">TB</option>
                              </select>
                            </div>
                          </div>
                          <div>
                            <label className="text-sm font-medium">Screen Size</label>
                            <Input 
                              placeholder="e.g., 15.6 inches"
                              className="mt-1"
                              value={screenSize}
                              onChange={(e) => setScreenSize(e.target.value)}
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium">GPU/Graphics</label>
                            <Input 
                              placeholder="e.g., Intel Iris Xe Graphics"
                              className="mt-1"
                              value={gpu}
                              onChange={(e) => setGpu(e.target.value)}
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium">Operating System</label>
                            <Input 
                              placeholder="e.g., Windows 11 Pro"
                              className="mt-1"
                              value={operatingSystem}
                              onChange={(e) => setOperatingSystem(e.target.value)}
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium">MAC Address</label>
                            <Input 
                              placeholder="e.g., 00:11:22:33:44:55"
                              className="mt-1"
                              value={macAddress}
                              onChange={(e) => setMacAddress(e.target.value)}
                            />
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                          <div className="flex items-center space-x-2">
                            <input 
                              type="checkbox"
                              id="laptopBitlockerEnabled"
                              checked={bitlockerEnabled}
                              onChange={(e) => setBitlockerEnabled(e.target.checked)}
                              className="h-4 w-4"
                            />
                            <label htmlFor="laptopBitlockerEnabled" className="text-sm font-medium">
                              BitLocker Enabled
                            </label>
                          </div>
                          {bitlockerEnabled && (
                            <div>
                              <label className="text-sm font-medium">BitLocker Recovery Key</label>
                              <Input 
                                placeholder="Enter BitLocker recovery key"
                                className="mt-1"
                                value={bitlockerRecoveryKey}
                                onChange={(e) => setBitlockerRecoveryKey(e.target.value)}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Phone Category Specifications */}
                  {isPhoneCategory() && (
                    <div className="space-y-6">
                      <div className="border-t pt-6">
                        <h4 className="text-md font-medium mb-4">Phone Specifications</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium">Expandable Storage Type</label>
                            <select 
                              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm mt-1"
                              value={phoneExpandableStorageType}
                              onChange={(e) => setPhoneExpandableStorageType(e.target.value)}
                            >
                              <option value="">Select storage type...</option>
                              <option value="SD Card">SD Card</option>
                              <option value="microSD Card">microSD Card</option>
                              <option value="SSD">SSD</option>
                              <option value="HDD">HDD</option>
                              <option value="USB Drive">USB Drive</option>
                              <option value="Other">Other</option>
                            </select>
                          </div>
                          <div className="flex items-center justify-center">
                            <div className="flex items-center space-x-2">
                              <input 
                                type="checkbox"
                                id="phoneCarrierLocked"
                                checked={isCarrierLocked}
                                onChange={(e) => setIsCarrierLocked(e.target.checked)}
                                className="h-4 w-4"
                              />
                              <label htmlFor="phoneCarrierLocked" className="text-sm font-medium">
                                Carrier Locked
                              </label>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Tablet Category Specifications */}
                  {isTabletCategory() && (
                    <div className="space-y-6">
                      <div className="border-t pt-6">
                        <h4 className="text-md font-medium mb-4">Tablet Specifications</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium">Expandable Storage Type</label>
                            <select 
                              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm mt-1"
                              value={tabletExpandableStorageType}
                              onChange={(e) => setTabletExpandableStorageType(e.target.value)}
                            >
                              <option value="">Select storage type...</option>
                              <option value="SD Card">SD Card</option>
                              <option value="microSD Card">microSD Card</option>
                              <option value="SSD">SSD</option>
                              <option value="HDD">HDD</option>
                              <option value="USB Drive">USB Drive</option>
                              <option value="Other">Other</option>
                            </select>
                          </div>
                          <div className="flex items-center justify-center">
                            <div className="flex items-center space-x-2">
                              <input 
                                type="checkbox"
                                id="tabletCarrierLocked"
                                checked={isCarrierLocked}
                                onChange={(e) => setIsCarrierLocked(e.target.checked)}
                                className="h-4 w-4"
                              />
                              <label htmlFor="tabletCarrierLocked" className="text-sm font-medium">
                                Carrier Locked
                              </label>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* MDM Management Sections */}
                  {(isPhoneCategory() || isTabletCategory() || isLaptopCategory() || isDesktopCategory()) && (
                    <div className="space-y-6">
                      <div className="border-t pt-6">
                        <h4 className="text-md font-medium mb-4">MDM Management</h4>
                        <div className="flex flex-wrap items-center gap-6 mb-4">
                          <div className="flex items-center space-x-2">
                            <input 
                              type="checkbox"
                              id="appleBusinessManager"
                              checked={appleBusinessManager}
                              onChange={(e) => setAppleBusinessManager(e.target.checked)}
                              className="h-4 w-4"
                            />
                            <label htmlFor="appleBusinessManager" className="text-sm font-medium">
                              Apple Business Manager
                            </label>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <input 
                              type="checkbox"
                              id="intuneManagement"
                              checked={intuneManagement}
                              onChange={(e) => setIntuneManagement(e.target.checked)}
                              className="h-4 w-4"
                            />
                            <label htmlFor="intuneManagement" className="text-sm font-medium">
                              Microsoft Intune
                            </label>
                          </div>

                          <div className="flex items-center space-x-2">
                            <input 
                              type="checkbox"
                              id="mosyleManagement"
                              checked={mosyleManagement}
                              onChange={(e) => setMosyleManagement(e.target.checked)}
                              className="h-4 w-4"
                            />
                            <label htmlFor="mosyleManagement" className="text-sm font-medium">
                              Mosyle
                            </label>
                          </div>
                        </div>
                        
                        {(appleBusinessManager || intuneManagement) && (
                          <div className="space-y-4">
                            <hr className="border-gray-200" />
                            <div>
                              <label className="text-sm font-medium">Device Configuration Policies</label>
                              <Input 
                                placeholder="Enter device configuration policies"
                                className="mt-1"
                                value={deviceConfigurationPolicies}
                                onChange={(e) => setDeviceConfigurationPolicies(e.target.value)}
                              />
                            </div>
                            <div>
                              <label className="text-sm font-medium">Group Membership</label>
                              <Input 
                                placeholder="Enter group membership details"
                                className="mt-1"
                                value={groupMembership}
                                onChange={(e) => setGroupMembership(e.target.value)}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Notes Section - Moved to Bottom */}
                  <div className="border-t pt-6">
                    <h4 className="text-md font-medium mb-4">Notes</h4>
                    <div>
                      <textarea 
                        className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        placeholder="Add any additional notes about this asset..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                      />
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