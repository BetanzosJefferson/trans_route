'use client'

import { useState } from 'react'
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
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/use-toast'
import { api } from '@/lib/api'
import { CheckCircle, User, MapPin, Calendar } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface CheckInModalProps {
  open: boolean
  onClose: () => void
  reservation: any
  onSuccess: () => void
}

export function CheckInModal({
  open,
  onClose,
  reservation,
  onSuccess,
}: CheckInModalProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [notes, setNotes] = useState('')

  const handleSubmit = async () => {
    setLoading(true)
    try {
      await api.reservations.checkIn(reservation.id, {
        notes: notes || undefined,
      })

      toast({
        title: 'Check-in realizado',
        description: `Check-in de ${reservation.client?.first_name} ${reservation.client?.last_name} completado`,
      })

      onSuccess()
      onClose()
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'No se pudo realizar el check-in',
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
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-green-600">
            <CheckCircle className="h-5 w-5" />
            Realizar Check-in
          </DialogTitle>
          <DialogDescription>
            Confirma el check-in del pasajero
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Información del pasajero */}
          <div className="rounded-lg border p-4 space-y-3 bg-muted/50">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">
                {reservation?.client?.first_name} {reservation?.client?.last_name}
              </span>
            </div>
            
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

            <div className="flex items-center justify-between pt-2 border-t">
              <span className="text-sm text-muted-foreground">Asientos:</span>
              <span className="font-medium">
                {reservation?.seats_reserved} asiento{reservation?.seats_reserved > 1 ? 's' : ''}
              </span>
            </div>
          </div>

          {/* Notas opcionales */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notas (opcional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ej: Llegó 30 minutos antes..."
              rows={3}
            />
          </div>

          {/* Información */}
          <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800">
            <CheckCircle className="inline mr-2 h-4 w-4" />
            El check-in quedará registrado con tu usuario y hora actual
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={loading} className="bg-green-600 hover:bg-green-700">
            {loading ? 'Procesando...' : 'Confirmar Check-in'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

