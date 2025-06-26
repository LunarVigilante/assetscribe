import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; commentId: string } }
) {
  try {
    const { id, commentId } = await params
    const { content } = await request.json()

    if (!content || !content.trim()) {
      return NextResponse.json(
        { error: 'Comment content is required' },
        { status: 400 }
      )
    }

    // Get the original comment for audit trail
    const originalComment = await prisma.comment.findUnique({
      where: { id: parseInt(commentId) },
      include: {
        user: {
          select: {
            id: true,
            first_name: true,
            last_name: true
          }
        }
      }
    })

    if (!originalComment) {
      return NextResponse.json(
        { error: 'Comment not found' },
        { status: 404 }
      )
    }

    // Update comment in database
    const updatedComment = await prisma.comment.update({
      where: {
        id: parseInt(commentId)
      },
      data: {
        content: content.trim(),
        updated_at: new Date()
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
        user_id: updatedComment.user.id,
        action_type: 'COMMENT_EDIT',
        target_id: parseInt(id),
        target_type: 'Asset',
        details: {
          action: 'edited_comment',
          asset_tag: asset?.asset_tag,
          comment_id: parseInt(commentId),
          old_content: originalComment.content.substring(0, 50) + (originalComment.content.length > 50 ? '...' : ''),
          new_content: content.trim().substring(0, 50) + (content.trim().length > 50 ? '...' : ''),
          performed_by: `${updatedComment.user.first_name} ${updatedComment.user.last_name}`
        },
        external_ticket_id: `AUTO-${Date.now()}`,
        timestamp: new Date()
      }
    })

    return NextResponse.json(updatedComment)
  } catch (error) {
    console.error('Failed to update comment:', error)
    return NextResponse.json(
      { error: 'Failed to update comment' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; commentId: string } }
) {
  try {
    const { id, commentId } = await params

    // Get the comment before deletion for audit trail
    const commentToDelete = await prisma.comment.findUnique({
      where: { id: parseInt(commentId) },
      include: {
        user: {
          select: {
            id: true,
            first_name: true,
            last_name: true
          }
        }
      }
    })

    if (!commentToDelete) {
      return NextResponse.json(
        { error: 'Comment not found' },
        { status: 404 }
      )
    }

    // Delete comment from database
    await prisma.comment.delete({
      where: {
        id: parseInt(commentId)
      }
    })

    // Log the activity
    const asset = await prisma.asset.findUnique({
      where: { id: parseInt(id) },
      select: { asset_tag: true }
    })

    await prisma.activityLog.create({
      data: {
        user_id: commentToDelete.user.id,
        action_type: 'COMMENT_DELETE',
        target_id: parseInt(id),
        target_type: 'Asset',
        details: {
          action: 'deleted_comment',
          asset_tag: asset?.asset_tag,
          comment_id: parseInt(commentId),
          deleted_content: commentToDelete.content.substring(0, 50) + (commentToDelete.content.length > 50 ? '...' : ''),
          performed_by: `${commentToDelete.user.first_name} ${commentToDelete.user.last_name}`
        },
        external_ticket_id: `AUTO-${Date.now()}`,
        timestamp: new Date()
      }
    })

    return NextResponse.json({ message: 'Comment deleted successfully' })
  } catch (error) {
    console.error('Failed to delete comment:', error)
    return NextResponse.json(
      { error: 'Failed to delete comment' },
      { status: 500 }
    )
  }
} 