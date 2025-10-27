'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  MoreVertical,
  Calendar,
  User,
  MapPin,
  DollarSign,
  CheckCircle,
  XCircle,
  Clock,
  Plus,
  Edit,
  Trash2,
  ArrowRightLeft,
} from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface ReservationsListViewProps {
  reservations: any[]
  onCheckIn: (reservation: any) => void
  onAddPayment: (reservation: any) => void
  onCancel: (reservation: any) => void
  onModify: (reservation: any) => void
  onTransfer: (reservation: any) => void
  onDelete?: (reservation: any) => void
  onRefresh: () => void
}

export function ReservationsListView({
  reservations,
  onCheckIn,
  onAddPayment,
  onCancel,
  onModify,
  onTransfer,
  onDelete,
  onRefresh,
}: ReservationsListViewProps) {
  const getStatusBadge = (status: string) => {
    const variants: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      pending: { label: 'Pendiente', variant: 'secondary' },
      confirmed: { label: 'Confirmada', variant: 'default' },
      cancelled: { label: 'Cancelada', variant: 'destructive' },
      completed: { label: 'Completada', variant: 'outline' },
    }
    const config = variants[status] || { label: status, variant: 'outline' }
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const getPaymentStatusBadge = (status: string) => {
    const variants: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      pending: { label: 'Pendiente', variant: 'secondary' },
      paid: { label: 'Pagado', variant: 'default' },
      refunded: { label: 'Reembolsado', variant: 'destructive' },
    }
    const config = variants[status] || { label: status, variant: 'outline' }
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const getPaymentMethodsIcons = (methods: string[]) => {
    if (!methods || methods.length === 0) return null
    
    const uniqueMethods = [...new Set(methods)]
    
    return (
      <div className="flex items-center gap-1">
        {uniqueMethods.map((method) => {
          const icons: Record<string, string> = {
            cash: '💵',
            transfer: '🏦',
            card: '💳',
          }
          return (
            <span key={method} title={method}>
              {icons[method] || '💰'}
            </span>
          )
        })}
      </div>
    )
  }

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "d 'de' MMMM, yyyy HH:mm", { locale: es })
    } catch {
      return dateString
    }
  }

  return (
    <div className="space-y-4">
      {reservations.map((reservation) => {
        const amountPaid = reservation.amount_paid || 0
        const totalAmount = reservation.total_amount || 0
        const remaining = totalAmount - amountPaid
        const isPaid = amountPaid >= totalAmount
        const isPartial = amountPaid > 0 && amountPaid < totalAmount

        return (
          <Card key={reservation.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-3">
                  {/* Header */}
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      {getStatusBadge(reservation.status)}
                      {getPaymentStatusBadge(reservation.payment_status)}
                      {reservation.is_no_show && (
                        <Badge variant="destructive">No Show</Badge>
                      )}
                      {reservation.checked_in_at && (
                        <Badge variant="outline" className="bg-green-50">
                          <CheckCircle className="mr-1 h-3 w-3" />
                          Check-in
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Cliente */}
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">
                      {reservation.client?.first_name} {reservation.client?.last_name}
                    </span>
                    {reservation.client?.phone && (
                      <span className="text-sm text-muted-foreground">
                        • {reservation.client.phone}
                      </span>
                    )}
                  </div>

                  {/* Viaje */}
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {reservation.trip_segment?.origin} → {reservation.trip_segment?.destination}
                    </span>
                  </div>

                  {/* Fecha y hora */}
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {formatDate(reservation.trip_segment?.departure_time)}
                    </span>
                  </div>

                  {/* Pago */}
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <div className="text-sm">
                        <span className="font-medium">${amountPaid.toFixed(2)}</span>
                        <span className="text-muted-foreground"> / ${totalAmount.toFixed(2)}</span>
                      </div>
                    </div>
                    {getPaymentMethodsIcons(reservation.payment_methods)}
                    {isPartial && (
                      <Badge variant="outline" className="bg-yellow-50">
                        Parcial: ${remaining.toFixed(2)} pendiente
                      </Badge>
                    )}
                  </div>

                  {/* Asientos */}
                  <div className="text-sm text-muted-foreground">
                    {reservation.seats_reserved} asiento{reservation.seats_reserved > 1 ? 's' : ''}
                  </div>
                </div>

                {/* Acciones */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    {!reservation.checked_in_at && reservation.status === 'confirmed' && (
                      <DropdownMenuItem onClick={() => onCheckIn(reservation)}>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Check-in
                      </DropdownMenuItem>
                    )}
                    {!isPaid && reservation.status !== 'cancelled' && (
                      <DropdownMenuItem onClick={() => onAddPayment(reservation)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Agregar Pago
                      </DropdownMenuItem>
                    )}
                    {reservation.status !== 'cancelled' && (
                      <>
                        <DropdownMenuItem onClick={() => onModify(reservation)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Modificar Viaje
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onTransfer(reservation)}>
                          <ArrowRightLeft className="mr-2 h-4 w-4" />
                          Transferir
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onCancel(reservation)}
                          className="text-red-600"
                        >
                          <XCircle className="mr-2 h-4 w-4" />
                          Cancelar
                        </DropdownMenuItem>
                      </>
                    )}
                    {onDelete && (
                      <DropdownMenuItem
                        onClick={() => onDelete(reservation)}
                        className="text-red-600"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Eliminar
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Notas */}
              {reservation.notes && (
                <div className="mt-3 pt-3 border-t">
                  <p className="text-sm text-muted-foreground">
                    <Clock className="inline h-3 w-3 mr-1" />
                    Notas: {reservation.notes}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

