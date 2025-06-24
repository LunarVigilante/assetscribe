'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, Edit, Package, RefreshCw, Calendar, MapPin, User, Building, Shield, Wrench, FileText, Camera, ExternalLink, Upload, Trash2, Monitor, Cpu, HardDrive, Eye, EyeOff, Copy, Check, CheckCircle, X, LogIn, LogOut, Activity, MoreHorizontal, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { getAssetPhotoUrl, createImageFallbackHandler } from '@/lib/utils'

type AssetStatus = {
  id: string
  name: string
  color?: string
}

type AssetModel = {
  id: string
  name: string
  image_url?: string
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
  job_title?: string
  department_id?: string
  location_id?: string
  department?: {
    id: string
    name: string
  }
  location?: {
    id: string
    name: string
  }
}

type Location = {
  id: string
  name: string
}

type Department = {
  id: string
  name: string
}

type ActivityLogEntry = {
  id: number
  action_type: string
  target_id: number
  target_type: string
  external_ticket_id: string
  details: any
  timestamp: Date
  user: {
    first_name: string
    last_name: string
    email: string
  }
}

type Comment = {
  id: number
  content: string
  created_at: Date
  updated_at: Date
  user: {
    id: string
    first_name: string
    last_name: string
    email: string
  }
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
  image_url?: string
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
    id: number
    link_type: string
    title: string
    url: string
    description?: string
  }[]
  // Linked assets
  linked_assets?: {
    parent_relationships: {
      id: number
      relationship_type: string
      description?: string
      asset: {
        id: string
        asset_tag: string
        model: string
        manufacturer: string
        status: string
      }
    }[]
    child_relationships: {
      id: number
      relationship_type: string
      description?: string
      asset: {
        id: string
        asset_tag: string
        model: string
        manufacturer: string
        status: string
      }
    }[]
  }
}

function getStatusIcon(statusName: string) {
  switch (statusName.toLowerCase()) {
    case 'active':
    case 'deployed':
      return <Shield className="h-4 w-4 text-green-500" />
    case 'inactive':
      return <Shield className="h-4 w-4 text-gray-500" />
    case 'available':
      return <Package className="h-4 w-4 text-blue-500" />
    case 'in repair':
      return <Wrench className="h-4 w-4 text-yellow-500" />
    case 'pending deployment':
      return <Package className="h-4 w-4 text-blue-500" />
    default:
      return <Package className="h-4 w-4 text-muted-foreground" />
  }
}

