import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params
    const asset = await prisma.asset.findUnique({
      where: {
        id: parseInt(id)
      },
      include: {
        model: {
          include: {
            manufacturer: true,
            category: true
          }
        },
        status: true,
        assigned_to_user: {
          include: {
            department: true,
            location: true
          }
        },
        location: true,
        department: true,
        supplier: true,
        condition: true,
        maintenance_schedule: true
      }
    })

    if (!asset) {
      return NextResponse.json(
        { error: 'Asset not found' },
        { status: 404 }
      )
    }

    // Transform the data to match the frontend types
    const transformedAsset = {
      id: asset.id.toString(),
      asset_tag: asset.asset_tag,
      device_name: asset.device_name,
      serial_number: asset.serial_number,
      model: {
        id: asset.model.id.toString(),
        name: asset.model.name,
        image_url: asset.model.image_url,
        manufacturer: {
          id: asset.model.manufacturer.id.toString(),
          name: asset.model.manufacturer.name
        },
        category: {
          id: asset.model.category.id.toString(),
          name: asset.model.category.name
        }
      },
      status: {
        id: asset.status.id.toString(),
        name: asset.status.name,
        color: asset.status.color
      },
      assigned_to_user: asset.assigned_to_user ? {
        id: asset.assigned_to_user.id.toString(),
        first_name: asset.assigned_to_user.first_name,
        last_name: asset.assigned_to_user.last_name,
        email: asset.assigned_to_user.email,
        department: asset.assigned_to_user.department ? {
          id: asset.assigned_to_user.department.id.toString(),
          name: asset.assigned_to_user.department.name
        } : null,
        location: asset.assigned_to_user.location ? {
          id: asset.assigned_to_user.location.id.toString(),
          name: asset.assigned_to_user.location.name
        } : null
      } : null,
      location: asset.location ? {
        id: asset.location.id.toString(),
        name: asset.location.name
      } : null,
      department: asset.department ? {
        id: asset.department.id.toString(),
        name: asset.department.name
      } : null,
      created_at: asset.created_at,
      updated_at: asset.updated_at,
      purchase_date: asset.purchase_date,
      purchase_cost: asset.purchase_cost ? parseFloat(asset.purchase_cost.toString()) : null,
      warranty_expiry_date: asset.warranty_expiry_date,
      notes: asset.notes,
      last_verified_date: asset.last_verified_date,
      condition: asset.condition ? {
        id: asset.condition.id.toString(),
        name: asset.condition.name
      } : null,
      maintenance_schedule: asset.maintenance_schedule ? {
        id: asset.maintenance_schedule.id.toString(),
        name: asset.maintenance_schedule.name
      } : null,
      supplier: asset.supplier ? {
        id: asset.supplier.id.toString(),
        name: asset.supplier.name
      } : null,
      // Hardware specifications from database
      cpu: (asset as any).cpu || null,
      ram_gb: (asset as any).ram_gb || null,
      storage_type: (asset as any).storage_type || null,
      storage_size_gb: (asset as any).storage_size_gb || null,
      storage_unit: (asset as any).storage_unit || 'GB',
      screen_size: (asset as any).screen_size || null,
      gpu: (asset as any).gpu || null,
      operating_system: (asset as any).operating_system || null,
      bitlocker_recovery_key: (asset as any).bitlocker_recovery_key || null,
      // Desktop-specific fields
      usb_ports_type: (asset as any).usb_ports_type || null,
      display_ports_type: (asset as any).display_ports_type || null,
      has_builtin_wifi: (asset as any).has_builtin_wifi || false,
      has_cd_drive: (asset as any).has_cd_drive || false,
      psu_type: (asset as any).psu_type || null,
      psu_wattage: (asset as any).psu_wattage || null,
      psu_cable_type: (asset as any).psu_cable_type || null,
      // System and Network tracking
      os_install_date: (asset as any).os_install_date ? new Date((asset as any).os_install_date) : null,
      backup_type: (asset as any).backup_type || null,
      last_backup_date: (asset as any).last_backup_date ? new Date((asset as any).last_backup_date) : null,
      network_type: (asset as any).network_type || null,
      static_ip_address: (asset as any).static_ip_address || null,
      vlan: (asset as any).vlan || null,
      switch_name: (asset as any).switch_name || null,
      switch_port: (asset as any).switch_port || null,
      // Related links - empty for now until tables are properly set up
      related_links: [],
      // Asset relationships - empty for now until tables are properly set up
      linked_assets: {
        parent_relationships: [],
        child_relationships: []
      }
    }

    return NextResponse.json(transformedAsset)
  } catch (error) {
    console.error('Failed to fetch asset:', error)
    return NextResponse.json(
      { error: 'Failed to fetch asset' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { performed_by_user_id = 1, ...bodyData } = body

    // Get the current asset data for comparison
    const currentAsset = await prisma.asset.findUnique({
      where: { id: parseInt(id) },
      include: {
        model: {
          include: {
            manufacturer: true,
            category: true
          }
        },
        status: true,
        assigned_to_user: true,
        location: true,
        department: true,
        condition: true,
        maintenance_schedule: true,
        supplier: true
      }
    })

    if (!currentAsset) {
      return NextResponse.json({ error: 'Asset not found' }, { status: 404 })
    }

    // Get the user performing the action for audit logging
    const performingUser = await prisma.user.findUnique({
      where: { id: performed_by_user_id },
      select: { id: true, first_name: true, last_name: true }
    })

    if (!performingUser) {
      return NextResponse.json({ error: 'Performing user not found' }, { status: 400 })
    }

    // Track changes for audit log
    const changes = []
    const changedFields = []

    // Compare basic fields and track changes (only log actual changes)
    if (bodyData.asset_tag !== undefined && bodyData.asset_tag !== currentAsset.asset_tag) {
      changes.push(`Asset Tag: "${currentAsset.asset_tag}" → "${bodyData.asset_tag}"`)
      changedFields.push('asset_tag')
    }

    if (bodyData.device_name !== undefined && bodyData.device_name !== currentAsset.device_name) {
      // Only log if there's an actual change in value (not just null/undefined differences)
      const oldValue = currentAsset.device_name || ''
      const newValue = bodyData.device_name || ''
      if (oldValue !== newValue) {
        changes.push(`Device Name: "${oldValue || 'None'}" → "${newValue || 'None'}"`)
        changedFields.push('device_name')
      }
    }

    if (bodyData.serial_number !== undefined && bodyData.serial_number !== currentAsset.serial_number) {
      const oldValue = currentAsset.serial_number || ''
      const newValue = bodyData.serial_number || ''
      if (oldValue !== newValue) {
        changes.push(`Serial Number: "${oldValue || 'None'}" → "${newValue || 'None'}"`)
        changedFields.push('serial_number')
      }
    }

    if (bodyData.notes !== undefined && bodyData.notes !== currentAsset.notes) {
      const oldValue = currentAsset.notes || ''
      const newValue = bodyData.notes || ''
      if (oldValue !== newValue) {
        changes.push(`Notes: "${oldValue || 'None'}" → "${newValue || 'None'}"`)
        changedFields.push('notes')
      }
    }

    if (bodyData.purchase_cost !== undefined) {
      const oldValue = parseFloat(currentAsset.purchase_cost?.toString() || '0')
      const newValue = parseFloat(bodyData.purchase_cost || '0')
      if (oldValue !== newValue) {
        changes.push(`Purchase Cost: "${currentAsset.purchase_cost || 'None'}" → "${bodyData.purchase_cost || 'None'}"`)
        changedFields.push('purchase_cost')
      }
    }

    if (bodyData.warranty_expiry_date !== undefined) {
      const currentDate = currentAsset.warranty_expiry_date?.toISOString().split('T')[0]
      const newDate = bodyData.warranty_expiry_date
      if (currentDate !== newDate) {
        changes.push(`Warranty Expiry: "${currentDate || 'None'}" → "${newDate || 'None'}"`)
        changedFields.push('warranty_expiry_date')
      }
    }

    // Track assignment changes
    if (bodyData.assigned_to_user_id !== undefined) {
      const currentUserId = currentAsset.assigned_to_user_id
      const newUserId = bodyData.assigned_to_user_id ? parseInt(bodyData.assigned_to_user_id) : null
      if (currentUserId !== newUserId) {
        const currentUserName = currentAsset.assigned_to_user 
          ? `${currentAsset.assigned_to_user.first_name} ${currentAsset.assigned_to_user.last_name}`
          : 'Unassigned'
        const newUserName = newUserId 
          ? await prisma.user.findUnique({
              where: { id: newUserId },
              select: { first_name: true, last_name: true }
            }).then(u => u ? `${u.first_name} ${u.last_name}` : 'Unknown User')
          : 'Unassigned'
        changes.push(`Assigned User: "${currentUserName}" → "${newUserName}"`)
        changedFields.push('assigned_to_user_id')
      }
    }

    // Track department changes
    if (bodyData.department_id !== undefined) {
      const currentDeptId = currentAsset.department_id
      const newDeptId = bodyData.department_id ? parseInt(bodyData.department_id) : null
      if (currentDeptId !== newDeptId) {
        const currentDeptName = currentAsset.department?.name || 'None'
        const newDeptName = newDeptId 
          ? await prisma.department.findUnique({
              where: { id: newDeptId },
              select: { name: true }
            }).then(d => d?.name || 'Unknown Department')
          : 'None'
        changes.push(`Department: "${currentDeptName}" → "${newDeptName}"`)
        changedFields.push('department_id')
      }
    }

    let modelId: number | undefined

    // Handle model updates if manufacturer or category changed
    if (bodyData.manufacturer_id || bodyData.category_id || bodyData.model_name || bodyData.model_number) {
      const modelName = bodyData.model_name || 'Unknown Model'
      const modelNumber = bodyData.model_number || modelName
      const manufacturerId = bodyData.manufacturer_id ? parseInt(bodyData.manufacturer_id) : undefined
      const categoryId = bodyData.category_id ? parseInt(bodyData.category_id) : undefined

      if (manufacturerId && categoryId) {
        // Check if this model already exists
        let existingModel = await prisma.assetModel.findFirst({
          where: {
            name: modelName,
            model_number: modelNumber,
            manufacturer_id: manufacturerId,
            category_id: categoryId
          }
        })

        if (!existingModel) {
          // Create new model
          existingModel = await prisma.assetModel.create({
            data: {
              name: modelName,
              model_number: modelNumber,
              manufacturer_id: manufacturerId,
              category_id: categoryId
            }
          })
        }

        modelId = existingModel.id

        // Track model change
        if (modelId !== currentAsset.model_id) {
          changes.push(`Model: "${currentAsset.model.name}" → "${modelName}"`)
          changedFields.push('model_id')
        }
      }
    }

    // Update asset in database
    const updateData: any = {
      asset_tag: bodyData.asset_tag,
      device_name: bodyData.device_name || null,
      serial_number: bodyData.serial_number || null,
      notes: bodyData.notes || null,
      verification_interval_months: bodyData.verification_interval_months ? parseInt(bodyData.verification_interval_months) : null,
      // Financial information
      purchase_date: bodyData.purchase_date ? new Date(bodyData.purchase_date) : null,
      purchase_cost: bodyData.purchase_cost ? parseFloat(bodyData.purchase_cost) : null,
      warranty_expiry_date: bodyData.warranty_expiry_date ? new Date(bodyData.warranty_expiry_date) : null,
      // Hardware specifications
      cpu: bodyData.cpu || null,
      ram_gb: bodyData.ram_gb ? parseInt(bodyData.ram_gb) : null,
      storage_type: bodyData.storage_type || null,
      storage_size_gb: bodyData.storage_size_gb ? (bodyData.storage_unit === 'TB' ? parseInt(bodyData.storage_size_gb) * 1024 : parseInt(bodyData.storage_size_gb)) : null,
      storage_unit: bodyData.storage_unit || 'GB',
      screen_size: bodyData.screen_size || null,
      gpu: bodyData.gpu || null,
      operating_system: bodyData.operating_system || null,
      bitlocker_recovery_key: bodyData.bitlocker_recovery_key || null,
      // Desktop-specific fields
      usb_ports_type: bodyData.usb_ports_type || null,
      display_ports_type: bodyData.display_ports_type || null,
      has_builtin_wifi: bodyData.has_builtin_wifi !== undefined ? bodyData.has_builtin_wifi : null,
      has_cd_drive: bodyData.has_cd_drive !== undefined ? bodyData.has_cd_drive : null,
      psu_type: bodyData.psu_type || null,
      psu_wattage: bodyData.psu_wattage ? parseInt(bodyData.psu_wattage) : null,
      psu_cable_type: bodyData.psu_cable_type || null,
      // System and Network tracking
      os_install_date: bodyData.os_install_date ? new Date(bodyData.os_install_date) : null,
      backup_type: bodyData.backup_type || null,
      last_backup_date: bodyData.last_backup_date ? new Date(bodyData.last_backup_date) : null,
      network_type: bodyData.network_type || null,
      static_ip_address: bodyData.static_ip_address || null,
      vlan: bodyData.vlan || null,
      switch_name: bodyData.switch_name || null,
      switch_port: bodyData.switch_port || null,
      updated_at: new Date()
    }

    // Handle relationships using Prisma connect/disconnect syntax
    if (bodyData.condition_id !== undefined) {
      if (bodyData.condition_id) {
        updateData.condition = { connect: { id: parseInt(bodyData.condition_id) } }
      } else {
        updateData.condition = { disconnect: true }
      }
    }

    if (bodyData.maintenance_schedule_id !== undefined) {
      if (bodyData.maintenance_schedule_id) {
        updateData.maintenance_schedule = { connect: { id: parseInt(bodyData.maintenance_schedule_id) } }
      } else {
        updateData.maintenance_schedule = { disconnect: true }
      }
    }

    if (bodyData.supplier_id !== undefined) {
      if (bodyData.supplier_id) {
        updateData.supplier = { connect: { id: parseInt(bodyData.supplier_id) } }
      } else {
        updateData.supplier = { disconnect: true }
      }
    }

    if (bodyData.assigned_to_user_id !== undefined) {
      if (bodyData.assigned_to_user_id) {
        updateData.assigned_to_user = { connect: { id: parseInt(bodyData.assigned_to_user_id) } }
      } else {
        updateData.assigned_to_user = { disconnect: true }
      }
    }

    if (bodyData.department_id !== undefined) {
      if (bodyData.department_id) {
        updateData.department = { connect: { id: parseInt(bodyData.department_id) } }
      } else {
        updateData.department = { disconnect: true }
      }
    }

    if (bodyData.location_id !== undefined) {
      if (bodyData.location_id) {
        updateData.location = { connect: { id: parseInt(bodyData.location_id) } }
      } else {
        updateData.location = { disconnect: true }
      }
    }

    // Add model relationship if it was updated
    if (modelId) {
      updateData.model = { connect: { id: modelId } }
    }

    const updatedAsset = await prisma.asset.update({
      where: {
        id: parseInt(id)
      },
      data: updateData
    })

    // Handle related links if provided
    if (bodyData.related_links !== undefined) {
      // Delete existing related links
      await prisma.assetRelatedLink.deleteMany({
        where: { asset_id: parseInt(id) }
      })

      // Create new related links
      if (bodyData.related_links.length > 0) {
        await prisma.assetRelatedLink.createMany({
          data: bodyData.related_links.map((link: any) => ({
            asset_id: parseInt(id),
            link_type: link.link_type,
            title: link.title,
            url: link.url,
            description: link.description || null
          }))
        })
      }

      // Don't log related links changes to avoid false positives in timeline
      // changes.push(`Related Links: Updated ${bodyData.related_links.length} links`)
      // changedFields.push('related_links')
    }

    // Log the activity if there were actual changes
    if (changes.length > 0) {
      await prisma.activityLog.create({
        data: {
          user_id: performingUser.id,
          action_type: 'ASSET_UPDATE',
          target_id: parseInt(id),
          target_type: 'Asset',
          details: {
            action: 'updated',
            asset_tag: currentAsset.asset_tag,
            changes: changes,
            fields_changed: changedFields,
            performed_by: `${performingUser.first_name} ${performingUser.last_name}`
          },
          external_ticket_id: `AUTO-${Date.now()}`,
          timestamp: new Date()
        }
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Asset updated successfully',
      asset: updatedAsset
    })
  } catch (error) {
    console.error('Failed to update asset:', error)
    return NextResponse.json(
      { error: 'Failed to update asset' },
      { status: 500 }
    )
  }
}