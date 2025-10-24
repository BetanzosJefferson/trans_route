"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Home,
  Bus,
  Users,
  Package,
  DollarSign,
  Route,
  Car,
  Receipt,
  PieChart,
  Settings,
  Building2,
  UserPlus,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/dashboard', icon: Home, label: 'Dashboard' },
  { href: '/dashboard/invitations', icon: UserPlus, label: 'Invitaciones', superAdminOnly: true },
  { href: '/dashboard/trips', icon: Bus, label: 'Viajes' },
  { href: '/dashboard/routes', icon: Route, label: 'Rutas' },
  { href: '/dashboard/reservations', icon: Users, label: 'Reservaciones' },
  { href: '/dashboard/packages', icon: Package, label: 'Paquetería' },
  { href: '/dashboard/vehicles', icon: Car, label: 'Vehículos' },
  { href: '/dashboard/finances', icon: DollarSign, label: 'Finanzas' },
  { href: '/dashboard/transactions', icon: Receipt, label: 'Transacciones' },
  { href: '/dashboard/reports', icon: PieChart, label: 'Reportes' },
  { href: '/dashboard/company', icon: Building2, label: 'Empresa' },
  { href: '/dashboard/settings', icon: Settings, label: 'Configuración' },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden md:flex w-64 bg-card border-r flex-col">
      <div className="p-6 border-b">
        <h1 className="text-2xl font-bold text-primary">TransRoute</h1>
      </div>
      <nav className="flex-1 overflow-y-auto p-4">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
            
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
    </aside>
  )
}