function getStatusVariant(statusName: string): "default" | "secondary" | "destructive" | "outline" {
  switch (statusName.toLowerCase()) {
    case 'active':
    case 'deployed':
      return 'default'
    case 'inactive':
    case 'available':
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

// Helper function to get logical status based on assignment
function getLogicalStatus(asset: Asset): { name: string, variant: "default" | "secondary" | "destructive" | "outline" } {
  const assigned = isAssetAssigned(asset)
  
  // If asset is assigned but status is not "Deployed", or if unassigned but status is "Deployed"
  if (assigned && asset.status.name.toLowerCase() !== 'deployed') {
    return { name: 'Deployed', variant: 'default' }
  } else if (!assigned && asset.status.name.toLowerCase() === 'deployed') {
    return { name: 'Available', variant: 'secondary' }
  }
  
  // Return the original status if it makes logical sense
  return { name: asset.status.name, variant: getStatusVariant(asset.status.name) }
}

// Activity helper functions
function getActivityIcon(actionType: string) {
  switch (actionType.toLowerCase()) {
    case 'asset_create':
      return <Package className="h-4 w-4 text-green-600" />
    case 'asset_update':
      return <Edit className="h-4 w-4 text-blue-600" />
    case 'asset_checkout':
      return <LogOut className="h-4 w-4 text-orange-600" />
    case 'asset_checkin':
      return <LogIn className="h-4 w-4 text-green-600" />
    case 'asset_transfer':
      return <RefreshCw className="h-4 w-4 text-purple-600" />
    case 'asset_verify':
      return <CheckCircle className="h-4 w-4 text-green-600" />
    default:
      return <Activity className="h-4 w-4 text-muted-foreground" />
  }
}

function getActivityColor(actionType: string) {
  switch (actionType.toLowerCase()) {
    case 'asset_create':
      return 'border-green-200'
    case 'asset_update':
      return 'border-blue-200'
    case 'asset_checkout':
      return 'border-orange-200'
    case 'asset_checkin':
      return 'border-green-200'
    case 'asset_transfer':
      return 'border-purple-200'
    case 'asset_verify':
      return 'border-green-200'
    default:
      return 'border-muted'
  }
}

function formatActivityType(actionType: string) {
  return actionType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
}

function getActivityDescription(activity: ActivityLogEntry, asset?: Asset) {
  const details = activity.details || {}
  
  switch (activity.action_type.toLowerCase()) {
    case 'asset_create':
      return 'Asset was created in the system'
    case 'asset_update':
      return `Asset information was updated${details.fields ? ` (${details.fields.join(', ')})` : ''}`
    case 'asset_checkout':
      // Try to get the assigned user's name from current asset data or details
      if (asset?.assigned_to_user) {
        return `Checked out to ${asset.assigned_to_user.first_name} ${asset.assigned_to_user.last_name}`
      } else if (details.assigned_to_name) {
        return `Checked out to ${details.assigned_to_name}`
      } else if (details.assigned_to && details.assigned_to !== 'user/department') {
        return `Checked out to ${details.assigned_to}`
      } else {
        return 'Asset was checked out'
      }
    case 'asset_checkin':
      return 'Asset was checked back into inventory'
    case 'asset_transfer':
      return `Transferred from ${details.from || 'previous location'} to ${details.to || 'new location'}`
    case 'asset_verify':
      return 'Asset location and condition verified'
    default:
      return formatActivityType(activity.action_type)
  }
}

export default function AssetDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [asset, setAsset] = useState<Asset | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [assetId, setAssetId] = useState<string | null>(null)
  const [showBitlockerKey, setShowBitlockerKey] = useState(false)
  const [copiedBitlocker, setCopiedBitlocker] = useState(false)
  const [showSuccessBanner, setShowSuccessBanner] = useState(false)
  const [showPhotoModal, setShowPhotoModal] = useState(false)
  const [activityLogs, setActivityLogs] = useState<ActivityLogEntry[]>([])
  const [loadingActivityLogs, setLoadingActivityLogs] = useState(true)
  
  // Comments state
  const [comments, setComments] = useState<Comment[]>([])
  const [loadingComments, setLoadingComments] = useState(true)
  const [newComment, setNewComment] = useState('')
  const [editingComment, setEditingComment] = useState<number | null>(null)
  const [editingContent, setEditingContent] = useState('')
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)
  
  // Modal states
  const [showCheckOutModal, setShowCheckOutModal] = useState(false)
  const [showTransferModal, setShowTransferModal] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  
  // Dropdown data
  const [users, setUsers] = useState<any[]>([])
  const [departments, setDepartments] = useState<any[]>([])
  const [locations, setLocations] = useState<any[]>([])
  const [loadingDropdowns, setLoadingDropdowns] = useState(false)
  
  // Assignment actions dropdown
  const [showActionsDropdown, setShowActionsDropdown] = useState(false)

  useEffect(() => {
    const getParams = async () => {
      const { id } = await params
      setAssetId(id)
    }
    getParams()
  }, [params])

  useEffect(() => {
    // Check if we were redirected from edit page with success
    if (searchParams.get('updated') === 'true') {
      setShowSuccessBanner(true)
      // Remove the query parameter from URL without page refresh
      const url = new URL(window.location.href)
      url.searchParams.delete('updated')
      window.history.replaceState({}, '', url.toString())
    }
  }, [searchParams])

  const fetchAsset = useCallback(async () => {
    if (!assetId) return
    
    try {
      const response = await fetch(`/api/assets/${assetId}`)
      if (response.ok) {
        const data = await response.json()
        setAsset(data)
      } else {
        setError('Asset not found')
      }
    } catch (error) {
      setError('Failed to load asset')
    } finally {
      setLoading(false)
    }
  }, [assetId])

  const fetchActivityLogs = useCallback(async () => {
    if (!assetId) {
      setLoadingActivityLogs(false)
      return
    }
    
    try {
      const response = await fetch(`/api/assets/${assetId}/activity`)
      if (response.ok) {
        const activityData = await response.json()
        setActivityLogs(activityData)
      }
    } catch (error) {
      console.error('Error fetching activity logs:', error)
    } finally {
      setLoadingActivityLogs(false)
    }
  }, [assetId])

  const fetchComments = useCallback(async () => {
    if (!assetId) {
      setLoadingComments(false)
      return
    }
    
    try {
      const response = await fetch(`/api/assets/${assetId}/comments`)
      if (response.ok) {
        const commentsData = await response.json()
        setComments(commentsData)
      }
    } catch (error) {
      console.error('Error fetching comments:', error)
    } finally {
      setLoadingComments(false)
    }
  }, [assetId])

  useEffect(() => {
    if (!assetId) return

    fetchAsset()
  }, [assetId, fetchAsset])

  useEffect(() => {
    if (!assetId) return
    
    fetchActivityLogs()
    fetchComments()
  }, [assetId, fetchActivityLogs, fetchComments])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showActionsDropdown && !(event.target as Element).closest('.relative')) {
        setShowActionsDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showActionsDropdown])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
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

  // Comment management functions
  const handleAddComment = async () => {
    if (!newComment.trim() || !assetId) return

    setIsSubmittingComment(true)
    try {
      const response = await fetch(`/api/assets/${assetId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newComment.trim() })
      })

      if (response.ok) {
        setNewComment('')
        await fetchComments()
      } else {
        const error = await response.json()
        alert(`Failed to add comment: ${error.error}`)
      }
    } catch (error) {
      alert('Failed to add comment')
    } finally {
      setIsSubmittingComment(false)
    }
  }

  const handleEditComment = async (commentId: number, content: string) => {
    if (!content.trim() || !assetId) return

    try {
      const response = await fetch(`/api/assets/${assetId}/comments/${commentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: content.trim() })
      })

      if (response.ok) {
        setEditingComment(null)
        setEditingContent('')
        await fetchComments()
      } else {
        const error = await response.json()
        alert(`Failed to update comment: ${error.error}`)
      }
    } catch (error) {
      alert('Failed to update comment')
    }
  }

  const handleDeleteComment = async (commentId: number) => {
    if (!assetId || !confirm('Are you sure you want to delete this comment?')) return

    try {
      const response = await fetch(`/api/assets/${assetId}/comments/${commentId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        await fetchComments()
      } else {
        const error = await response.json()
        alert(`Failed to delete comment: ${error.error}`)
      }
    } catch (error) {
      alert('Failed to delete comment')
    }
  }

  const fetchDropdownData = async () => {
    if (users.length > 0) return // Already loaded

    setLoadingDropdowns(true)
    try {
      const [usersRes, departmentsRes, locationsRes] = await Promise.all([
        fetch('/api/users'),
        fetch('/api/departments'),
        fetch('/api/locations')
      ])

      if (usersRes.ok) {
        const usersData = await usersRes.json()
        setUsers(usersData)
      }

      if (departmentsRes.ok) {
        const departmentsData = await departmentsRes.json()
        setDepartments(departmentsData)
      }

      if (locationsRes.ok) {
        const locationsData = await locationsRes.json()
        setLocations(locationsData)
      }
    } catch (error) {
      console.error('Failed to fetch dropdown data:', error)
    } finally {
      setLoadingDropdowns(false)
    }
  }

  const handleAction = async (action: string) => {
    switch (action) {
      case 'Check Out':
        await fetchDropdownData()
        setShowCheckOutModal(true)
        break
      case 'Check In':
        await performCheckIn()
        break
      case 'Transfer':
        await fetchDropdownData()
        setShowTransferModal(true)
        break
      case 'Link Asset':
        alert(`${action} action for ${asset.asset_tag} will be implemented in the next phase`)
        break
      default:
        alert(`${action} action for ${asset.asset_tag} will be implemented in the next phase`)
    }
  }

  const performCheckIn = async () => {
    if (!assetId || !asset) return

    setIsProcessing(true)
    try {
      const response = await fetch(`/api/assets/${assetId}/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'check_in' })
      })

      if (response.ok) {
        // Refresh asset data and activity logs
        await Promise.all([
          fetchAsset(),
          fetchActivityLogs()
        ])
      } else {
        const error = await response.json()
        alert(`Failed to check in asset: ${error.error}`)
      }
    } catch (error) {
      alert('Failed to check in asset')
    } finally {
      setIsProcessing(false)
    }
  }

  const performCheckOut = async (formData: { user_id?: string, department_id?: string, location_id?: string }) => {
    if (!assetId || !asset) return

    setIsProcessing(true)
    try {
      const response = await fetch(`/api/assets/${assetId}/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'check_out',
          ...formData
        })
      })

      if (response.ok) {
        setShowCheckOutModal(false)
        // Refresh asset data and activity logs
        await Promise.all([
          fetchAsset(),
          fetchActivityLogs()
        ])
      } else {
        const error = await response.json()
        alert(`Failed to check out asset: ${error.error}`)
      }
    } catch (error) {
      alert('Failed to check out asset')
    } finally {
      setIsProcessing(false)
    }
  }

  const performTransfer = async (formData: { user_id?: string, department_id?: string, location_id?: string }) => {
    if (!assetId || !asset) return

    setIsProcessing(true)
    try {
      const response = await fetch(`/api/assets/${assetId}/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'transfer',
          ...formData
        })
      })

      if (response.ok) {
        setShowTransferModal(false)
        // Refresh asset data and activity logs
        await Promise.all([
          fetchAsset(),
          fetchActivityLogs()
        ])
      } else {
        const error = await response.json()
        alert(`Failed to transfer asset: ${error.error}`)
      }
    } catch (error) {
      alert('Failed to transfer asset')
    } finally {
      setIsProcessing(false)
    }
  }

  const copyBitlockerKey = async () => {
    if (asset?.bitlocker_recovery_key) {
      try {
        await navigator.clipboard.writeText(asset.bitlocker_recovery_key)
        setCopiedBitlocker(true)
        setTimeout(() => setCopiedBitlocker(false), 2000)
      } catch (err) {
        alert('Failed to copy recovery key')
      }
    }
  }

  const handleRelatedLink = (type: string) => {
    // Check if there's a custom link for this type
    const customLink = asset?.related_links?.find(link => link.link_type === type)
    
    if (customLink) {
      // Use custom URL
      window.open(customLink.url, '_blank')
    } else {
      // Fall back to Google search
      const urls = {
        'Product Manual': `https://www.google.com/search?q=${encodeURIComponent(asset?.model.name + ' manual')}`,
        'Warranty Info': `https://www.google.com/search?q=${encodeURIComponent(asset?.model.manufacturer.name + ' warranty check')}`,
        'Support Portal': `https://www.google.com/search?q=${encodeURIComponent(asset?.model.manufacturer.name + ' support')}`
      }
      
      window.open(urls[type as keyof typeof urls], '_blank')
    }
  }

  const handlePhotoUpload = async (file: File) => {
    if (!assetId || !file) return

    const formData = new FormData()
    formData.append('photo', file)
    formData.append('assetId', assetId)

    try {
      const response = await fetch('/api/assets/photo-upload', {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        const result = await response.json()
        // Update the asset with the new photo URL
        setAsset(prev => prev ? { ...prev, image_url: result.photo_url } : prev)
        alert(`Photo uploaded successfully!`)
      } else {
        const error = await response.json()
        alert(`Failed to upload photo: ${error.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error uploading photo:', error)
      alert('Failed to upload photo. Please try again.')
    }
  }

  // Simple Modal Component
  const Modal = ({ isOpen, onClose, title, children }: { 
    isOpen: boolean, 
    onClose: () => void, 
    title: string, 
    children: React.ReactNode 
  }) => {
    if (!isOpen) return null

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-background border rounded-lg p-6 max-w-md w-full mx-4 shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-foreground">{title}</h3>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          {children}
        </div>
      </div>
    )
  }

  // Check Out Modal
  const CheckOutModal = () => {
    const [formData, setFormData] = useState({
      user_id: '',
      department_id: '',
      location_id: ''
    })

    const handleUserChange = (userId: string) => {
      const selectedUser = users.find(user => user.id === parseInt(userId))
      
      setFormData(prev => ({
        user_id: userId,
        department_id: userId && selectedUser?.department_id ? selectedUser.department_id.toString() : '',
        location_id: userId && selectedUser?.location_id ? selectedUser.location_id.toString() : ''
      }))
    }

    const handleDepartmentChange = (departmentId: string) => {
      setFormData(prev => ({
        ...prev,
        department_id: departmentId,
        user_id: departmentId ? '' : prev.user_id // Clear user if department selected
      }))
    }

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault()
      
      // Ensure at least one assignment is selected
      if (!formData.user_id && !formData.department_id) {
        alert('Please assign to either a user or department')
        return
      }
      
      // If assigning to department, location is mandatory
      if (formData.department_id && !formData.location_id) {
        alert('Location is required when assigning to a department')
        return
      }
      
      performCheckOut(formData)
    }

    if (loadingDropdowns) {
      return (
        <Modal isOpen={showCheckOutModal} onClose={() => setShowCheckOutModal(false)} title="Check Out Asset">
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
              <p className="text-muted-foreground">Loading options...</p>
            </div>
          </div>
        </Modal>
      )
    }

    return (
      <Modal isOpen={showCheckOutModal} onClose={() => setShowCheckOutModal(false)} title="Check Out Asset">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Assign to User</label>
            <select
              className="w-full p-2 border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
              value={formData.user_id}
              onChange={(e) => handleUserChange(e.target.value)}
            >
              <option value="">Select a user...</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.first_name} {user.last_name} ({user.job_title || 'No title'})
                  {user.department?.name && ` - ${user.department.name}`}
                </option>
              ))}
            </select>
            {formData.user_id && (formData.department_id || formData.location_id) && (
              <p className="text-xs text-blue-600 mt-1">
                ✓ Auto-filled from user profile: {formData.department_id ? 'Department' : ''}{formData.department_id && formData.location_id ? ' & ' : ''}{formData.location_id ? 'Location' : ''}
              </p>
            )}
          </div>
          
          <div className="text-center text-sm text-muted-foreground">
            OR
          </div>
          
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Assign to Department
            </label>
            <select
              className="w-full p-2 border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
              value={formData.department_id}
              onChange={(e) => handleDepartmentChange(e.target.value)}
            >
              <option value="">Select a department...</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Location
            </label>
            <select
              className="w-full p-2 border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
              value={formData.location_id}
              onChange={(e) => setFormData(prev => ({ ...prev, location_id: e.target.value }))}
            >
              <option value="">Select a location...</option>
              {locations.map((location) => (
                <option key={location.id} value={location.id}>
                  {location.name}
                  {location.parent_location && ` (${location.parent_location.name})`}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={isProcessing} className="flex-1">
              {isProcessing ? 'Processing...' : 'Check Out'}
            </Button>
            <Button type="button" variant="outline" onClick={() => setShowCheckOutModal(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    )
  }

  // Transfer Modal
  const TransferModal = () => {
    const [formData, setFormData] = useState({
      user_id: '',
      department_id: '',
      location_id: ''
    })

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault()
      
      // Ensure at least one assignment is selected
      if (!formData.user_id && !formData.department_id) {
        alert('Please assign to either a user or department')
        return
      }
      
      // If assigning to department, location is mandatory
      if (formData.department_id && !formData.location_id) {
        alert('Location is required when assigning to a department')
        return
      }
      
      performTransfer(formData)
    }

    if (loadingDropdowns) {
      return (
        <Modal isOpen={showTransferModal} onClose={() => setShowTransferModal(false)} title="Transfer Asset">
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
              <p className="text-muted-foreground">Loading options...</p>
            </div>
          </div>
        </Modal>
      )
    }

    return (
      <Modal isOpen={showTransferModal} onClose={() => setShowTransferModal(false)} title="Transfer Asset">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Transfer to User</label>
            <select
              className="w-full p-2 border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
              value={formData.user_id}
              onChange={(e) => setFormData(prev => ({ ...prev, user_id: e.target.value, department_id: e.target.value ? '' : prev.department_id }))}
            >
              <option value="">Select a user...</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.first_name} {user.last_name} ({user.job_title})
                </option>
              ))}
            </select>
          </div>
          
          <div className="text-center text-sm text-muted-foreground">
            OR
          </div>
          
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Transfer to Department</label>
            <select
              className="w-full p-2 border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
              value={formData.department_id}
              onChange={(e) => setFormData(prev => ({ ...prev, department_id: e.target.value, user_id: e.target.value ? '' : prev.user_id }))}
            >
              <option value="">Select a department...</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Location</label>
            <select
              className="w-full p-2 border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
              value={formData.location_id}
              onChange={(e) => setFormData(prev => ({ ...prev, location_id: e.target.value }))}
            >
              <option value="">Select a location...</option>
              {locations.map((location) => (
                <option key={location.id} value={location.id}>
                  {location.name}
                  {location.parent_location && ` (${location.parent_location.name})`}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={isProcessing} className="flex-1">
              {isProcessing ? 'Processing...' : 'Transfer'}
            </Button>
            <Button type="button" variant="outline" onClick={() => setShowTransferModal(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    )
  }

  // Photo Modal Component
  const PhotoModal = () => {
    if (!showPhotoModal || !asset?.model.image_url) return null

    // Handle keyboard navigation
    React.useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          setShowPhotoModal(false)
        }
      }

      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
    }, [])

    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50" onClick={() => setShowPhotoModal(false)}>
        <div className="relative max-w-4xl max-h-4xl p-4" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => setShowPhotoModal(false)}
            className="absolute top-2 right-2 text-white bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-75 transition-colors z-10"
            title="Close photo viewer (Esc)"
          >
            <X className="h-6 w-6" />
          </button>
          <img
            src={asset.model.image_url}
            alt={`${asset.model.manufacturer.name} ${asset.model.name}`}
            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
          />
          <div className="absolute bottom-4 left-4 right-4 text-white bg-black bg-opacity-50 rounded-lg p-3">
            <h3 className="font-semibold text-lg">{asset.model.name}</h3>
            <p className="text-sm opacity-90">{asset.model.manufacturer.name} • {asset.model.category.name}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <CheckOutModal />
      <TransferModal />
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => router.push('/assets')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Assets
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{asset.asset_tag}</h1>
            <p className="text-muted-foreground">
              {asset.device_name || asset.model.name}
              {asset.device_name && (
                <span className="text-xs ml-2 opacity-75">({asset.model.name})</span>
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            onClick={() => router.push(`/assets/${assetId}/edit`)}
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit Asset
          </Button>
          
          <span className="text-sm font-medium text-muted-foreground">Status:</span>
          <Badge variant={getLogicalStatus(asset).variant} className="text-sm">
            {getStatusIcon(getLogicalStatus(asset).name)}
            <span className="ml-2">{getLogicalStatus(asset).name}</span>
          </Badge>
        </div>
      </div>

      {/* Success Banner */}
      {showSuccessBanner && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <h4 className="font-semibold text-green-800">Asset Updated Successfully</h4>
                <p className="text-sm text-green-700">Your changes have been saved to the database.</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSuccessBanner(false)}
              className="text-green-600 hover:text-green-700 p-1"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Asset Overview */}
          <Card className="p-6 relative group">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Package className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-semibold">Asset Overview</h2>
              </div>
              {/* Hover Edit Icon */}
              <Button 
                size="sm" 
                variant="ghost" 
                className="opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => router.push(`/assets/${assetId}/edit?section=overview`)}
                title="Edit asset overview"
              >
                <Edit className="h-4 w-4" />
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Asset Tag</label>
                  <p className="text-lg font-mono">{asset.asset_tag}</p>
                </div>
                {asset.device_name && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Device Name</label>
                    <p className="text-lg">{asset.device_name}</p>
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Serial Number</label>
                  <p className="text-lg font-mono">{asset.serial_number || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Model</label>
                  <p className="text-lg">{asset.model.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Manufacturer</label>
                  <p className="text-lg">{asset.model.manufacturer.name}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Category</label>
                  <p className="text-lg">{asset.model.category.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Asset ID</label>
                  <p className="text-sm font-mono text-muted-foreground">{asset.id}</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Asset Information */}
          <Card className="p-6 relative group">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Package className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-semibold">Asset Information</h2>
              </div>
              {/* Hover Edit Icon */}
              <Button 
                size="sm" 
                variant="ghost" 
                className="opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => router.push(`/assets/${assetId}/edit?section=information`)}
                title="Edit asset information"
              >
                <Edit className="h-4 w-4" />
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Condition</label>
                  <p className="text-lg">{asset.condition?.name || 'Not specified'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Maintenance Schedule</label>
                  <p className="text-lg">{asset.maintenance_schedule?.name || 'Not specified'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Supplier</label>
                  <p className="text-lg">{asset.supplier?.name || 'Not specified'}</p>
                </div>
              </div>
              <div className="space-y-4">
                {asset.warranty_expiry_date && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Warranty Status</label>
                    <p className="text-lg">
                      {new Date(asset.warranty_expiry_date) > new Date() ? (
                        <span className="text-green-600">Active</span>
                      ) : (
                        <span className="text-red-600">Expired</span>
                      )}
                    </p>
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Verification Interval</label>
                  <p className="text-lg">{asset.verification_interval_months ? `${asset.verification_interval_months} months` : 'Not set'}</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Hardware Specifications */}
          <Card className="p-6 relative group">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Cpu className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-semibold">Hardware Specifications</h2>
              </div>
              {/* Hover Edit Icon */}
              <Button 
                size="sm" 
                variant="ghost" 
                className="opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => router.push(`/assets/${assetId}/edit?section=hardware`)}
                title="Edit hardware specifications"
              >
                <Edit className="h-4 w-4" />
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Processor (CPU)</label>
                  <p className="text-lg">{asset.cpu || 'Not specified'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Memory (RAM)</label>
                  <p className="text-lg">{asset.ram_gb ? `${asset.ram_gb} GB` : 'Not specified'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Storage Type</label>
                  <div className="flex items-center gap-2">
                    <HardDrive className="h-4 w-4 text-muted-foreground" />
                    <p className="text-lg">{asset.storage_type || 'Not specified'}</p>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Storage Size</label>
                  <p className="text-lg">{asset.storage_size_gb ? `${asset.storage_size_gb} GB` : 'Not specified'}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Screen Size</label>
                  <div className="flex items-center gap-2">
                    <Monitor className="h-4 w-4 text-muted-foreground" />
                    <p className="text-lg">{asset.screen_size || 'Not specified'}</p>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Graphics (GPU)</label>
                  <p className="text-lg">{asset.gpu || 'Not specified'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Operating System</label>
                  <p className="text-lg">{asset.operating_system || 'Not specified'}</p>
                </div>
                {/* Bitlocker Recovery Key for Laptops and Desktops */}
                {(asset.model.category.name.toLowerCase().includes('laptop') || 
                  asset.model.category.name.toLowerCase().includes('desktop')) && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">BitLocker Recovery Key</label>
                    <div className="mt-2 space-y-2">
                      <div className="font-mono text-xs bg-muted p-3 rounded break-all overflow-hidden">
                        {asset.bitlocker_recovery_key ? (
                          showBitlockerKey 
                            ? asset.bitlocker_recovery_key 
                            : '••••••-••••••-••••••-••••••-••••••-••••••-••••••-••••••'
                        ) : (
                          'Not available'
                        )}
                      </div>
                      {asset.bitlocker_recovery_key && (
                        <div className="flex gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowBitlockerKey(!showBitlockerKey)}
                            title={showBitlockerKey ? 'Hide recovery key' : 'Show recovery key'}
                          >
                            {showBitlockerKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={copyBitlockerKey}
                            title="Copy recovery key"
                            disabled={copiedBitlocker}
                          >
                            {copiedBitlocker ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Attached Documents */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-semibold">Attached Documents</h2>
              </div>
              <label>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      alert(`Document upload functionality will be implemented in the next phase.\nSelected file: ${file.name}`)
                    }
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
              {/* Mock documents - in real app, this would come from the database */}
              <div className="group p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                   onClick={() => {
                     // Open document functionality
                     alert('Document viewer functionality will be implemented in the next phase.\nOpening: Purchase Receipt')
                   }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Purchase Receipt</p>
                      <p className="text-sm text-muted-foreground">PDF • 245 KB • Uploaded 2 days ago</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      title="Download"
                      onClick={(e) => {
                        e.stopPropagation()
                        alert('Document download functionality will be implemented in the next phase.')
                      }}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      title="Delete document"
                      onClick={(e) => {
                        e.stopPropagation()
                        if (confirm('Are you sure you want to delete this document? This action cannot be undone.')) {
                          alert('Document deletion functionality will be implemented in the next phase.')
                        }
                      }}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
              <div className="group p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                   onClick={() => {
                     // Open document functionality
                     alert('Document viewer functionality will be implemented in the next phase.\nOpening: User Manual')
                   }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">User Manual</p>
                      <p className="text-sm text-muted-foreground">PDF • 1.2 MB • Uploaded 1 week ago</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      title="Download"
                      onClick={(e) => {
                        e.stopPropagation()
                        alert('Document download functionality will be implemented in the next phase.')
                      }}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      title="Delete document"
                      onClick={(e) => {
                        e.stopPropagation()
                        if (confirm('Are you sure you want to delete this document? This action cannot be undone.')) {
                          alert('Document deletion functionality will be implemented in the next phase.')
                        }
                      }}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
              <div className="group p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                   onClick={() => {
                     // Open document functionality
                     alert('Document viewer functionality will be implemented in the next phase.\nOpening: Warranty Information')
                   }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Warranty Information</p>
                      <p className="text-sm text-muted-foreground">PDF • 156 KB • Uploaded 3 weeks ago</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      title="Download"
                      onClick={(e) => {
                        e.stopPropagation()
                        alert('Document download functionality will be implemented in the next phase.')
                      }}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      title="Delete document"
                      onClick={(e) => {
                        e.stopPropagation()
                        if (confirm('Are you sure you want to delete this document? This action cannot be undone.')) {
                          alert('Document deletion functionality will be implemented in the next phase.')
                        }
                      }}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
              {/* Empty state for when there are no more documents */}
              <div className="text-center py-4 text-muted-foreground border-2 border-dashed rounded-lg">
                <FileText className="h-8 w-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">Drop files here or click upload to add more documents</p>
              </div>
            </div>
          </Card>

          {/* Financial Information */}
          {(asset.purchase_date || asset.purchase_cost) && (
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <Calendar className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-semibold">Financial Information</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {asset.purchase_date && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Purchase Date</label>
                    <p className="text-lg">{new Date(asset.purchase_date).toLocaleDateString()}</p>
                  </div>
                )}
                {asset.purchase_cost && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Purchase Cost</label>
                    <p className="text-lg font-semibold">${asset.purchase_cost.toLocaleString()}</p>
                  </div>
                )}
                {asset.warranty_expiry_date && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Warranty Expires</label>
                    <p className="text-lg">{new Date(asset.warranty_expiry_date).toLocaleDateString()}</p>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Notes */}
          {asset.notes && (
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <FileText className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-semibold">Notes</h2>
              </div>
              <p className="text-muted-foreground">{asset.notes}</p>
            </Card>
          )}

          {/* Comments */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <FileText className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">Comments</h2>
            </div>
            
            {/* Add new comment */}
            <div className="mb-6">
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <User className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment..."
                    className="w-full min-h-[80px] px-3 py-2 border border-input rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                        handleAddComment()
                      }
                    }}
                  />
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-xs text-muted-foreground">Press Cmd+Enter to post</p>
                    <Button 
                      size="sm" 
                      onClick={handleAddComment}
                      disabled={!newComment.trim() || isSubmittingComment}
                    >
                      {isSubmittingComment ? 'Posting...' : 'Post Comment'}
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Comments list */}
            <div className="space-y-4">
              {loadingComments ? (
                <div className="flex items-center gap-3 p-3">
                  <div className="w-8 h-8 rounded-full bg-muted animate-pulse"></div>
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-muted rounded animate-pulse"></div>
                    <div className="h-3 bg-muted rounded w-3/4 animate-pulse"></div>
                  </div>
                </div>
              ) : comments.length > 0 ? (
                comments.map((comment) => (
                  <div 
                    key={comment.id} 
                    className="flex gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors group"
                  >
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <User className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <button 
                          className="font-medium text-sm hover:text-primary cursor-pointer"
                          onClick={() => router.push(`/users/${comment.user.id}`)}
                        >
                          {comment.user.first_name} {comment.user.last_name}
                        </button>
                        <span className="text-xs text-muted-foreground">
                          {new Date(comment.created_at).toLocaleDateString()} at {new Date(comment.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </span>
                        {comment.updated_at !== comment.created_at && (
                          <span className="text-xs text-muted-foreground">(edited)</span>
                        )}
                      </div>
                      
                      {editingComment === comment.id ? (
                        <div className="space-y-2">
                          <textarea
                            value={editingContent}
                            onChange={(e) => setEditingContent(e.target.value)}
                            className="w-full min-h-[60px] px-2 py-1 border border-input rounded text-sm resize-none focus:outline-none focus:ring-1 focus:ring-ring"
                            autoFocus
                          />
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => handleEditComment(comment.id, editingContent)}
                            >
                              Save
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              onClick={() => {
                                setEditingComment(null)
                                setEditingContent('')
                              }}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                            {comment.content}
                          </p>
                                                     <div className="opacity-0 group-hover:opacity-100 transition-opacity mt-2">
                             <div className="flex gap-2">
                               <button
                                 onClick={() => {
                                   setEditingComment(comment.id)
                                   setEditingContent(comment.content)
                                 }}
                                 className="text-xs font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-2 py-1 rounded transition-colors"
                               >
                                 Edit
                               </button>
                               <button
                                 onClick={() => handleDeleteComment(comment.id)}
                                 className="text-xs font-medium text-red-600 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded transition-colors"
                               >
                                 Delete
                               </button>
                             </div>
                           </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-8 w-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No comments yet</p>
                  <p className="text-xs">Be the first to add a comment about this asset</p>
                </div>
              )}
            </div>
          </Card>

          {/* Timeline */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <Calendar className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">Timeline</h2>
            </div>
            <div className="space-y-4">
              {loadingActivityLogs ? (
                <div className="flex items-center gap-3 p-3">
                  <div className="w-4 h-4 rounded-full bg-muted animate-pulse"></div>
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-muted rounded animate-pulse"></div>
                    <div className="h-3 bg-muted rounded w-3/4 animate-pulse"></div>
                  </div>
                </div>
              ) : (
                <>
                  {/* Activity logs from database */}
                  {activityLogs.map((activity) => (
                    <div key={activity.id} className={`flex items-start gap-4 p-3 border-l-2 ${getActivityColor(activity.action_type)}`}>
                      <div className="mt-1">
                        {getActivityIcon(activity.action_type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <p className="font-medium">{formatActivityType(activity.action_type)}</p>
                            <p className="text-sm text-muted-foreground mt-1">
                              {getActivityDescription(activity, asset)}
                            </p>
                            <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                              <span>{activity.user.first_name} {activity.user.last_name}</span>
                              <span>•</span>
                              <span>{new Date(activity.timestamp).toLocaleDateString()} at {new Date(activity.timestamp).toLocaleTimeString()}</span>
                              {activity.external_ticket_id && (
                                <>
                                  <span>•</span>
                                  <span className="font-mono">#{activity.external_ticket_id}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {/* Fallback to basic timeline if no activity logs */}
                  {activityLogs.length === 0 && (
                    <>
                      <div className="flex items-center gap-4 p-3 border-l-2 border-primary/20">
                        <div className="w-2 h-2 rounded-full bg-primary"></div>
                        <div>
                          <p className="font-medium">Asset Created</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(asset.created_at).toLocaleDateString()} at {new Date(asset.created_at).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                      {asset.updated_at && asset.updated_at !== asset.created_at && (
                        <div className="flex items-center gap-4 p-3 border-l-2 border-muted">
                          <div className="w-2 h-2 rounded-full bg-muted-foreground"></div>
                          <div>
                            <p className="font-medium">Last Updated</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(asset.updated_at).toLocaleDateString()} at {new Date(asset.updated_at).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      )}
                      {asset.last_verified_date && (
                        <div className="flex items-center gap-4 p-3 border-l-2 border-green-200">
                          <div className="w-2 h-2 rounded-full bg-green-500"></div>
                          <div>
                            <p className="font-medium">Last Verified</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(asset.last_verified_date).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </>
              )}
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Assignment & Location */}
          <Card className="p-6 relative group">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">Assignment & Location</h3>
              </div>
              <div className="flex items-center gap-2">
                {/* Hover Edit Icon */}
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => router.push(`/assets/${assetId}/edit?section=assignment`)}
                  title="Edit assignment and location"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                
                {/* Show Check Out button if asset is not assigned, otherwise show ellipses menu */}
                {!isAssetAssigned(asset) ? (
                  <Button 
                    size="sm"
                    variant="default" 
                    onClick={async () => {
                      await fetchDropdownData()
                      setShowCheckOutModal(true)
                    }}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Check Out
                  </Button>
                ) : (
                  <div className="relative">
                    <Button 
                      size="sm"
                      variant="outline" 
                      onClick={() => setShowActionsDropdown(!showActionsDropdown)}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                    {showActionsDropdown && (
                      <div className="absolute right-0 top-8 z-50 bg-background border rounded-md shadow-lg py-1 w-32">
                        <button
                          className="w-full text-left px-3 py-2 text-sm hover:bg-muted"
                          onClick={() => {
                            handleAction('Check In')
                            setShowActionsDropdown(false)
                          }}
                        >
                          Check In
                        </button>
                        <button
                          className="w-full text-left px-3 py-2 text-sm hover:bg-muted"
                          onClick={() => {
                            handleAction('Transfer')
                            setShowActionsDropdown(false)
                          }}
                        >
                          Transfer
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Assigned To</label>
                {asset.assigned_to_user ? (
                  <div className="flex items-center gap-3 mt-2">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <button 
                        className="font-medium hover:text-primary cursor-pointer text-left"
                        onClick={() => router.push(`/users/${asset.assigned_to_user?.id}`)}
                      >
                        {asset.assigned_to_user.first_name} {asset.assigned_to_user.last_name}
                      </button>
                      <p className="text-sm text-muted-foreground">{asset.assigned_to_user.email}</p>
                    </div>
                  </div>
                ) : asset.department ? (
                  <div className="flex items-center gap-3 mt-2">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <Building className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">{asset.department.name}</p>
                      <p className="text-sm text-muted-foreground">Department Assignment</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground mt-2">Unassigned</p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Department</label>
                <div className="flex items-center gap-2 mt-2">
                  <Building className="h-4 w-4 text-muted-foreground" />
                  <p>{asset.department?.name || 'No department assigned'}</p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Location</label>
                <div className="flex items-center gap-2 mt-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <p>{asset.location?.name || 'No location assigned'}</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Asset Photo */}
          <Card className="p-6 relative group">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Asset Photo</h3>
              <div className="flex items-center gap-2">
                {/* Hover Edit Icon */}
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => router.push(`/assets/${assetId}/edit?section=photo`)}
                  title="Edit photo options"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <label>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        handlePhotoUpload(file)
                      }
                    }}
                  />
                  <Button size="sm" variant="outline" asChild>
                    <span>
                      <Camera className="h-4 w-4 mr-2" />
                      Upload Photo
                    </span>
                  </Button>
                </label>
              </div>
            </div>
            <div 
              className={`aspect-square bg-muted rounded-lg flex items-center justify-center overflow-hidden transition-colors ${
                // Only make clickable if there's an actual asset photo or model photo (not just category stock photo)
                (asset as any).image_url || asset.model.image_url ? 'cursor-pointer hover:bg-muted/80' : 'cursor-pointer hover:bg-muted/80'
              }`}
              onClick={() => {
                // Only show lightbox if there's a unique asset photo or model photo
                if ((asset as any).image_url || asset.model.image_url) {
                  setShowPhotoModal(true)
                } else {
                  // If no asset-specific or model photo, trigger file upload
                  const fileInput = document.querySelector('input[type="file"][accept="image/*"]') as HTMLInputElement
                  fileInput?.click()
                }
              }}
              title={
                (asset as any).image_url || asset.model.image_url 
                  ? "Click to view larger image" 
                  : "Click to upload photo"
              }
            >
              {(() => {
                const photoUrl = getAssetPhotoUrl(
                  (asset as any).image_url,
                  asset.model.image_url,
                  asset.model.category.name
                )
                
                if (photoUrl) {
                  return (
                    <img 
                      src={photoUrl}
                      alt={`${asset.asset_tag} - ${asset.model.name}`}
                      className="max-w-full max-h-full object-cover rounded-lg"
                      onError={createImageFallbackHandler(asset.model.category.name)}
                    />
                  )
                } else {
                  return (
                    <div className="text-center">
                      <Camera className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">Click to upload photo</p>
                    </div>
                  )
                }
              })()}
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              {(asset as any).image_url 
                ? 'Asset-specific photo' 
                : asset.model.image_url 
                  ? 'Model photo' 
                  : getAssetPhotoUrl(null, null, asset.model.category.name)
                    ? 'Category stock photo'
                    : 'No photo available'
              }
            </p>
          </Card>

          {/* Linked Assets */}
          <Card className="p-6 relative group">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Linked Assets</h3>
              <div className="flex items-center gap-2">
                {/* Hover Edit Icon */}
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => router.push(`/assets/${assetId}/edit?section=relationships`)}
                  title="Edit asset relationships"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleAction('Link Asset')}>
                  <Package className="h-4 w-4 mr-2" />
                  Link Asset
                </Button>
              </div>
            </div>
            <div className="space-y-4">
              {/* Parent Relationships */}
              {asset?.linked_assets?.parent_relationships && asset.linked_assets.parent_relationships.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">This asset connects to:</h4>
                  <div className="space-y-2">
                    {asset.linked_assets.parent_relationships.map((relationship) => (
                      <div key={relationship.id} className="border rounded-lg p-3 hover:bg-muted/50 cursor-pointer"
                           onClick={() => router.push(`/assets/${relationship.asset.id}`)}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Package className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="font-medium text-sm">{relationship.asset.asset_tag}</p>
                              <p className="text-xs text-muted-foreground">
                                {relationship.asset.manufacturer} {relationship.asset.model}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xs font-medium text-blue-600">{relationship.relationship_type}</p>
                            <Badge variant={getStatusVariant(relationship.asset.status)} className="text-xs">
                              {relationship.asset.status}
                            </Badge>
                          </div>
                        </div>
                        {relationship.description && (
                          <p className="text-xs text-muted-foreground mt-2">{relationship.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Child Relationships */}
              {asset?.linked_assets?.child_relationships && asset.linked_assets.child_relationships.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">Connected assets:</h4>
                  <div className="space-y-2">
                    {asset.linked_assets.child_relationships.map((relationship) => (
                      <div key={relationship.id} className="border rounded-lg p-3 hover:bg-muted/50 cursor-pointer"
                           onClick={() => router.push(`/assets/${relationship.asset.id}`)}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Package className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="font-medium text-sm">{relationship.asset.asset_tag}</p>
                              <p className="text-xs text-muted-foreground">
                                {relationship.asset.manufacturer} {relationship.asset.model}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xs font-medium text-green-600">{relationship.relationship_type}</p>
                            <Badge variant={getStatusVariant(relationship.asset.status)} className="text-xs">
                              {relationship.asset.status}
                            </Badge>
                          </div>
                        </div>
                        {relationship.description && (
                          <p className="text-xs text-muted-foreground mt-2">{relationship.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* CMDB Connections - Always show this section */}
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">CMDB Connections:</h4>
                <div className="space-y-2">
                  {/* Mock CMDB connections - in real app, this would come from the database */}
                  <div className="border rounded-lg p-3 hover:bg-muted/50 cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Shield className="h-4 w-4 text-blue-500" />
                        <div>
                          <p className="font-medium text-sm">Active Directory Service</p>
                          <p className="text-xs text-muted-foreground">Domain Controller</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-medium text-blue-600">Depends on</p>
                        <Badge variant="default" className="text-xs">Active</Badge>
                      </div>
                    </div>
                  </div>
                  <div className="border rounded-lg p-3 hover:bg-muted/50 cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Monitor className="h-4 w-4 text-green-500" />
                        <div>
                          <p className="font-medium text-sm">Corporate Network</p>
                          <p className="text-xs text-muted-foreground">VLAN 100</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-medium text-green-600">Connected to</p>
                        <Badge variant="default" className="text-xs">Active</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Empty state - only show when there are no asset relationships (CMDB connections are always present) */}
              {(!asset?.linked_assets?.parent_relationships?.length && 
                !asset?.linked_assets?.child_relationships?.length) && (
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">Asset Relationships:</h4>
                  <div className="text-center py-4 text-muted-foreground border-2 border-dashed rounded-lg">
                    <Package className="h-8 w-8 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">No asset relationships found</p>
                    <p className="text-xs">Click "Link Asset" to connect to other assets</p>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Related Links */}
          <Card className="p-6 relative group">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Related Links</h3>
              {/* Hover Edit Icon */}
              <Button 
                size="sm" 
                variant="ghost" 
                className="opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => router.push(`/assets/${assetId}/edit?section=links`)}
                title="Edit related links"
              >
                <Edit className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-3">
              {/* Default Links */}
              {[
                { type: 'Product Manual', title: 'Product Manual', description: 'View manufacturer documentation' },
                { type: 'Warranty Info', title: 'Warranty Info', description: 'Check warranty status' },
                { type: 'Support Portal', title: 'Support Portal', description: 'Access manufacturer support' }
              ].map((defaultLink) => {
                const customLink = asset?.related_links?.find(link => link.link_type === defaultLink.type)
                return (
                  <Button 
                    key={defaultLink.type}
                    variant="ghost" 
                    className="w-full justify-start h-auto p-3" 
                    onClick={() => handleRelatedLink(defaultLink.type)}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    <div className="text-left flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{customLink?.title || defaultLink.title}</p>
                        {customLink && (
                          <span className="text-xs bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded">Custom</span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {customLink?.description || defaultLink.description}
                      </p>
                    </div>
                  </Button>
                )
              })}

              {/* Custom Links */}
              {asset?.related_links?.filter(link => 
                !['Product Manual', 'Warranty Info', 'Support Portal'].includes(link.link_type)
              ).map((link) => (
                <Button 
                  key={link.id}
                  variant="ghost" 
                  className="w-full justify-start h-auto p-3" 
                  onClick={() => window.open(link.url, '_blank')}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  <div className="text-left flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{link.title}</p>
                      <span className="text-xs bg-green-100 text-green-600 px-1.5 py-0.5 rounded">
                        {link.link_type}
                      </span>
                    </div>
                    {link.description && (
                      <p className="text-xs text-muted-foreground">{link.description}</p>
                    )}
                  </div>
                </Button>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Photo Modal */}
      <PhotoModal />

      {/* Checkout/Transfer Modals */}
      <CheckOutModal />
      <TransferModal />
    </div>
  )
} 