'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/components/ui/use-toast'
import { api } from '@/lib/api'
import { Calendar, MapPin, Clock, AlertCircle } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { fromZonedTime } from 'date-fns-tz'
import { TIMEZONE } from '@/lib/date-utils'

interface ModifyReservationModalProps {
  open: boolean
  onClose: () => void
  reservation: any
  onSuccess: () => void
}

export function ModifyReservationModal({
  open,
  onClose,
  reservation,
  onSuccess,
}: ModifyReservationModalProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [searchingTrips, setSearchingTrips] = useState(false)
  const [selectedDate, setSelectedDate] = useState('')
  const [availableTrips, setAvailableTrips] = useState<any[]>([])
  const [selectedTrip, setSelectedTrip] = useState('')

  useEffect(() => {
    if (open && selectedDate) {
      searchAvailableTrips()
    }
  }, [open, selectedDate])

  const searchAvailableTrips = async () => {
    if (!selectedDate) return

    setSearchingTrips(true)
    try {
      const companyId = localStorage.getItem('company_id') || ''
      
      // Convertir fecha local a UTC
      const localDate = new Date(selectedDate + 'T00:00:00')
      const dateFrom = fromZonedTime(localDate, TIMEZONE)
      const nextDay = new Date(localDate)
      nextDay.setDate(nextDay.getDate() + 1)
      const dateTo = fromZonedTime(nextDay, TIMEZONE)

      const data = await api.reservations.searchAvailableTrips({
        company_id: companyId,
        date_from: dateFrom.toISOString(),
        date_to: dateTo.toISOString(),
        min_seats: reservation.seats_reserved,
      })

      setAvailableTrips(data || [])
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudieron cargar los viajes disponibles',
      })
    } finally {
      setSearchingTrips(false)
    }
  }

  const handleSubmit = async () => {
    if (!selectedTrip) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Selecciona un nuevo viaje',
      })
      return
    }

    if (selectedTrip === reservation.trip_segment_id) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'El viaje seleccionado es el mismo que el actual',
      })
      return
    }

    setLoading(true)
    try {
      await api.reservations.modifyTrip(reservation.id, {
        newTripSegmentId: selectedTrip,
      })

      toast({
        title: 'Reserva modificada',
        description: 'El viaje de la reserva fue actualizado exitosamente',
      })

      onSuccess()
      onClose()
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'No se pudo modificar la reserva',
      })
    } finally {
      setLoading(false)
    }
  }

  const formatDateTime = (dateString: string) => {
    try {
      return format(new Date(dateString), "d 'de' MMMM, HH:mm", { locale: es })
    } catch {
      return dateString
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Modificar Viaje de Reserva</DialogTitle>
          <DialogDescription>
            Cambia la fecha y hora del viaje de {reservation?.client?.first_name}{' '}
            {reservation?.client?.last_name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Información actual */}
          <div className="rounded-lg border p-4 space-y-2 bg-muted/50">
            <div className="font-medium text-sm">Viaje actual:</div>
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>
                {reservation?.trip_segment?.origin} → {reservation?.trip_segment?.destination}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>{formatDateTime(reservation?.trip_segment?.departure_time)}</span>
            </div>
          </div>

          {/* Seleccionar nueva fecha */}
          <div className="space-y-2">
            <Label htmlFor="new-date">Nueva fecha</Label>
            <Input
              id="new-date"
              type="date"
              value={selectedDate}
              onChange={(e) => {
                setSelectedDate(e.target.value)
                setSelectedTrip('')
              }}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          {/* Lista de viajes disponibles */}
          {selectedDate && (
            <div className="space-y-2">
              <Label>Viajes disponibles</Label>
              {searchingTrips ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-2 text-sm text-muted-foreground">Buscando viajes...</p>
                </div>
              ) : availableTrips.length === 0 ? (
                <div className="p-8 text-center border rounded-lg">
                  <AlertCircle className="h-8 w-8 mx-auto text-muted-foreground" />
                  <p className="mt-2 text-sm text-muted-foreground">
                    No hay viajes disponibles para esta fecha con {reservation.seats_reserved}{' '}
                    asiento{reservation.seats_reserved > 1 ? 's' : ''}
                  </p>
                </div>
              ) : (
                <div className="border rounded-lg divide-y max-h-[300px] overflow-y-auto">
                  {availableTrips.map((trip) => (
                    <div
                      key={trip.id}
                      className={`p-3 cursor-pointer hover:bg-muted/50 transition-colors ${
                        selectedTrip === trip.id ? 'bg-primary/10 border-l-4 border-primary' : ''
                      }`}
                      onClick={() => setSelectedTrip(trip.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">
                              {trip.origin} → {trip.destination}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {formatDateTime(trip.departure_time)}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">${trip.price?.toFixed(2)}</div>
                          <div className="text-xs text-muted-foreground">
                            {trip.available_seats} asientos
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Advertencia */}
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800">
            <AlertCircle className="inline mr-2 h-4 w-4" />
            Los asientos del viaje anterior se liberarán automáticamente
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={loading || !selectedTrip}>
            {loading ? 'Modificando...' : 'Confirmar Cambio'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

