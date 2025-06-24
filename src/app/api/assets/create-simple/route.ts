import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      asset_tag,
      device_name,
      serial_number,
      model_name,
      model_number,
      manufacturer_id,
      category_id,
      vendor_id,
      notes,
      asset_value,
      external_ticket_id
    } = body

    // Basic validation
    if (!asset_tag?.trim()) {
      return NextResponse.json(
        { success: false, error: 'Asset tag is required' },
        { status: 400 }
      )
    }

    if (!model_number?.trim()) {
      return NextResponse.json(
        { success: false, error: 'Model number is required' },
        { status: 400 }
      )
    }

    // Create or find asset model
    let assetModel = await prisma.assetModel.findFirst({
      where: { model_number: model_number.trim() }
    })

    if (!assetModel) {
      // Create new asset model
      const modelData: any = {
        name: model_name?.trim() || model_number.trim(),
        model_number: model_number.trim(),
      }
      
      if (manufacturer_id) {
        modelData.manufacturer_id = parseInt(manufacturer_id)
      }
      
      if (category_id) {
        modelData.category_id = parseInt(category_id)
      }
      
      assetModel = await prisma.assetModel.create({
        data: modelData
      })
    }

    // Get default status (assuming "In-Stock" exists from seed data)
    const defaultStatus = await prisma.statusLabel.findFirst({
      where: { name: { in: ['In-Stock', 'Deployed', 'Active'] } }
    })

    if (!defaultStatus) {
      return NextResponse.json(
        { success: false, error: 'No default status found in database' },
        { status: 500 }
      )
    }

    // Create the asset
    const asset = await prisma.asset.create({
      data: {
        asset_tag: asset_tag.trim(),
        device_name: device_name?.trim() || null,
        serial_number: serial_number?.trim() || null,
        model_id: assetModel.id,
        status_id: defaultStatus.id,
        supplier_id: vendor_id ? parseInt(vendor_id) : null,
        purchase_cost: asset_value ? parseFloat(asset_value) : null,
        notes: notes?.trim() || null,
      },
      include: {
        model: {
          include: {
            manufacturer: true,
            category: true,
          }
        },
        status: true,
        supplier: true,
      }
    })

    return NextResponse.json({
      success: true,
      data: asset,
      message: 'Asset created successfully'
    }, { status: 201 })

  } catch (error: any) {
    console.error('Error creating asset:', error)
    
    if (error.code === 'P2002') {
      return NextResponse.json(
        { success: false, error: 'Asset tag already exists' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Failed to create asset' },
      { status: 500 }
    )
  }
} 