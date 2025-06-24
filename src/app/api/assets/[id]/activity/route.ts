import { NextRequest, NextResponse } from 'next/server'
import { getActivityLog } from '@/lib/activity-log'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const assetId = parseInt(id)

    if (isNaN(assetId)) {
      return NextResponse.json(
        { error: 'Invalid asset ID' },
        { status: 400 }
      )
    }

    const activityLog = await getActivityLog({
      targetType: 'Asset',
      targetId: assetId,
      limit: 50
    })

    return NextResponse.json(activityLog.data)
  } catch (error) {
    console.error('Error fetching asset activity:', error)
    return NextResponse.json(
      { error: 'Failed to fetch activity log' },
      { status: 500 }
    )
  }
} 