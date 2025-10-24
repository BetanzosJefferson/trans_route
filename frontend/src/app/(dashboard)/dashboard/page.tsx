"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Bus, Users, Package, DollarSign, TrendingUp, TrendingDown, Loader2 } from 'lucide-react'
import { api } from '@/lib/api'
import { formatCurrency, formatDate } from '@/lib/utils'
import { useToast } from '@/components/ui/use-toast'

export default function DashboardPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    trips_today: 0,
    reservations_total: 0,
    packages_total: 0,
    income_today: 0,
  })
  const [upcomingTrips, setUpcomingTrips] = useState<any[]>([])
  const [recentReservations, setRecentReservations] = useState<any[]>([])

  // Obtener company_id del usuario actual
  const [companyId, setCompanyId] = useState<string>('')

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      // Obtener datos del usuario actual desde localStorage o hacer una llamada al backend
      const token = api.getToken()
      if (!token) {
        toast({
          variant: 'destructive',
          title: 'No autenticado',
          description: 'Por favor inicia sesión',
        })
        return
      }

      // Decodificar token para obtener company_id (simplificado)
      const payload = JSON.parse(atob(token.split('.')[1]))
      const userCompanyId = payload.company_id || '11111111-1111-1111-1111-111111111111'
      setCompanyId(userCompanyId)

      // Cargar estadísticas
      await loadStats(userCompanyId)
      await loadUpcomingTrips(userCompanyId)
      await loadRecentReservations(userCompanyId)
    } catch (error: any) {
      console.error('Error loading dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async (companyId: string) => {
    try {
      const today = new Date().toISOString().split('T')[0]

      // Obtener viajes de hoy
      const trips = await api.trips.getAll(companyId, {
        from_date: today,
      })

      // Obtener reservaciones
      const reservations = await api.reservations.getAll(companyId, {
        status: 'confirmed',
      })

      // Obtener transacciones de hoy para calcular ingresos
      const transactions = await api.transactions.getAll(companyId, {
        from_date: today,
      })

      const incomeToday = transactions?.reduce((sum: number, t: any) => {
        if (t.type === 'ticket' || t.type === 'package') {
          return sum + Number(t.amount)
        }
        return sum
      }, 0) || 0

      setStats({
        trips_today: trips?.length || 0,
        reservations_total: reservations?.length || 0,
        packages_total: 0, // TODO: implementar cuando tengamos datos de paquetes
        income_today: incomeToday,
      })
    } catch (error) {
      console.error('Error loading stats:', error)
    }
  }

  const loadUpcomingTrips = async (companyId: string) => {
    try {
      const trips = await api.trips.getAll(companyId, {
        visibility: 'published',
      })
      
      // Filtrar solo viajes futuros y tomar los primeros 5
      const now = new Date()
      const upcoming = trips
        ?.filter((t: any) => new Date(t.departure_datetime) > now)
        ?.sort((a: any, b: any) => 
          new Date(a.departure_datetime).getTime() - new Date(b.departure_datetime).getTime()
        )
        ?.slice(0, 5) || []

      setUpcomingTrips(upcoming)
    } catch (error) {
      console.error('Error loading trips:', error)
    }
  }

  const loadRecentReservations = async (companyId: string) => {
    try {
      const reservations = await api.reservations.getAll(companyId, {
        status: 'confirmed',
      })
      
      // Tomar las 5 más recientes
      const recent = reservations?.slice(0, 5) || []
      setRecentReservations(recent)
    } catch (error) {
      console.error('Error loading reservations:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-muted-foreground">
          Resumen general de tu operación
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Viajes Hoy"
          value={stats.trips_today.toString()}
          change="En tiempo real"
          trend="up"
          icon={<Bus className="h-5 w-5" />}
        />
        <StatCard
          title="Reservaciones"
          value={stats.reservations_total.toString()}
          change="Confirmadas"
          trend="up"
          icon={<Users className="h-5 w-5" />}
        />
        <StatCard
          title="Paquetes"
          value={stats.packages_total.toString()}
          change="En tránsito"
          trend="up"
          icon={<Package className="h-5 w-5" />}
        />
        <StatCard
          title="Ingresos Hoy"
          value={formatCurrency(stats.income_today)}
          change="Desde medianoche"
          trend="up"
          icon={<DollarSign className="h-5 w-5" />}
        />
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Próximos Viajes</CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingTrips.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">
                No hay viajes próximos
              </p>
            ) : (
              <div className="space-y-4">
                {upcomingTrips.map((trip) => (
                  <TripItem
                    key={trip.id}
                    route={trip.route?.name || `${trip.route?.origin} - ${trip.route?.destination}`}
                    time={new Date(trip.departure_datetime).toLocaleTimeString('es-MX', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                    seats={`${trip.capacity} asientos`}
                    status={trip.visibility === 'published' ? 'Publicado' : 'Oculto'}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Reservaciones Recientes</CardTitle>
          </CardHeader>
          <CardContent>
            {recentReservations.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">
                No hay reservaciones recientes
              </p>
            ) : (
              <div className="space-y-4">
                {recentReservations.map((reservation) => (
                  <ActivityItem
                    key={reservation.id}
                    action="Nueva reservación"
                    details={`${reservation.client?.first_name} ${reservation.client?.last_name} - ${formatCurrency(reservation.total_amount)}`}
                    time={formatDate(reservation.created_at)}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function StatCard({
  title,
  value,
  change,
  trend,
  icon,
}: {
  title: string
  value: string
  change: string
  trend: 'up' | 'down'
  icon: React.ReactNode
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className="text-muted-foreground">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className={`text-xs flex items-center gap-1 mt-1 ${
          trend === 'up' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
        }`}>
          {trend === 'up' ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
          {change}
        </p>
      </CardContent>
    </Card>
  )
}

function TripItem({
  route,
  time,
  seats,
  status,
}: {
  route: string
  time: string
  seats: string
  status: string
}) {
  return (
    <div className="flex items-center justify-between border-b pb-3 last:border-0">
      <div>
        <p className="font-medium">{route}</p>
        <p className="text-sm text-muted-foreground">{time}</p>
      </div>
      <div className="text-right">
        <p className="text-sm font-medium">{seats}</p>
        <p className="text-xs text-muted-foreground">{status}</p>
      </div>
    </div>
  )
}

function ActivityItem({
  action,
  details,
  time,
}: {
  action: string
  details: string
  time: string
}) {
  return (
    <div className="border-b pb-3 last:border-0">
      <p className="font-medium">{action}</p>
      <p className="text-sm text-muted-foreground">{details}</p>
      <p className="text-xs text-muted-foreground mt-1">{time}</p>
    </div>
  )
}
