import React, { Suspense } from 'react'
import { InteractiveUsers } from '@/components/users/interactive-users'
import { Loader2 } from 'lucide-react'
import { prisma } from '@/lib/prisma'

async function getUsersData() {
  try {
    // Get users with related data
    const usersData = await prisma.user.findMany({
      include: {
        department: true,
        location: true,
        user_roles: {
          include: {
            role: true
          }
        },
        assigned_assets: {
          select: {
            id: true,
            asset_tag: true,
            model: {
              select: {
                name: true,
                category: {
                  select: {
                    name: true
                  }
                }
              }
            }
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      },
      take: 50 // Limit for initial load
    })

    // Get departments
    const departments = await prisma.department.findMany({
      orderBy: {
        name: 'asc'
      }
    })

    // Get user statistics
    const totalUsers = await prisma.user.count()
    const activeUsers = await prisma.user.count({
      where: { is_active: true }
    })
    const inactiveUsers = totalUsers - activeUsers

    return {
      users: usersData as any,
      departments,
      totalUsers,
      activeUsers,
      inactiveUsers
    }
  } catch (error) {
    console.error('Error fetching users:', error)
    return {
      users: [],
      departments: [],
      totalUsers: 0,
      activeUsers: 0,
      inactiveUsers: 0
    }
  }
}

function UsersLoading() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="flex items-center gap-2">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="text-muted-foreground">Loading users...</span>
      </div>
    </div>
  )
}

async function UsersContent() {
  const data = await getUsersData()

  return (
    <InteractiveUsers 
      initialUsers={data.users}
      departments={data.departments}
      totalUsers={data.totalUsers}
      activeUsers={data.activeUsers}
      inactiveUsers={data.inactiveUsers}
    />
  )
}

export default function UsersPage() {
  return (
    <div className="p-6">
      <Suspense fallback={<UsersLoading />}>
        <UsersContent />
      </Suspense>
    </div>
  )
} 