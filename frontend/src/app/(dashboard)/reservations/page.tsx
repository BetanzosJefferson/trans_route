'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import { List, LayoutGrid, Search, RefreshCw, Plus } from 'lucide-react'
import { ReservationsListView } from '@/components/reservations/ReservationsListView'
import { ReservationsByTripView } from '@/components/reservations/ReservationsByTripView'
import { AddPaymentModal } from '@/components/reservations/AddPaymentModal'
import { CancelReservationModal } from '@/components/reservations/CancelReservationModal'
import { ModifyReservationModal } from '@/components/reservations/ModifyReservationModal'
import { TransferReservationModal } from '@/components/reservations/TransferReservationModal'
import { CheckInModal } from '@/components/reservations/CheckInModal'

type ViewMode = 'list' | 'grouped'

export default function ReservationsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  // Estados
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [loading, setLoading] = useState(true)
  const [reservations, setReservations] = useState<any[]>([])
  const [cashBalance, setCashBalance] = useState<number>(0)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  })

  // Filtros
  const [filters, setFilters] = useState({
    status: searchParams.get('status') || '',
    paymentStatus: searchParams.get('paymentStatus') || '',
    dateFrom: searchParams.get('dateFrom') || '',
    dateTo: searchParams.get('dateTo') || '',
    clientSearch: searchParams.get('clientSearch') || '',
    isNoShow: searchParams.get('isNoShow') === 'true' ? true : undefined,
    checkedIn: searchParams.get('checkedIn') === 'true' ? true : undefined,
  })

  // Modales
  const [selectedReservation, setSelectedReservation] = useState<any>(null)
  const [showCheckInModal, setShowCheckInModal] = useState(false)
  const [showAddPaymentModal, setShowAddPaymentModal] = useState(false)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [showModifyModal, setShowModifyModal] = useState(false)
  const [showTransferModal, setShowTransferModal] = useState(false)

  // Cargar saldo en caja
  useEffect(() => {
    loadCashBalance()
  }, [])

  // Cargar reservaciones
  useEffect(() => {
    loadReservations()
  }, [pagination.page, pagination.limit])

  const loadCashBalance = async () => {
    try {
      const data = await api.reservations.getCashBalance()
      setCashBalance(data.balance || 0)
    } catch (error: any) {
      console.error('Error cargando saldo:', error)
    }
  }

  const loadReservations = async () => {
    setLoading(true)
    try {
      const companyId = localStorage.getItem('company_id') || ''
      
      const queryFilters = {
        companyId,
        ...filters,
        page: pagination.page,
        limit: pagination.limit,
      }

      const data = await api.reservations.getAll(queryFilters)
      
      setReservations(data.data || [])
      setPagination({
        page: data.page || 1,
        limit: data.limit || 20,
        total: data.total || 0,
        totalPages: data.totalPages || 0,
      })
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudieron cargar las reservaciones',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (key: string, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const handleSearch = () => {
    setPagination((prev) => ({ ...prev, page: 1 }))
    loadReservations()
  }

  const handleReset = () => {
    setFilters({
      status: '',
      paymentStatus: '',
      dateFrom: '',
      dateTo: '',
      clientSearch: '',
      isNoShow: undefined,
      checkedIn: undefined,
    })
    setPagination((prev) => ({ ...prev, page: 1 }))
    setTimeout(loadReservations, 0)
  }

  // Funciones de manejo de modales
  const handleCheckIn = (reservation: any) => {
    setSelectedReservation(reservation)
    setShowCheckInModal(true)
  }

  const handleAddPayment = (reservation: any) => {
    setSelectedReservation(reservation)
    setShowAddPaymentModal(true)
  }

  const handleCancel = (reservation: any) => {
    setSelectedReservation(reservation)
    setShowCancelModal(true)
  }

  const handleModify = (reservation: any) => {
    setSelectedReservation(reservation)
    setShowModifyModal(true)
  }

  const handleTransfer = (reservation: any) => {
    setSelectedReservation(reservation)
    setShowTransferModal(true)
  }

  const handleDelete = async (reservation: any) => {
    if (!confirm('¿Estás seguro de eliminar esta reserva?')) return

    try {
      await api.reservations.delete(reservation.id)
      toast({
        title: 'Reserva eliminada',
        description: 'La reserva fue eliminada exitosamente',
      })
      loadReservations()
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'No se pudo eliminar la reserva',
      })
    }
  }

  const handleModalSuccess = () => {
    loadReservations()
    loadCashBalance()
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reservaciones</h1>
          <p className="text-muted-foreground">
            Gestiona todas las reservaciones de tu empresa
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Card className="px-4 py-2">
            <div className="text-sm text-muted-foreground">Saldo en caja</div>
            <div className="text-2xl font-bold">
              ${cashBalance.toFixed(2)}
            </div>
          </Card>
          <Button onClick={() => router.push('/new-reservation')}>
            <Plus className="mr-2 h-4 w-4" />
            Nueva Reserva
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Filtros</span>
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="mr-2 h-4 w-4" />
                Lista
              </Button>
              <Button
                variant={viewMode === 'grouped' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grouped')}
              >
                <LayoutGrid className="mr-2 h-4 w-4" />
                Por Viaje
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Estado</Label>
              <Select
                value={filters.status || 'all'}
                onValueChange={(value) => handleFilterChange('status', value === 'all' ? '' : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="pending">Pendiente</SelectItem>
                  <SelectItem value="confirmed">Confirmada</SelectItem>
                  <SelectItem value="cancelled">Cancelada</SelectItem>
                  <SelectItem value="completed">Completada</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Estado de Pago</Label>
              <Select
                value={filters.paymentStatus || 'all'}
                onValueChange={(value) => handleFilterChange('paymentStatus', value === 'all' ? '' : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="pending">Pendiente</SelectItem>
                  <SelectItem value="paid">Pagado</SelectItem>
                  <SelectItem value="refunded">Reembolsado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Fecha Desde</Label>
              <Input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Fecha Hasta</Label>
              <Input
                type="date"
                value={filters.dateTo}
                onChange={(e) => handleFilterChange('dateTo', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Buscar Cliente</Label>
              <Input
                placeholder="Nombre o email..."
                value={filters.clientSearch}
                onChange={(e) => handleFilterChange('clientSearch', e.target.value)}
              />
            </div>

            <div className="flex items-end gap-2">
              <Button onClick={handleSearch} className="flex-1">
                <Search className="mr-2 h-4 w-4" />
                Buscar
              </Button>
              <Button onClick={handleReset} variant="outline">
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contenido */}
      {loading ? (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Cargando reservaciones...</p>
          </CardContent>
        </Card>
      ) : reservations.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground">No se encontraron reservaciones</p>
            <Button
              className="mt-4"
              variant="outline"
              onClick={() => router.push('/new-reservation')}
            >
              Crear primera reserva
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Renderizar vista según el modo seleccionado */}
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Mostrando {reservations.length} de {pagination.total} reservaciones
            </p>
            
            {viewMode === 'list' ? (
              <ReservationsListView
                reservations={reservations}
                onCheckIn={handleCheckIn}
                onAddPayment={handleAddPayment}
                onCancel={handleCancel}
                onModify={handleModify}
                onTransfer={handleTransfer}
                onDelete={handleDelete}
                onRefresh={loadReservations}
              />
            ) : (
              <ReservationsByTripView
                reservations={reservations}
                onCheckIn={handleCheckIn}
                onAddPayment={handleAddPayment}
                onCancel={handleCancel}
                onModify={handleModify}
              />
            )}
          </div>

          {/* Paginación */}
          {pagination.totalPages > 1 && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <Button
                    variant="outline"
                    disabled={pagination.page === 1}
                    onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
                  >
                    Anterior
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Página {pagination.page} de {pagination.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    disabled={pagination.page === pagination.totalPages}
                    onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
                  >
                    Siguiente
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Modales */}
      {selectedReservation && (
        <>
          <CheckInModal
            open={showCheckInModal}
            onClose={() => setShowCheckInModal(false)}
            reservation={selectedReservation}
            onSuccess={handleModalSuccess}
          />
          <AddPaymentModal
            open={showAddPaymentModal}
            onClose={() => setShowAddPaymentModal(false)}
            reservation={selectedReservation}
            onSuccess={handleModalSuccess}
          />
          <CancelReservationModal
            open={showCancelModal}
            onClose={() => setShowCancelModal(false)}
            reservation={selectedReservation}
            onSuccess={handleModalSuccess}
          />
          <ModifyReservationModal
            open={showModifyModal}
            onClose={() => setShowModifyModal(false)}
            reservation={selectedReservation}
            onSuccess={handleModalSuccess}
          />
          <TransferReservationModal
            open={showTransferModal}
            onClose={() => setShowTransferModal(false)}
            reservation={selectedReservation}
            onSuccess={handleModalSuccess}
          />
        </>
      )}
    </div>
  )
}

