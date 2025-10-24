'use client'

import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, MapPin, Navigation, Building2 } from 'lucide-react'

// Helper function to parse location string
function parseLocation(value: string) {
  const parts = value.split('|')
  const location = parts[0] || ''
  const stopName = parts[1] || 'Sin nombre'
  const locationParts = location.split(', ')
  const city = locationParts[0] || ''
  const state = locationParts[1] || ''
  return { location, stopName, city, state }
}
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/components/ui/use-toast'
import { api } from '@/lib/api'
import { RouteFormDialog } from '@/components/routes/route-form-dialog'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface Route {
  id: string
  name: string
  origin: string
  destination: string
  stops: string[]
  distance_km?: number
  estimated_duration_minutes?: number
  is_active: boolean
  created_at: string
}

export default function RoutesPage() {
  const { toast } = useToast()
  const [routes, setRoutes] = useState<Route[]>([])
  const [loading, setLoading] = useState(true)
  const [companyId, setCompanyId] = useState<string>('')
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingRoute, setEditingRoute] = useState<Route | undefined>(undefined)
  const [deletingRoute, setDeletingRoute] = useState<Route | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  useEffect(() => {
    loadUserAndRoutes()
  }, [])

  const loadUserAndRoutes = async () => {
    try {
      setLoading(true)
      
      // Get current user to get company_id
      const usersResponse = await api.users.getAll()
      const currentUser = usersResponse[0] // Assuming first user is current logged in user
      
      if (currentUser?.company_id) {
        setCompanyId(currentUser.company_id)
        await loadRoutes(currentUser.company_id)
      }
    } catch (error: any) {
      console.error('Error loading data:', error)
      toast({
        title: 'Error',
        description: 'Error al cargar las rutas',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const loadRoutes = async (companyId: string) => {
    try {
      const data = await api.routes.getAll(companyId)
      setRoutes(data || [])
    } catch (error: any) {
      console.error('Error loading routes:', error)
      throw error
    }
  }

  const handleCreateRoute = () => {
    setEditingRoute(undefined)
    setIsFormOpen(true)
  }

  const handleEditRoute = (route: Route) => {
    setEditingRoute(route)
    setIsFormOpen(true)
  }

  const handleDeleteRoute = async () => {
    if (!deletingRoute) return

    setDeleteLoading(true)
    try {
      await api.routes.delete(deletingRoute.id)
      toast({
        title: 'Ruta eliminada',
        description: 'La ruta ha sido eliminada exitosamente',
      })
      setDeletingRoute(null)
      await loadRoutes(companyId)
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Error al eliminar la ruta',
        variant: 'destructive',
      })
    } finally {
      setDeleteLoading(false)
    }
  }

  const handleFormSuccess = async () => {
    await loadRoutes(companyId)
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando rutas...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Rutas</h1>
          <p className="text-muted-foreground">
            Gestiona las rutas de tu empresa
          </p>
        </div>
        <Button onClick={handleCreateRoute}>
          <Plus className="mr-2 h-4 w-4" />
          Crear ruta
        </Button>
      </div>

      {routes.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Navigation className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No hay rutas</h3>
            <p className="text-muted-foreground text-center mb-6 max-w-md">
              Comienza creando tu primera ruta. Las rutas te permitirán organizar
              tus viajes y gestionar mejor tus operaciones.
            </p>
            <Button onClick={handleCreateRoute}>
              <Plus className="mr-2 h-4 w-4" />
              Crear primera ruta
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {routes.map((route) => {
            const origin = parseLocation(route.origin)
            const destination = parseLocation(route.destination)
            
            return (
              <Card key={route.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1">
                      <CardTitle className="text-lg">{route.name}</CardTitle>
                      <CardDescription className="flex items-center gap-1 text-xs">
                        <MapPin className="h-3 w-3" />
                        {origin.city} → {destination.city}
                      </CardDescription>
                    </div>
                    <Badge variant={route.is_active ? 'default' : 'secondary'}>
                      {route.is_active ? 'Activa' : 'Inactiva'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <p className="text-xs font-medium text-muted-foreground">Origen</p>
                      <div className="text-sm">
                        <div className="flex items-start gap-1.5">
                          <Building2 className="h-3.5 w-3.5 text-muted-foreground mt-0.5" />
                          <div>
                            <p className="font-medium">{origin.stopName}</p>
                            <p className="text-xs text-muted-foreground">{origin.city}, {origin.state}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-1.5">
                      <p className="text-xs font-medium text-muted-foreground">Destino</p>
                      <div className="text-sm">
                        <div className="flex items-start gap-1.5">
                          <Building2 className="h-3.5 w-3.5 text-muted-foreground mt-0.5" />
                          <div>
                            <p className="font-medium">{destination.stopName}</p>
                            <p className="text-xs text-muted-foreground">{destination.city}, {destination.state}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {route.stops && route.stops.length > 0 && (
                      <div className="space-y-1.5">
                        <p className="text-xs font-medium text-muted-foreground">
                          Paradas ({route.stops.length})
                        </p>
                        <div className="space-y-1">
                          {route.stops.map((stop, index) => {
                            const parsed = parseLocation(stop)
                            return (
                              <div key={index} className="flex items-start gap-1.5 text-xs">
                                <span className="text-muted-foreground">{index + 1}.</span>
                                <div className="flex-1">
                                  <p className="font-medium">{parsed.stopName}</p>
                                  <p className="text-muted-foreground">{parsed.city}</p>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2 text-xs text-muted-foreground pt-2">
                      {route.distance_km && (
                        <span className="flex items-center gap-1">
                          <Navigation className="h-3 w-3" />
                          {route.distance_km} km
                        </span>
                      )}
                      {route.estimated_duration_minutes && (
                        <span>• {route.estimated_duration_minutes} min</span>
                      )}
                    </div>

                    <div className="flex gap-2 pt-3 border-t">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleEditRoute(route)}
                      >
                        <Pencil className="mr-1 h-3 w-3" />
                        Editar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 text-destructive hover:text-destructive"
                        onClick={() => setDeletingRoute(route)}
                      >
                        <Trash2 className="mr-1 h-3 w-3" />
                        Eliminar
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      <RouteFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSuccess={handleFormSuccess}
        companyId={companyId}
        route={editingRoute}
      />

      <Dialog open={!!deletingRoute} onOpenChange={() => setDeletingRoute(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Eliminar ruta?</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar la ruta "{deletingRoute?.name}"?
              Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeletingRoute(null)}
              disabled={deleteLoading}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteRoute}
              disabled={deleteLoading}
            >
              {deleteLoading ? 'Eliminando...' : 'Eliminar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

