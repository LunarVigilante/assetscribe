import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params
    
    // For now, return mock comments since we don't have a comments table yet
    // In production, this would query the database
    const mockComments = [
      {
        id: 1,
        content: "This laptop has been working great for the past 6 months. No issues to report.",
        created_at: new Date('2024-06-20T10:30:00Z'),
        updated_at: new Date('2024-06-20T10:30:00Z'),
        user: {
          id: '1',
          first_name: 'Sarah',
          last_name: 'Johnson',
          email: 'sarah.johnson@company.com'
        }
      },
      {
        id: 2,
        content: "Updated RAM from 8GB to 16GB. Performance significantly improved. Receipt attached to documents.",
        created_at: new Date('2024-06-21T14:15:00Z'),
        updated_at: new Date('2024-06-21T14:20:00Z'),
        user: {
          id: '2',
          first_name: 'John',
          last_name: 'Smith',
          email: 'john.smith@company.com'
        }
      }
    ]

    return NextResponse.json(mockComments)
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

    // For now, return a mock response since we don't have a comments table yet
    // In production, this would create a new comment in the database
    const newComment = {
      id: Date.now(), // Mock ID
      content: content.trim(),
      created_at: new Date(),
      updated_at: new Date(),
      user: {
        id: '1', // This would come from authentication
        first_name: 'Current',
        last_name: 'User',
        email: 'current.user@company.com'
      }
    }

    return NextResponse.json(newComment)
  } catch (error) {
    console.error('Failed to create comment:', error)
    return NextResponse.json(
      { error: 'Failed to create comment' },
      { status: 500 }
    )
  }
} 