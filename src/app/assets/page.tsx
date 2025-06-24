import React, { Suspense } from 'react'
import { InteractiveAssets } from '@/components/assets/interactive-assets'
import { Loader2 } from 'lucide-react'
import { prisma } from '@/lib/prisma'

async function getAssetsData() {
  try {
    // Get assets with related data, excluding Decimal fields
    const assets = await prisma.asset.findMany({
      select: {
        id: true,
        asset_tag: true,
        serial_number: true,
        created_at: true,
        model: {
          select: {
            id: true,
            name: true,
            manufacturer: {
              select: {
                name: true
              }
            },
            category: {
              select: {
                name: true
              }
            }
          }
        },
        status: {
          select: {
            id: true,
            name: true,
            color: true
          }
        },
        assigned_to_user: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true
          }
        },
        location: {
          select: {
            id: true,
            name: true
          }
        },
        department: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    })

    // Get status counts
    const statusCounts = await prisma.asset.groupBy({
      by: ['status_id'],
      _count: {
        _all: true
      }
    })

    // Get all status labels
    const statusLabels = await prisma.statusLabel.findMany({
      select: {
        id: true,
        name: true,
        color: true
      }
    })

    return {
      assets: assets.map(asset => ({
        ...asset,
        id: asset.id.toString(),
        serial_number: asset.serial_number || undefined,
        model: {
          ...asset.model,
          id: asset.model.id.toString()
        },
        status: {
          ...asset.status,
          id: asset.status.id.toString(),
          color: asset.status.color || undefined
        },
        assigned_to_user: asset.assigned_to_user ? {
          ...asset.assigned_to_user,
          id: asset.assigned_to_user.id.toString()
        } : undefined,
        location: asset.location ? {
          ...asset.location,
          id: asset.location.id.toString()
        } : undefined,
        department: asset.department ? {
          ...asset.department,
          id: asset.department.id.toString()
        } : undefined,
        created_at: asset.created_at
      })),
      statusCounts: statusCounts.map(item => ({
        status_id: item.status_id.toString(),
        count: item._count._all
      })),
      statusLabels: statusLabels.map(label => ({
        ...label,
        id: label.id.toString(),
        color: label.color || undefined
      })),
      totalAssets: assets.length
    }
  } catch (error) {
    console.error('Failed to fetch assets:', error)
    return {
      assets: [],
      statusCounts: [],
      statusLabels: [],
      totalAssets: 0
    }
  }
}

function AssetsLoading() {
  return (
    <div className="flex items-center justify-center h-96">
      <div className="flex items-center space-x-2">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span>Loading assets...</span>
      </div>
    </div>
  )
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

interface AssetsContentProps {
  autoAdd?: boolean
}

async function AssetsContent({ autoAdd }: AssetsContentProps) {
  const data = await getAssetsData()

  return (
    <InteractiveAssets
      initialAssets={data.assets}
      statusCounts={data.statusCounts}
      statusLabels={data.statusLabels}
      totalAssets={data.totalAssets}
      autoAdd={autoAdd}
    />
  )
}

interface AssetsPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function AssetsPage({ searchParams }: AssetsPageProps) {
  const params = await searchParams
  const autoAdd = params.add === 'true'

  return (
    <div className="p-6">
      <Suspense fallback={<AssetsLoading />}>
        <AssetsContent autoAdd={autoAdd} />
      </Suspense>
    </div>
  )
}