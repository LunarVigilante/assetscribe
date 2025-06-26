import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params
    
    const comments = await prisma.comment.findMany({
      where: {
        asset_id: parseInt(id)
      },
      include: {
        user: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    })

    return NextResponse.json(comments)
  } catch (error) {
    console.error('Failed to fetch comments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch comments' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params
    const { content } = await request.json()

    if (!content || !content.trim()) {
      return NextResponse.json(
        { error: 'Comment content is required' },
        { status: 400 }
      )
    }

    // Create new comment in database
    // For now, using user ID 1 - in production, this would come from authentication
    const newComment = await prisma.comment.create({
      data: {
        asset_id: parseInt(id),
        user_id: 1, // TODO: Get from authenticated user session
        content: content.trim()
      },
      include: {
        user: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true
          }
        }
      }
    })

    // Log the activity
    const asset = await prisma.asset.findUnique({
      where: { id: parseInt(id) },
      select: { asset_tag: true }
    })

    await prisma.activityLog.create({
      data: {
        user_id: 1, // Same user who created the comment
        action_type: 'COMMENT_ADD',
        target_id: parseInt(id),
        target_type: 'Asset',
        details: {
          action: 'added_comment',
          asset_tag: asset?.asset_tag,
          comment_preview: content.trim().substring(0, 50) + (content.trim().length > 50 ? '...' : ''),
          performed_by: `${newComment.user.first_name} ${newComment.user.last_name}`
        },
        external_ticket_id: `AUTO-${Date.now()}`,
        timestamp: new Date()
      }
    })

    return NextResponse.json(newComment)
  } catch (error) {
    console.error('Failed to create comment:', error)
    return NextResponse.json(
      { error: 'Failed to create comment' },
      { status: 500 }
    )
  }
} 