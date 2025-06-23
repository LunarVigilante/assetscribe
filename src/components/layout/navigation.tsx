'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { ThemeToggle } from '@/components/theme-toggle'
import { 
  LayoutDashboard, 
  HardDrive, 
  Users, 
  Package, 
  Settings, 
  Activity,
  Network,
  FileText,
  Calendar
} from 'lucide-react'

const navigationItems = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Assets',
    href: '/assets',
    icon: HardDrive,
  },
  {
    title: 'Users',
    href: '/users',
    icon: Users,
  },
  {
    title: 'Licenses',
    href: '/licenses',
    icon: FileText,
  },
  {
    title: 'Consumables',
    href: '/consumables',
    icon: Package,
  },
  {
    title: 'CMDB',
    href: '/cmdb',
    icon: Network,
  },
  {
    title: 'Workflows',
    href: '/workflows',
    icon: Calendar,
  },
  {
    title: 'Activity Log',
    href: '/activity',
    icon: Activity,
  },
  {
    title: 'Settings',
    href: '/settings',
    icon: Settings,
  },
]

export function Navigation() {
  const pathname = usePathname()

  return (
    <div className="hidden md:flex md:w-64 md:flex-col">
      <div className="flex flex-col flex-grow pt-5 bg-background border-r border-border overflow-y-auto">
        {/* Logo */}
        <div className="flex items-center flex-shrink-0 px-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <HardDrive className="h-8 w-8 text-primary" />
            </div>
            <div className="ml-3">
              <h1 className="text-xl font-bold text-foreground">AssetScribe</h1>
              <p className="text-xs text-muted-foreground">Asset Management</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-8 flex-grow flex flex-col">
          <nav className="flex-1 px-2 space-y-1">
            {navigationItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.title}
                  href={item.href}
                  className={cn(
                    'group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                  )}
                >
                  <item.icon
                    className={cn(
                      'mr-3 h-5 w-5 flex-shrink-0',
                      isActive ? 'text-primary-foreground' : 'text-muted-foreground group-hover:text-foreground'
                    )}
                  />
                  {item.title}
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 border-t border-border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">
                Service Desk Platform v1.0
              </p>
              <p className="text-xs text-muted-foreground/70">
                Phase I: Core Foundation
              </p>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </div>
  )
}

interface MainLayoutProps {
  children: React.ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="flex h-screen bg-background">
      <Navigation />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 relative overflow-y-auto focus:outline-none bg-muted/30">
          {children}
        </main>
      </div>
    </div>
  )
} 