'use client'

import { useState, useEffect } from 'react'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import api from '@/lib/api'
import { toast } from 'sonner'
import { CalendarIcon, Loader2 } from 'lucide-react'
import { format } from 'date-fns'

interface PublishTripDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  companyId: string
}

export function PublishTripDialog({
  open,
  onOpenChange,
  onSuccess,
  companyId,
}: PublishTripDialogProps) {
  const [routes, setRoutes] = useState<any[]>([])
  const [templates, setTemplates] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingRoutes, setLoadingRoutes] = useState(false)

  // Form state
  const [selectedRoute, setSelectedRoute] = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState('')
  const [isDateRange, setIsDateRange] = useState(false)
  const [singleDate, setSingleDate] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [departureTime, setDepartureTime] = useState('08:00')
  const [capacity, setCapacity] = useState(40)
  const [visibility, setVisibility] = useState<'published' | 'draft'>('published')

  useEffect(() => {
    if (open) {
      loadRoutes()
      resetForm()
    }
  }, [open, companyId])

  useEffect(() => {
    if (selectedRoute) {
      loadTemplates(selectedRoute)
    } else {
      setTemplates([])
      setSelectedTemplate('')
    }
  }, [selectedRoute])

  const loadRoutes = async () => {
    try {
      setLoadingRoutes(true)
      const data = await api.routes.getAll(companyId)
      setRoutes(data || [])
    } catch (error: any) {
      console.error('Error loading routes:', error)
      toast.error('Error al cargar rutas')
    } finally {
      setLoadingRoutes(false)
    }
  }

  const loadTemplates = async (routeId: string) => {
    try {
      const data = await api.routeTemplates.getByRoute(routeId)
      setTemplates(data || [])
    } catch (error: any) {
      console.error('Error loading templates:', error)
    }
  }

  const resetForm = () => {
    setSelectedRoute('')
    setSelectedTemplate('')
    setIsDateRange(false)
    setSingleDate('')
    setStartDate('')
    setEndDate('')
    setDepartureTime('08:00')
    setCapacity(40)
    setVisibility('published')
  }

  const validateForm = (): boolean => {
    if (!selectedRoute) {
      toast.error('Debes seleccionar una ruta')
      return false
    }

    if (isDateRange) {
      if (!startDate || !endDate) {
        toast.error('Debes seleccionar el rango de fechas')
        return false
      }
      if (new Date(startDate) > new Date(endDate)) {
        toast.error('La fecha de inicio debe ser anterior a la fecha de fin')
        return false
      }
    } else {
      if (!singleDate) {
        toast.error('Debes seleccionar una fecha')
        return false
      }
    }

    if (!departureTime) {
      toast.error('Debes ingresar la hora de salida')
      return false
    }

    if (capacity < 1) {
      toast.error('La capacidad debe ser al menos 1')
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setLoading(true)

    try {
      if (isDateRange) {
        // Publicar múltiples viajes
        await api.trips.publishMultiple({
          route_id: selectedRoute,
          route_template_id: selectedTemplate || undefined,
          company_id: companyId,
          capacity,
          start_date: startDate,
          end_date: endDate,
          departure_time: departureTime,
          visibility,
        })
        toast.success(
          `Viajes publicados desde ${startDate} hasta ${endDate}`
        )
      } else {
        // Publicar viaje único
        const departureDateTime = `${singleDate}T${departureTime}:00`
        await api.trips.create({
          route_id: selectedRoute,
          route_template_id: selectedTemplate || undefined,
          company_id: companyId,
          capacity,
          departure_datetime: departureDateTime,
          visibility,
        })
        toast.success('Viaje publicado exitosamente')
      }

      onSuccess()
    } catch (error: any) {
      console.error('Error publishing trip:', error)
      toast.error(
        error.response?.data?.message || 'Error al publicar viaje'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Publicar Viaje</DialogTitle>
          <DialogDescription>
            Configura los detalles del viaje a publicar
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Selector de Ruta */}
          <div className="space-y-2">
            <Label htmlFor="route">Ruta *</Label>
            <Select
              value={selectedRoute}
              onValueChange={setSelectedRoute}
              disabled={loadingRoutes}
            >
              <SelectTrigger id="route">
                <SelectValue placeholder="Selecciona una ruta" />
              </SelectTrigger>
              <SelectContent>
                {routes.map((route) => (
                  <SelectItem key={route.id} value={route.id}>
                    {route.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Selector de Plantilla */}
          {templates.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="template">Plantilla (opcional)</Label>
              <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                <SelectTrigger id="template">
                  <SelectValue placeholder="Sin plantilla" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Sin plantilla</SelectItem>
                  {templates
                    .filter((t) => t.is_active)
                    .map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                La plantilla define precios y tiempos entre paradas
              </p>
            </div>
          )}

          {/* Toggle: Fecha única o rango */}
          <div className="flex items-center justify-between space-x-2 p-3 border rounded-lg">
            <div>
              <Label htmlFor="date-range" className="text-sm font-medium">
                Publicar varios días
              </Label>
              <p className="text-xs text-muted-foreground">
                Publica el mismo viaje en un rango de fechas
              </p>
            </div>
            <Switch
              id="date-range"
              checked={isDateRange}
              onCheckedChange={setIsDateRange}
            />
          </div>

          {/* Fechas */}
          {isDateRange ? (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="start-date">Desde *</Label>
                <Input
                  id="start-date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end-date">Hasta *</Label>
                <Input
                  id="end-date"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  min={startDate || new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="single-date">Fecha *</Label>
              <Input
                id="single-date"
                type="date"
                value={singleDate}
                onChange={(e) => setSingleDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
          )}

          {/* Hora de salida */}
          <div className="space-y-2">
            <Label htmlFor="time">Hora de salida *</Label>
            <Input
              id="time"
              type="time"
              value={departureTime}
              onChange={(e) => setDepartureTime(e.target.value)}
            />
          </div>

          {/* Capacidad */}
          <div className="space-y-2">
            <Label htmlFor="capacity">Asientos disponibles *</Label>
            <Input
              id="capacity"
              type="number"
              min="1"
              max="100"
              value={capacity}
              onChange={(e) => setCapacity(parseInt(e.target.value) || 1)}
            />
          </div>

          {/* Visibilidad */}
          <div className="space-y-2">
            <Label htmlFor="visibility">Estado *</Label>
            <Select value={visibility} onValueChange={(v: any) => setVisibility(v)}>
              <SelectTrigger id="visibility">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="published">Publicado</SelectItem>
                <SelectItem value="draft">Borrador</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isDateRange ? 'Publicar Viajes' : 'Publicar Viaje'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

