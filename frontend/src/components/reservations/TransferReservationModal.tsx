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
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/use-toast'
import { api } from '@/lib/api'
import { ArrowRightLeft, AlertTriangle, Building2 } from 'lucide-react'

interface TransferReservationModalProps {
  open: boolean
  onClose: () => void
  reservation: any
  onSuccess: () => void
}

export function TransferReservationModal({
  open,
  onClose,
  reservation,
  onSuccess,
}: TransferReservationModalProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [companyId, setCompanyId] = useState('')
  const [transferNotes, setTransferNotes] = useState('')

  const handleSubmit = async () => {
    if (!companyId.trim()) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Ingresa el ID de la compañía destino',
      })
      return
    }

    // Validar formato UUID básico
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(companyId)) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'El ID de la compañía no tiene un formato válido',
      })
      return
    }

    setLoading(true)
    try {
      await api.reservations.transfer(reservation.id, {
        transferredToCompanyId: companyId,
        transferNotes: transferNotes || undefined,
      })

      toast({
        title: 'Reserva transferida',
        description: 'La reserva fue transferida exitosamente a otra compañía',
      })

      onSuccess()
      onClose()
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'No se pudo transferir la reserva',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowRightLeft className="h-5 w-5" />
            Transferir Reserva
          </DialogTitle>
          <DialogDescription>
            Transfiere la reserva de {reservation?.client?.first_name}{' '}
            {reservation?.client?.last_name} a otra compañía
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Información de la reserva */}
          <div className="rounded-lg border p-4 space-y-2 bg-muted/50">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Cliente:</span>
              <span className="font-medium">
                {reservation?.client?.first_name} {reservation?.client?.last_name}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Viaje:</span>
              <span className="font-medium">
                {reservation?.trip_segment?.origin} → {reservation?.trip_segment?.destination}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Monto pagado:</span>
              <span className="font-medium">${reservation?.amount_paid?.toFixed(2)}</span>
            </div>
          </div>

          {/* ID de compañía destino */}
          <div className="space-y-2">
            <Label htmlFor="company-id">
              <Building2 className="inline mr-2 h-4 w-4" />
              ID de la Compañía Destino *
            </Label>
            <Input
              id="company-id"
              value={companyId}
              onChange={(e) => setCompanyId(e.target.value)}
              placeholder="ej: 123e4567-e89b-12d3-a456-426614174000"
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              El ID debe ser de una compañía registrada en Transroute o una empresa local configurada
            </p>
          </div>

          {/* Notas de transferencia */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notas de transferencia (opcional)</Label>
            <Textarea
              id="notes"
              value={transferNotes}
              onChange={(e) => setTransferNotes(e.target.value)}
              placeholder="Ej: Cliente prefirió cambiar de línea por horario..."
              rows={3}
            />
          </div>

          {/* Advertencias */}
          <div className="space-y-2">
            <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3 text-sm text-yellow-800">
              <AlertTriangle className="inline mr-2 h-4 w-4" />
              La reserva original se marcará como cancelada y los asientos se liberarán
            </div>
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800">
              <AlertTriangle className="inline mr-2 h-4 w-4" />
              La compañía destino deberá crear una nueva reserva para el cliente
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? 'Transfiriendo...' : 'Confirmar Transferencia'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

