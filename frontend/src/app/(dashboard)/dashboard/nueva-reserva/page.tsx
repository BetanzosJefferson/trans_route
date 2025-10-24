'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Search, MapPin, Clock, Users as UsersIcon, CheckCircle, Loader2, ArrowRight } from 'lucide-react'
import { api } from '@/lib/api'
import { useToast } from '@/components/ui/use-toast'
import { getTodayLocalDateString, formatLocalTime12h } from '@/lib/date-utils'
import { cn } from '@/lib/utils'

interface TripSegment {
  id: string
  origin: string
  destination: string
  price: number
  available_seats: number
  departure_time: string
  arrival_time: string
  trip: any
}

export default function NuevaReservaPage() {
  const { toast } = useToast()
  const [companyId, setCompanyId] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState<'search' | 'client' | 'payment'>('search')

  // Estado de búsqueda
  const [origin, setOrigin] = useState('')
  const [destination, setDestination] = useState('')
  const [date, setDate] = useState(getTodayLocalDateString())
  const [availableTrips, setAvailableTrips] = useState<TripSegment[]>([])
  const [selectedTrip, setSelectedTrip] = useState<TripSegment | null>(null)

  // Estado del cliente
  const [clientPhone, setClientPhone] = useState('')
  const [clientName, setClientName] = useState('')
  const [clientEmail, setClientEmail] = useState('')
  const [seatsCount, setSeatsCount] = useState(1)
  const [clientId, setClientId] = useState<string | null>(null)

  // Estado de pago
  const [paymentType, setPaymentType] = useState<'pending' | 'partial' | 'paid'>('paid')
  const [amountPaid, setAmountPaid] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'transfer'>('cash')

  useEffect(() => {
    loadInitialData()
  }, [])

  const loadInitialData = async () => {
    try {
      const usersResponse = await api.users.getAll()
      const currentUser = usersResponse[0]
      if (currentUser?.company_id) {
        setCompanyId(currentUser.company_id)
        // Cargar viajes principales por defecto
        searchTrips(currentUser.company_id)
      }
    } catch (error: any) {
      console.error('Error loading initial data:', error)
    }
  }

  const searchTrips = async (company?: string) => {
    const idToUse = company || companyId
    if (!idToUse) return

    setLoading(true)
    try {
      const filters: any = {
        company_id: idToUse,
        main_trips_only: true,
      }

      if (origin) filters.origin = origin
      if (destination) filters.destination = destination
      if (date) {
        const startOfDay = new Date(date)
        startOfDay.setHours(0, 0, 0, 0)
        const endOfDay = new Date(date)
        endOfDay.setHours(23, 59, 59, 999)
        filters.date_from = startOfDay.toISOString()
        filters.date_to = endOfDay.toISOString()
      }

      const data = await api.reservations.searchAvailableTrips(filters)
      setAvailableTrips(data || [])
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Error al buscar viajes',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSelectTrip = (trip: TripSegment) => {
    setSelectedTrip(trip)
    setStep('client')
  }

  const handleSearchClient = async () => {
    if (!clientPhone) return

    try {
      const data = await api.clients.getByPhone(clientPhone)
      if (data) {
        setClientName(`${data.first_name} ${data.last_name}`)
        setClientEmail(data.email || '')
        setClientId(data.id)
        toast({
          title: 'Cliente encontrado',
          description: 'Datos cargados automáticamente',
        })
      }
    } catch (error) {
      // Cliente no existe, permitir crearlo
      console.log('Cliente no encontrado, crear nuevo')
    }
  }

  const handleCreateClient = async () => {
    if (!clientPhone || !clientName) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Teléfono y nombre son requeridos',
      })
      return null
    }

    const [firstName, ...lastNameParts] = clientName.trim().split(' ')
    const lastName = lastNameParts.join(' ') || firstName

    try {
      const data = await api.clients.create({
        first_name: firstName,
        last_name: lastName,
        phone: clientPhone,
        email: clientEmail || undefined,
        company_id: companyId,
      })
      setClientId(data.id)
      return data.id
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Error al crear cliente',
      })
      return null
    }
  }

  const handleConfirmReservation = async () => {
    if (!selectedTrip || !companyId) return

    setLoading(true)
    try {
      // Si no hay clientId, crear cliente primero
      let finalClientId = clientId
      if (!finalClientId) {
        finalClientId = await handleCreateClient()
        if (!finalClientId) return
      }

      const totalAmount = selectedTrip.price * seatsCount
      const finalAmountPaid =
        paymentType === 'paid'
          ? totalAmount
          : paymentType === 'partial'
          ? parseFloat(amountPaid) || 0
          : 0

      const reservationData = {
        trip_segment_id: selectedTrip.id,
        client_id: finalClientId,
        seats_reserved: seatsCount,
        total_amount: totalAmount,
        payment_status: paymentType,
        amount_paid: finalAmountPaid,
        payment_method: paymentType !== 'pending' ? paymentMethod : undefined,
      }

      await api.reservations.create(reservationData)

      toast({
        title: '✅ Reserva Exitosa',
        description: `Reserva confirmada para ${clientName}`,
      })

      // Reset form
      setStep('search')
      setSelectedTrip(null)
      setClientPhone('')
      setClientName('')
      setClientEmail('')
      setClientId(null)
      setSeatsCount(1)
      setPaymentType('paid')
      setAmountPaid('')

      // Recargar viajes
      searchTrips()
    } catch (error: any) {
      console.error('Error creating reservation:', error)
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.response?.data?.message || 'Error al crear reserva',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="h-full flex flex-col p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Nueva Reserva</h1>
        <p className="text-muted-foreground mt-2">
          Sistema rápido de venta de boletos
        </p>
      </div>

      {/* Progress Indicator */}
      <div className="flex items-center gap-2 mb-6">
        <div
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-lg',
            step === 'search' && 'bg-primary text-primary-foreground'
          )}
        >
          <span className="text-sm font-semibold">1. Buscar Viaje</span>
        </div>
        <ArrowRight className="h-4 w-4 text-muted-foreground" />
        <div
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-lg',
            step === 'client' && 'bg-primary text-primary-foreground'
          )}
        >
          <span className="text-sm font-semibold">2. Cliente</span>
        </div>
        <ArrowRight className="h-4 w-4 text-muted-foreground" />
        <div
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-lg',
            step === 'payment' && 'bg-primary text-primary-foreground'
          )}
        >
          <span className="text-sm font-semibold">3. Pago</span>
        </div>
      </div>

      {/* Step 1: Búsqueda */}
      {step === 'search' && (
        <div className="space-y-6 flex-1 overflow-auto">
          {/* Filtros de búsqueda */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Buscar Viajes Disponibles</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="origin">Origen</Label>
                <Input
                  id="origin"
                  placeholder="Ciudad origen"
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="destination">Destino</Label>
                <Input
                  id="destination"
                  placeholder="Ciudad destino"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="date">Fecha</Label>
                <Input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  min={getTodayLocalDateString()}
                />
              </div>
              <div className="flex items-end">
                <Button onClick={() => searchTrips()} className="w-full">
                  <Search className="mr-2 h-4 w-4" />
                  Buscar
                </Button>
              </div>
            </div>
          </Card>

          {/* Resultados */}
          <div>
            <h3 className="text-lg font-semibold mb-4">
              {availableTrips.length} viajes disponibles
            </h3>

            {loading ? (
              <div className="flex h-full items-center justify-center py-12">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
                  <p className="text-muted-foreground">Buscando viajes...</p>
                </div>
              </div>
            ) : availableTrips.length === 0 ? (
              <Card className="p-12 text-center">
                <p className="text-muted-foreground">
                  No hay viajes disponibles con los filtros seleccionados
                </p>
              </Card>
            ) : (
              <div className="space-y-3">
                {availableTrips.map((trip) => (
                  <Card
                    key={trip.id}
                    className="p-5 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => handleSelectTrip(trip)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span className="font-semibold">
                            {trip.origin.split('|')[0]} → {trip.destination.split('|')[0]}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatLocalTime12h(trip.departure_time)}
                          </div>
                          <div className="flex items-center gap-1">
                            <UsersIcon className="h-3 w-3" />
                            {trip.available_seats} asientos
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-success">
                          ${trip.price}
                        </div>
                        <Badge
                          variant={
                            trip.available_seats > 10
                              ? 'default'
                              : trip.available_seats > 3
                              ? 'secondary'
                              : 'destructive'
                          }
                        >
                          {trip.available_seats > 10
                            ? 'Disponible'
                            : trip.available_seats > 3
                            ? 'Pocos asientos'
                            : 'Últimos asientos'}
                        </Badge>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Step 2: Cliente */}
      {step === 'client' && selectedTrip && (
        <div className="space-y-6 flex-1 overflow-auto">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Datos del Cliente</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone">Teléfono *</Label>
                <div className="flex gap-2">
                  <Input
                    id="phone"
                    placeholder="10 dígitos"
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    onBlur={handleSearchClient}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Buscaremos si el cliente ya existe
                </p>
              </div>
              <div>
                <Label htmlFor="name">Nombre Completo *</Label>
                <Input
                  id="name"
                  placeholder="Nombre del cliente"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="email">Email (opcional)</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="correo@ejemplo.com"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="seats">Asientos</Label>
                <Input
                  id="seats"
                  type="number"
                  min="1"
                  max={selectedTrip.available_seats}
                  value={seatsCount}
                  onChange={(e) => setSeatsCount(parseInt(e.target.value) || 1)}
                />
              </div>
            </div>
          </Card>

          <div className="flex gap-4">
            <Button variant="outline" onClick={() => setStep('search')} className="flex-1">
              Atrás
            </Button>
            <Button onClick={() => setStep('payment')} className="flex-1" disabled={!clientPhone || !clientName}>
              Continuar a Pago
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Pago */}
      {step === 'payment' && selectedTrip && (
        <div className="space-y-6 flex-1 overflow-auto">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Resumen</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Ruta:</span>
                <span className="font-semibold">
                  {selectedTrip.origin.split('|')[0]} → {selectedTrip.destination.split('|')[0]}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Hora:</span>
                <span>{formatLocalTime12h(selectedTrip.departure_time)}</span>
              </div>
              <div className="flex justify-between">
                <span>Asientos:</span>
                <span>{seatsCount}</span>
              </div>
              <div className="flex justify-between">
                <span>Precio unitario:</span>
                <span>${selectedTrip.price}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>Total:</span>
                <span className="text-success">${(selectedTrip.price * seatsCount).toFixed(2)}</span>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Método de Pago</h3>
            <RadioGroup value={paymentType} onValueChange={(v: any) => setPaymentType(v)}>
              <div className="space-y-4">
                {/* Pago completo */}
                <label
                  className={cn(
                    'flex items-center gap-4 p-4 border-2 rounded-lg cursor-pointer',
                    paymentType === 'paid' && 'border-primary bg-primary/5'
                  )}
                >
                  <RadioGroupItem value="paid" />
                  <div className="flex-1">
                    <div className="font-semibold">Pago Completo</div>
                    <div className="text-sm text-muted-foreground">
                      Cliente paga ${(selectedTrip.price * seatsCount).toFixed(2)} ahora
                    </div>
                  </div>
                  <CheckCircle
                    className={cn('h-6 w-6', paymentType === 'paid' ? 'text-success' : 'text-muted')}
                  />
                </label>

                {/* Anticipo */}
                <label
                  className={cn(
                    'flex items-center gap-4 p-4 border-2 rounded-lg cursor-pointer',
                    paymentType === 'partial' && 'border-primary bg-primary/5'
                  )}
                >
                  <RadioGroupItem value="partial" />
                  <div className="flex-1">
                    <div className="font-semibold">Anticipo</div>
                    <div className="text-sm text-muted-foreground">Cliente paga ahora, resto al abordar</div>
                    {paymentType === 'partial' && (
                      <Input
                        type="number"
                        placeholder="Cantidad de anticipo"
                        value={amountPaid}
                        onChange={(e) => setAmountPaid(e.target.value)}
                        className="mt-2"
                        max={selectedTrip.price * seatsCount}
                      />
                    )}
                  </div>
                </label>

                {/* Pendiente */}
                <label
                  className={cn(
                    'flex items-center gap-4 p-4 border-2 rounded-lg cursor-pointer',
                    paymentType === 'pending' && 'border-primary bg-primary/5'
                  )}
                >
                  <RadioGroupItem value="pending" />
                  <div className="flex-1">
                    <div className="font-semibold">Pago Pendiente</div>
                    <div className="text-sm text-muted-foreground">Cliente pagará al abordar</div>
                  </div>
                  <Clock className={cn('h-6 w-6', paymentType === 'pending' ? 'text-warning' : 'text-muted')} />
                </label>
              </div>
            </RadioGroup>

            {(paymentType === 'paid' || paymentType === 'partial') && (
              <div className="mt-4">
                <Label>Método de Pago</Label>
                <Select value={paymentMethod} onValueChange={(v: any) => setPaymentMethod(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Efectivo</SelectItem>
                    <SelectItem value="card">Tarjeta</SelectItem>
                    <SelectItem value="transfer">Transferencia</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </Card>

          <div className="flex gap-4">
            <Button variant="outline" onClick={() => setStep('client')} className="flex-1">
              Atrás
            </Button>
            <Button onClick={handleConfirmReservation} className="flex-1" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirmar Reserva
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

