"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, PlusCircle, Users, Package, DollarSign } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/dashboard', icon: Home, label: 'Inicio' },
  { href: '/reservations', icon: Users, label: 'Reservas' },
  { href: '/new-reservation', icon: PlusCircle, label: '', isMain: true }, // Botón principal centrado
  { href: '/packages', icon: Package, label: 'Paquetes' },
  { href: '/finances', icon: DollarSign, label: 'Finanzas' },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t z-50 shadow-lg">
      <div className="flex justify-around items-center h-16 relative">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
          
          // Botón principal centrado y elevado
          if (item.isMain) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="absolute left-1/2 -translate-x-1/2 -top-6 
                           h-14 w-14 rounded-full bg-primary text-primary-foreground
                           flex items-center justify-center shadow-lg
                           transition-transform active:scale-95 hover:scale-110"
              >
                <Icon className="h-7 w-7" />
              </Link>
            )
          }
          
          // Items laterales normales
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 px-3 py-2 flex-1 transition-colors",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

