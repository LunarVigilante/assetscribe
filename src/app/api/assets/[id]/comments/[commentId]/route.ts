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

    // For now, return a mock response since we don't have a comments table yet
    // In production, this would update the comment in the database
    const updatedComment = {
      id: parseInt(commentId),
      content: content.trim(),
      created_at: new Date('2024-06-20T10:30:00Z'),
      updated_at: new Date(),
      user: {
        id: '1',
        first_name: 'Current',
        last_name: 'User',
        email: 'current.user@company.com'
      }
    }

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
  request: Request,
  { params }: { params: { id: string; commentId: string } }
) {
  try {
    const { id, commentId } = await params

    // For now, just return success since we don't have a comments table yet
    // In production, this would delete the comment from the database
    
    return NextResponse.json({ message: 'Comment deleted successfully' })
  } catch (error) {
    console.error('Failed to delete comment:', error)
    return NextResponse.json(
      { error: 'Failed to delete comment' },
      { status: 500 }
    )
  }
} 