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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/components/ui/use-toast'
import { api } from '@/lib/api'
import { DollarSign, CreditCard } from 'lucide-react'

interface AddPaymentModalProps {
  open: boolean
  onClose: () => void
  reservation: any
  onSuccess: () => void
}

export function AddPaymentModal({
  open,
  onClose,
  reservation,
  onSuccess,
}: AddPaymentModalProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [amount, setAmount] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'transfer' | 'card'>('cash')

  const amountPaid = reservation?.amount_paid || 0
  const totalAmount = reservation?.total_amount || 0
  const remaining = totalAmount - amountPaid

  const handleSubmit = async () => {
    const paymentAmount = parseFloat(amount)

    if (!paymentAmount || paymentAmount <= 0) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Ingresa un monto válido',
      })
      return
    }

    if (paymentAmount > remaining) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: `El monto excede el saldo pendiente ($${remaining.toFixed(2)})`,
      })
      return
    }

    setLoading(true)
    try {
      await api.reservations.addPayment(reservation.id, {
        amount: paymentAmount,
        paymentMethod,
      })

      toast({
        title: 'Pago agregado',
        description: `Se agregó el pago de $${paymentAmount.toFixed(2)} exitosamente`,
      })

      onSuccess()
      onClose()
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'No se pudo agregar el pago',
      })
    } finally {
      setLoading(false)
    }
  }

  const getPaymentMethodIcon = (method: string) => {
    const icons: Record<string, string> = {
      cash: '💵',
      transfer: '🏦',
      card: '💳',
    }
    return icons[method] || '💰'
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Agregar Pago</DialogTitle>
          <DialogDescription>
            Agrega un pago a la reserva de {reservation?.client?.first_name}{' '}
            {reservation?.client?.last_name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Resumen de pagos existentes */}
          <div className="rounded-lg border p-4 space-y-2 bg-muted/50">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Total a pagar:</span>
              <span className="font-medium">${totalAmount.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Ya pagado:</span>
              <div className="flex items-center gap-2">
                <span className="font-medium">${amountPaid.toFixed(2)}</span>
                {reservation?.payment_methods && reservation.payment_methods.length > 0 && (
                  <div className="flex gap-1">
                    {reservation.payment_methods.map((method: string, idx: number) => (
                      <span key={idx} title={method}>
                        {getPaymentMethodIcon(method)}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center justify-between text-sm pt-2 border-t">
              <span className="font-medium">Saldo pendiente:</span>
              <span className="font-bold text-lg">${remaining.toFixed(2)}</span>
            </div>
          </div>

          {/* Formulario de pago */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Monto a pagar</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  max={remaining}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="pl-9"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setAmount((remaining / 2).toFixed(2))}
                >
                  50%
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setAmount(remaining.toFixed(2))}
                >
                  Saldo completo
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="payment-method">Método de pago</Label>
              <Select
                value={paymentMethod}
                onValueChange={(value: any) => setPaymentMethod(value)}
              >
                <SelectTrigger id="payment-method">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">
                    <div className="flex items-center gap-2">
                      <span>💵</span>
                      <span>Efectivo</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="transfer">
                    <div className="flex items-center gap-2">
                      <span>🏦</span>
                      <span>Transferencia</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="card">
                    <div className="flex items-center gap-2">
                      <span>💳</span>
                      <span>Tarjeta</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Advertencia si es pago mixto */}
          {amountPaid > 0 && (
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800">
              <CreditCard className="inline mr-2 h-4 w-4" />
              Esta reserva tendrá pagos mixtos (múltiples métodos de pago)
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? 'Procesando...' : 'Agregar Pago'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

