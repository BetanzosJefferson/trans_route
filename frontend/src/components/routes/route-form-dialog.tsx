'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { LocationSelector } from './location-selector'
import { StopsManager } from './stops-manager'
import { useToast } from '@/components/ui/use-toast'
import { api } from '@/lib/api'

interface RouteFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  companyId: string
  route?: any // For editing existing route
}

export function RouteFormDialog({
  open,
  onOpenChange,
  onSuccess,
  companyId,
  route,
}: RouteFormDialogProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  
  // Form state
  const [origin, setOrigin] = useState('')
  const [destination, setDestination] = useState('')
  const [stops, setStops] = useState<string[]>([])
  const [name, setName] = useState('')
  const [autoGenerateName, setAutoGenerateName] = useState(true)
  const [distanceKm, setDistanceKm] = useState('')
  const [durationMinutes, setDurationMinutes] = useState('')

  // Load existing route data when editing
  useEffect(() => {
    if (route) {
      setOrigin(route.origin || '')
      setDestination(route.destination || '')
      setStops(route.stops || [])
      setName(route.name || '')
      setDistanceKm(route.distance_km?.toString() || '')
      setDurationMinutes(route.estimated_duration_minutes?.toString() || '')
      setAutoGenerateName(false)
    } else {
      resetForm()
    }
  }, [route, open])

  // Auto-generate name when origin and destination change
  useEffect(() => {
    if (autoGenerateName && origin && destination) {
      // Extract just the municipality names (before the pipe)
      const originLocation = origin.split('|')[0] || origin
      const destLocation = destination.split('|')[0] || destination
      const originCity = originLocation.split(',')[0].trim()
      const destCity = destLocation.split(',')[0].trim()
      setName(`${originCity} - ${destCity}`)
    }
  }, [origin, destination, autoGenerateName])

  const resetForm = () => {
    setOrigin('')
    setDestination('')
    setStops([])
    setName('')
    setAutoGenerateName(true)
    setDistanceKm('')
    setDurationMinutes('')
  }

  const validateForm = () => {
    if (!origin) {
      toast({
        title: 'Error',
        description: 'El origen es requerido',
        variant: 'destructive',
      })
      return false
    }

    if (!destination) {
      toast({
        title: 'Error',
        description: 'El destino es requerido',
        variant: 'destructive',
      })
      return false
    }

    // Validate that origin has stop name
    const originParts = origin.split('|')
    if (!originParts[1] || !originParts[1].trim()) {
      toast({
        title: 'Error',
        description: 'El origen debe tener un nombre de parada',
        variant: 'destructive',
      })
      return false
    }

    // Validate that destination has stop name
    const destParts = destination.split('|')
    if (!destParts[1] || !destParts[1].trim()) {
      toast({
        title: 'Error',
        description: 'El destino debe tener un nombre de parada',
        variant: 'destructive',
      })
      return false
    }

    if (origin === destination) {
      toast({
        title: 'Error',
        description: 'El origen y destino no pueden ser idénticos (misma ubicación y mismo nombre)',
        variant: 'destructive',
      })
      return false
    }

    if (!name || name.trim().length < 3) {
      toast({
        title: 'Error',
        description: 'El nombre debe tener al menos 3 caracteres',
        variant: 'destructive',
      })
      return false
    }

    if (distanceKm && (isNaN(Number(distanceKm)) || Number(distanceKm) <= 0)) {
      toast({
        title: 'Error',
        description: 'La distancia debe ser un número positivo',
        variant: 'destructive',
      })
      return false
    }

    if (durationMinutes && (isNaN(Number(durationMinutes)) || Number(durationMinutes) <= 0)) {
      toast({
        title: 'Error',
        description: 'La duración debe ser un número positivo',
        variant: 'destructive',
      })
      return false
    }

    return true
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    setLoading(true)

    try {
      const routeData = {
        name: name.trim(),
        origin,
        destination,
        stops: stops.length > 0 ? stops : undefined,
        distance_km: distanceKm ? Number(distanceKm) : undefined,
        estimated_duration_minutes: durationMinutes ? Number(durationMinutes) : undefined,
        company_id: companyId,
        is_active: true,
      }

      if (route) {
        await api.routes.update(route.id, routeData)
        toast({
          title: 'Ruta actualizada',
          description: 'La ruta ha sido actualizada exitosamente',
        })
      } else {
        await api.routes.create(routeData)
        toast({
          title: 'Ruta creada',
          description: 'La ruta ha sido creada exitosamente',
        })
      }

      resetForm()
      onSuccess()
      onOpenChange(false)
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Error al guardar la ruta',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{route ? 'Editar ruta' : 'Crear nueva ruta'}</DialogTitle>
          <DialogDescription>
            {route
              ? 'Modifica los detalles de la ruta'
              : 'Completa los detalles para crear una nueva ruta'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <LocationSelector
            value={origin}
            onChange={setOrigin}
            label="Origen"
            placeholder="Selecciona el origen"
          />

          <LocationSelector
            value={destination}
            onChange={setDestination}
            label="Destino"
            placeholder="Selecciona el destino"
          />

          <StopsManager
            stops={stops}
            onChange={setStops}
          />

          <div className="space-y-2">
            <Label htmlFor="name">Nombre de la ruta</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                setAutoGenerateName(false)
              }}
              placeholder="Ej: Ciudad de México - Guadalajara"
            />
            <p className="text-xs text-muted-foreground">
              Puedes editar el nombre generado automáticamente
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="distance">Distancia (km) - Opcional</Label>
              <Input
                id="distance"
                type="number"
                step="0.01"
                min="0"
                value={distanceKm}
                onChange={(e) => setDistanceKm(e.target.value)}
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Duración (minutos) - Opcional</Label>
              <Input
                id="duration"
                type="number"
                min="0"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(e.target.value)}
                placeholder="0"
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              resetForm()
              onOpenChange(false)
            }}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button type="button" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Guardando...' : route ? 'Actualizar ruta' : 'Crear ruta'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

