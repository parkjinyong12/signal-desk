'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { LayoutDashboard, CheckSquare, Star, Newspaper, Settings } from 'lucide-react'

const navItems = [
  { href: '/dashboard', label: '대시보드', icon: LayoutDashboard },
  { href: '/tasks', label: '할 일', icon: CheckSquare },
  { href: '/interests', label: '관심', icon: Star },
  { href: '/news', label: '뉴스', icon: Newspaper },
  { href: '/settings', label: '설정', icon: Settings },
]

export function Navbar() {
  const pathname = usePathname()

  return (
    <>
      {/* Desktop top nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-slate-100 shadow-sm hidden sm:block">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center h-14 gap-1">
            <Link href="/dashboard" className="mr-4 font-bold text-brand-600 text-lg tracking-tight">
              Signal Desk
            </Link>
            {navItems.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  pathname === href
                    ? 'bg-brand-50 text-brand-600'
                    : 'text-slate-600 hover:text-slate-800 hover:bg-slate-50'
                )}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {/* Mobile top bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-slate-100 shadow-sm sm:hidden">
        <div className="flex items-center justify-center h-12 px-4">
          <span className="font-bold text-brand-600 text-base tracking-tight">Signal Desk</span>
        </div>
      </nav>

      {/* Mobile bottom tab bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-100 sm:hidden">
        <div className="grid grid-cols-4">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-col items-center justify-center py-2 gap-0.5 text-xs font-medium transition-colors',
                pathname === href ? 'text-brand-600' : 'text-slate-400'
              )}
            >
              <Icon className={cn('w-5 h-5', pathname === href ? 'text-brand-600' : 'text-slate-400')} />
              {label}
            </Link>
          ))}
        </div>
      </div>
    </>
  )
}
