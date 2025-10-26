'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar, MapPin, Users, DollarSign, Bus } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface ReservationsByTripViewProps {
  reservations: any[]
  onCheckIn: (reservation: any) => void
  onAddPayment: (reservation: any) => void
  onCancel: (reservation: any) => void
  onModify: (reservation: any) => void
}

export function ReservationsByTripView({
  reservations,
  onCheckIn,
  onAddPayment,
  onCancel,
  onModify,
}: ReservationsByTripViewProps) {
  // Agrupar reservaciones por viaje
  const groupedByTrip = reservations.reduce((acc: any, reservation) => {
    const tripId = reservation.trip_segment?.trip?.id
    if (!tripId) return acc

    if (!acc[tripId]) {
      acc[tripId] = {
        trip: reservation.trip_segment.trip,
        route: reservation.trip_segment.trip.route,
        reservations: [],
        totalRevenue: 0,
        totalSeats: 0,
        checkedInCount: 0,
      }
    }

    acc[tripId].reservations.push(reservation)
    acc[tripId].totalRevenue += reservation.amount_paid || 0
    acc[tripId].totalSeats += reservation.seats_reserved || 0
    if (reservation.checked_in_at) acc[tripId].checkedInCount++

    return acc
  }, {})

  const trips = Object.values(groupedByTrip)

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "d 'de' MMMM, yyyy HH:mm", { locale: es })
    } catch {
      return dateString
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      pending: { label: 'Pendiente', variant: 'secondary' },
      confirmed: { label: 'Confirmada', variant: 'default' },
      cancelled: { label: 'Cancelada', variant: 'destructive' },
      completed: { label: 'Completada', variant: 'outline' },
    }
    const config = variants[status] || { label: status, variant: 'outline' }
    return <Badge variant={config.variant} className="text-xs">{config.label}</Badge>
  }

  if (trips.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <p className="text-muted-foreground">No hay viajes con reservaciones</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {trips.map((tripGroup: any) => {
        const capacity = tripGroup.trip.capacity || 0
        const occupancyPercentage = capacity > 0 ? (tripGroup.totalSeats / capacity) * 100 : 0

        return (
          <Card key={tripGroup.trip.id} className="overflow-hidden">
            <CardHeader className="bg-muted/50">
              <div className="flex items-start justify-between">
                <div className="space-y-2 flex-1">
                  <CardTitle className="flex items-center gap-2">
                    <Bus className="h-5 w-5" />
                    {tripGroup.route?.name || 'Ruta sin nombre'}
                  </CardTitle>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {tripGroup.route?.origin} → {tripGroup.route?.destination}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {formatDate(tripGroup.trip.departure_datetime)}
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <Badge variant="outline">
                      <Users className="mr-1 h-3 w-3" />
                      {tripGroup.totalSeats}/{capacity} asientos
                    </Badge>
                    <Badge variant="outline">
                      <DollarSign className="mr-1 h-3 w-3" />
                      ${tripGroup.totalRevenue.toFixed(2)}
                    </Badge>
                    <Badge variant="outline">
                      {tripGroup.checkedInCount}/{tripGroup.reservations.length} check-in
                    </Badge>
                  </div>

                  {/* Barra de ocupación */}
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        occupancyPercentage >= 90
                          ? 'bg-red-500'
                          : occupancyPercentage >= 70
                          ? 'bg-yellow-500'
                          : 'bg-green-500'
                      }`}
                      style={{ width: `${Math.min(occupancyPercentage, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              <div className="divide-y">
                {tripGroup.reservations.map((reservation: any) => {
                  const amountPaid = reservation.amount_paid || 0
                  const totalAmount = reservation.total_amount || 0
                  const isPaid = amountPaid >= totalAmount

                  return (
                    <div key={reservation.id} className="p-4 hover:bg-muted/30 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">
                              {reservation.client?.first_name} {reservation.client?.last_name}
                            </span>
                            {reservation.client?.phone && (
                              <span className="text-sm text-muted-foreground">
                                • {reservation.client.phone}
                              </span>
                            )}
                            {reservation.checked_in_at && (
                              <Badge variant="outline" className="bg-green-50 text-xs">
                                ✓ Check-in
                              </Badge>
                            )}
                            {reservation.is_no_show && (
                              <Badge variant="destructive" className="text-xs">
                                No Show
                              </Badge>
                            )}
                          </div>

                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>
                              {reservation.trip_segment?.origin} → {reservation.trip_segment?.destination}
                            </span>
                            <span>
                              {reservation.seats_reserved} asiento{reservation.seats_reserved > 1 ? 's' : ''}
                            </span>
                            <span>
                              ${amountPaid.toFixed(2)} / ${totalAmount.toFixed(2)}
                            </span>
                            {!isPaid && (
                              <Badge variant="outline" className="text-xs bg-yellow-50">
                                Pago pendiente
                              </Badge>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {getStatusBadge(reservation.status)}
                          {!reservation.checked_in_at && reservation.status === 'confirmed' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => onCheckIn(reservation)}
                            >
                              Check-in
                            </Button>
                          )}
                          {!isPaid && reservation.status !== 'cancelled' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => onAddPayment(reservation)}
                            >
                              Agregar Pago
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

