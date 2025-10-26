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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/components/ui/use-toast'
import { api } from '@/lib/api'
import { AlertTriangle, DollarSign, Wallet } from 'lucide-react'

interface CancelReservationModalProps {
  open: boolean
  onClose: () => void
  reservation: any
  onSuccess: () => void
}

export function CancelReservationModal({
  open,
  onClose,
  reservation,
  onSuccess,
}: CancelReservationModalProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [loadingBalance, setLoadingBalance] = useState(false)
  const [cashBalance, setCashBalance] = useState(0)
  const [refundType, setRefundType] = useState<'with' | 'without'>('without')
  const [refundAmount, setRefundAmount] = useState('')
  const [cancellationReason, setCancellationReason] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'transfer' | 'card'>('cash')

  const amountPaid = reservation?.amount_paid || 0

  useEffect(() => {
    if (open && refundType === 'with') {
      loadCashBalance()
    }
  }, [open, refundType])

  const loadCashBalance = async () => {
    setLoadingBalance(true)
    try {
      const data = await api.reservations.getCashBalance()
      setCashBalance(data.balance || 0)
    } catch (error) {
      console.error('Error cargando saldo:', error)
    } finally {
      setLoadingBalance(false)
    }
  }

  const handleSubmit = async () => {
    if (!cancellationReason.trim()) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Ingresa una razón para la cancelación',
      })
      return
    }

    const refund = parseFloat(refundAmount) || 0

    if (refundType === 'with') {
      if (refund <= 0) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Ingresa un monto de reembolso válido',
        })
        return
      }

      if (refund > amountPaid) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: `El reembolso no puede exceder el monto pagado ($${amountPaid.toFixed(2)})`,
        })
        return
      }

      if (refund > cashBalance) {
        toast({
          variant: 'destructive',
          title: 'Saldo insuficiente',
          description: `No tienes suficiente saldo en caja. Disponible: $${cashBalance.toFixed(2)}`,
        })
        return
      }
    }

    setLoading(true)
    try {
      await api.reservations.cancelWithRefund(reservation.id, {
        refundAmount: refund,
        cancellationReason,
        paymentMethod,
      })

      toast({
        title: 'Reserva cancelada',
        description: refund > 0
          ? `Se reembolsó $${refund.toFixed(2)} al cliente`
          : 'La reserva fue cancelada sin reembolso',
      })

      onSuccess()
      onClose()
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'No se pudo cancelar la reserva',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Cancelar Reserva
          </DialogTitle>
          <DialogDescription>
            Cancela la reserva de {reservation?.client?.first_name}{' '}
            {reservation?.client?.last_name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Información de la reserva */}
          <div className="rounded-lg border p-4 space-y-2 bg-muted/50">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Total de la reserva:</span>
              <span className="font-medium">${reservation?.total_amount?.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Monto pagado:</span>
              <span className="font-medium">${amountPaid.toFixed(2)}</span>
            </div>
          </div>

          {/* Tipo de cancelación */}
          <div className="space-y-3">
            <Label>Tipo de cancelación</Label>
            <RadioGroup value={refundType} onValueChange={(value: any) => setRefundType(value)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="without" id="without" />
                <Label htmlFor="without" className="cursor-pointer">
                  Sin reembolso (solo liberar asientos)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="with" id="with" disabled={amountPaid === 0} />
                <Label
                  htmlFor="with"
                  className={amountPaid === 0 ? 'text-muted-foreground' : 'cursor-pointer'}
                >
                  Con reembolso al cliente
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Opciones de reembolso */}
          {refundType === 'with' && (
            <div className="space-y-4 p-4 border rounded-lg bg-blue-50">
              {/* Saldo en caja */}
              <div className="flex items-center justify-between p-3 rounded-md bg-white">
                <div className="flex items-center gap-2">
                  <Wallet className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Tu saldo en caja:</span>
                </div>
                {loadingBalance ? (
                  <span className="text-sm text-muted-foreground">Cargando...</span>
                ) : (
                  <span className="text-lg font-bold">${cashBalance.toFixed(2)}</span>
                )}
              </div>

              {/* Monto de reembolso */}
              <div className="space-y-2">
                <Label htmlFor="refund-amount">Monto a reembolsar</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="refund-amount"
                    type="number"
                    step="0.01"
                    min="0"
                    max={Math.min(amountPaid, cashBalance)}
                    value={refundAmount}
                    onChange={(e) => setRefundAmount(e.target.value)}
                    placeholder="0.00"
                    className="pl-9"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setRefundAmount((amountPaid / 2).toFixed(2))}
                    disabled={cashBalance < amountPaid / 2}
                  >
                    50%
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setRefundAmount(Math.min(amountPaid, cashBalance).toFixed(2))}
                  >
                    Máximo posible
                  </Button>
                </div>
              </div>

              {/* Método de reembolso */}
              <div className="space-y-2">
                <Label htmlFor="payment-method">Método de reembolso</Label>
                <Select
                  value={paymentMethod}
                  onValueChange={(value: any) => setPaymentMethod(value)}
                >
                  <SelectTrigger id="payment-method">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">💵 Efectivo</SelectItem>
                    <SelectItem value="transfer">🏦 Transferencia</SelectItem>
                    <SelectItem value="card">💳 Tarjeta</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Advertencia de saldo */}
              {parseFloat(refundAmount) > cashBalance && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
                  <AlertTriangle className="inline mr-2 h-4 w-4" />
                  El monto de reembolso excede tu saldo disponible en caja
                </div>
              )}
            </div>
          )}

          {/* Razón de cancelación */}
          <div className="space-y-2">
            <Label htmlFor="reason">Razón de la cancelación *</Label>
            <Textarea
              id="reason"
              value={cancellationReason}
              onChange={(e) => setCancellationReason(e.target.value)}
              placeholder="Ej: Cliente solicitó cancelación por enfermedad..."
              rows={3}
              required
            />
          </div>

          {/* Advertencia final */}
          <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3 text-sm text-yellow-800">
            <AlertTriangle className="inline mr-2 h-4 w-4" />
            Esta acción no se puede deshacer. Los asientos se liberarán automáticamente.
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button variant="destructive" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Cancelando...' : 'Confirmar Cancelación'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

