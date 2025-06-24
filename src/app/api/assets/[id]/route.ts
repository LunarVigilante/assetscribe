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
        assigned_to_user: true,
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
        email: asset.assigned_to_user.email
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
      // Mock hardware specifications - in real app, these would come from the database
      cpu: id === '6' ? 'Intel Core i7-12700H' : id === '3' ? 'AMD Ryzen 7 5800H' : undefined,
      ram_gb: id === '6' ? 16 : id === '3' ? 32 : undefined,
      storage_type: id === '6' ? 'NVMe' : id === '3' ? 'SSD' : undefined,
      storage_size_gb: id === '6' ? 512 : id === '3' ? 1024 : undefined,
      screen_size: asset.model.category.name.toLowerCase().includes('laptop') ? '15.6 inches' : undefined,
      gpu: id === '6' ? 'NVIDIA GeForce RTX 3070' : id === '3' ? 'Integrated AMD Radeon' : undefined,
      operating_system: 'Windows 11 Pro',
      bitlocker_recovery_key: (asset.model.category.name.toLowerCase().includes('laptop') || 
                              asset.model.category.name.toLowerCase().includes('desktop')) 
                              ? '123456-654321-789012-345678-901234-567890-123456-789012' 
                              : undefined,
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

    let modelId: number | undefined

    // Handle model updates if manufacturer or category changed
    if (body.manufacturer_id || body.category_id || body.model_name || body.model_number) {
      const modelName = body.model_name || 'Unknown Model'
      const modelNumber = body.model_number || modelName
      const manufacturerId = body.manufacturer_id ? parseInt(body.manufacturer_id) : undefined
      const categoryId = body.category_id ? parseInt(body.category_id) : undefined

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
      }
    }

    // Update asset in database
    const updateData: any = {
      asset_tag: body.asset_tag,
      device_name: body.device_name || null,
      serial_number: body.serial_number || null,
      notes: body.notes || null,
      // Asset information
      condition_id: body.condition_id ? parseInt(body.condition_id) : null,
      maintenance_schedule_id: body.maintenance_schedule_id ? parseInt(body.maintenance_schedule_id) : null,
      supplier_id: body.supplier_id ? parseInt(body.supplier_id) : null,
      verification_interval_months: body.verification_interval_months ? parseInt(body.verification_interval_months) : null,
      // Financial information
      purchase_date: body.purchase_date ? new Date(body.purchase_date) : null,
      purchase_cost: body.purchase_cost ? parseFloat(body.purchase_cost) : null,
      warranty_expiry_date: body.warranty_expiry_date ? new Date(body.warranty_expiry_date) : null,
      // Assignment & Location
      assigned_to_user_id: body.assigned_to_user_id ? parseInt(body.assigned_to_user_id) : null,
      department_id: body.department_id ? parseInt(body.department_id) : null,
      location_id: body.location_id ? parseInt(body.location_id) : null,
      updated_at: new Date()
    }

    // Add model_id if it was updated
    if (modelId) {
      updateData.model_id = modelId
    }

    const updatedAsset = await prisma.asset.update({
      where: {
        id: parseInt(id)
      },
      data: updateData
    })

    // Handle related links if provided
    if (body.related_links) {
      // Delete existing related links
      await prisma.assetRelatedLink.deleteMany({
        where: { asset_id: parseInt(id) }
      })

      // Create new related links
      if (body.related_links.length > 0) {
        await prisma.assetRelatedLink.createMany({
          data: body.related_links.map((link: any) => ({
            asset_id: parseInt(id),
            link_type: link.link_type,
            title: link.title,
            url: link.url,
            description: link.description || null
          }))
        })
      }
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