'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus, Search, Calendar, MapPin, Users, Clock, Edit, Trash2 } from 'lucide-react'
import { PublishTripDialog } from '@/components/trips/publish-trip-dialog'
import { api } from '@/lib/api'
import { useToast } from '@/components/ui/use-toast'
import { formatLocalTime, formatLocalDateFull } from '@/lib/date-utils'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface Trip {
  id: string
  route_id: string
  company_id: string
  departure_datetime: string
  arrival_datetime: string | null
  capacity: number
  visibility: string
  route: {
    id: string
    name: string
    origin: string
    destination: string
  }
  vehicle: any
  driver: any
}

export default function TripsPage() {
  const { toast } = useToast()
  const [trips, setTrips] = useState<Trip[]>([])
  const [filteredTrips, setFilteredTrips] = useState<Trip[]>([])
  const [loading, setLoading] = useState(true)
  const [companyId, setCompanyId] = useState<string>('')
  const [isPublishDialogOpen, setIsPublishDialogOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterVisibility, setFilterVisibility] = useState<string>('all')

  useEffect(() => {
    loadInitialData()
  }, [])

  const loadInitialData = async () => {
    try {
      setLoading(true)
      
      // Get current user to get company_id
      const usersResponse = await api.users.getAll()
      const currentUser = usersResponse[0] // Assuming first user is current logged in user
      
      if (currentUser?.company_id) {
        setCompanyId(currentUser.company_id)
        await loadTrips(currentUser.company_id)
      }
    } catch (error: any) {
      console.error('Error loading initial data:', error)
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudieron cargar los datos',
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    applyFilters()
  }, [trips, searchTerm, filterVisibility])

  const loadTrips = async (companyIdParam?: string) => {
    const idToUse = companyIdParam || companyId
    if (!idToUse) return

    try {
      const data = await api.trips.getAll(idToUse)
      setTrips(data || [])
    } catch (error: any) {
      console.error('Error loading trips:', error)
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Error al cargar viajes',
      })
    }
  }

  const applyFilters = () => {
    let filtered = [...trips]

    // Filtrar por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(
        (trip) =>
          trip.route?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          trip.route?.origin?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          trip.route?.destination?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filtrar por visibilidad
    if (filterVisibility && filterVisibility !== 'all') {
      filtered = filtered.filter((trip) => trip.visibility === filterVisibility)
    }

    setFilteredTrips(filtered)
  }

  const handlePublishSuccess = () => {
    setIsPublishDialogOpen(false)
    loadTrips()
    toast({
      title: 'Éxito',
      description: 'Viaje(s) publicado(s) exitosamente',
    })
  }

  const handleDeleteTrip = async (tripId: string) => {
    if (!confirm('¿Estás seguro de eliminar este viaje?')) return

    try {
      await api.trips.delete(tripId)
      toast({
        title: 'Éxito',
        description: 'Viaje eliminado',
      })
      loadTrips()
    } catch (error: any) {
      console.error('Error deleting trip:', error)
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Error al eliminar viaje',
      })
    }
  }

  const getVisibilityBadgeVariant = (visibility: string) => {
    switch (visibility) {
      case 'published':
        return 'default'
      case 'draft':
        return 'secondary'
      case 'cancelled':
        return 'destructive'
      default:
        return 'outline'
    }
  }

  const getVisibilityLabel = (visibility: string) => {
    switch (visibility) {
      case 'published':
        return 'Publicado'
      case 'draft':
        return 'Borrador'
      case 'cancelled':
        return 'Cancelado'
      default:
        return visibility
    }
  }

  const groupTripsByDate = (trips: Trip[]) => {
    const grouped: Record<string, Trip[]> = {}

    trips.forEach((trip) => {
      const date = format(new Date(trip.departure_datetime), 'yyyy-MM-dd')
      if (!grouped[date]) {
        grouped[date] = []
      }
      grouped[date].push(trip)
    })

    return grouped
  }

  const groupedTrips = groupTripsByDate(filteredTrips)
  const sortedDates = Object.keys(groupedTrips).sort()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Cargando viajes...</p>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Viajes</h1>
          <p className="text-sm text-muted-foreground">
            Gestiona tus viajes publicados
          </p>
        </div>
        <Button onClick={() => setIsPublishDialogOpen(true)} size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Publicar Viaje
        </Button>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por ruta, origen o destino..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={filterVisibility} onValueChange={setFilterVisibility}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="published">Publicados</SelectItem>
            <SelectItem value="draft">Borradores</SelectItem>
            <SelectItem value="cancelled">Cancelados</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Lista de viajes */}
      <div className="flex-1 overflow-auto space-y-6">
        {sortedDates.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No hay viajes</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Comienza publicando tu primer viaje
            </p>
            <Button onClick={() => setIsPublishDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Publicar Viaje
            </Button>
          </div>
        ) : (
          sortedDates.map((date) => (
            <div key={date} className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {formatLocalDateFull(date)}
              </h3>
              <div className="space-y-3">
                {groupedTrips[date].map((trip) => (
                  <Card key={trip.id} className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h4 className="font-semibold text-base mb-1">
                          {trip.route?.name || 'Sin nombre'}
                        </h4>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          <span className="line-clamp-1">
                            {trip.route?.origin?.split('|')[0] || 'N/A'} →{' '}
                            {trip.route?.destination?.split('|')[0] || 'N/A'}
                          </span>
                        </div>
                      </div>
                      <Badge variant={getVisibilityBadgeVariant(trip.visibility)}>
                        {getVisibilityLabel(trip.visibility)}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                      <div className="flex items-center gap-2">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <span>
                          {formatLocalTime(trip.departure_datetime)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-3 w-3 text-muted-foreground" />
                        <span>{trip.capacity} asientos</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() =>
                          toast({
                            title: 'Próximamente',
                            description: 'Función de editar próximamente',
                          })
                        }
                      >
                        <Edit className="mr-1 h-3 w-3" />
                        Editar
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteTrip(trip.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Dialog de publicación */}
      {companyId && (
        <PublishTripDialog
          open={isPublishDialogOpen}
          onOpenChange={setIsPublishDialogOpen}
          onSuccess={handlePublishSuccess}
          companyId={companyId}
        />
      )}
    </div>
  )
}

