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
import { api } from '@/lib/api'
import { useToast } from '@/components/ui/use-toast'
import { Loader2 } from 'lucide-react'
import { localToUTC, getTodayLocalDateString } from '@/lib/date-utils'

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
  const { toast } = useToast()
  const [routes, setRoutes] = useState<any[]>([])
  const [templates, setTemplates] = useState<any[]>([])
  const [combinations, setCombinations] = useState<any[]>([])
  const [loadingCombinations, setLoadingCombinations] = useState(false)
  const [loading, setLoading] = useState(false)
  const [loadingRoutes, setLoadingRoutes] = useState(false)

  // Form state
  const [selectedRoute, setSelectedRoute] = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState('none')
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
      setSelectedTemplate('none')
    }
  }, [selectedRoute])

  const loadRoutes = async () => {
    try {
      setLoadingRoutes(true)
      const data = await api.routes.getAll(companyId)
      setRoutes(data || [])
    } catch (error: any) {
      console.error('Error loading routes:', error)
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Error al cargar rutas',
      })
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

  // Cargar combinaciones cuando se selecciona template
  useEffect(() => {
    if (selectedRoute && selectedTemplate !== 'none') {
      loadCombinations()
    } else {
      setCombinations([])
    }
  }, [selectedRoute, selectedTemplate])

  const loadCombinations = async () => {
    if (!selectedRoute) return

    try {
      setLoadingCombinations(true)
      const data = await api.routeTemplates.getCombinations(selectedRoute)
      
      // Si hay template seleccionado, filtrar por las combinaciones habilitadas
      if (selectedTemplate && selectedTemplate !== 'none') {
        const template = templates.find(t => t.id === selectedTemplate)
        if (template && template.price_configuration) {
          const filtered = data.filter((combo: any) => {
            const config = template.price_configuration[combo.key]
            return config && config.enabled
          }).map((combo: any) => ({
            ...combo,
            price: template.price_configuration[combo.key]?.price || 0,
            time: template.time_configuration?.[combo.key] || null
          }))
          setCombinations(filtered)
        } else {
          setCombinations(data)
        }
      } else {
        setCombinations(data)
      }
    } catch (error: any) {
      console.error('Error loading combinations:', error)
      setCombinations([])
    } finally {
      setLoadingCombinations(false)
    }
  }

  const resetForm = () => {
    setSelectedRoute('')
    setSelectedTemplate('none')
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
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Debes seleccionar una ruta',
      })
      return false
    }

    if (isDateRange) {
      if (!startDate || !endDate) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Debes seleccionar el rango de fechas',
        })
        return false
      }
      if (new Date(startDate) > new Date(endDate)) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'La fecha de inicio debe ser anterior a la fecha de fin',
        })
        return false
      }
    } else {
      if (!singleDate) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Debes seleccionar una fecha',
        })
        return false
      }
    }

    if (!departureTime) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Debes ingresar la hora de salida',
      })
      return false
    }

    if (capacity < 1) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'La capacidad debe ser al menos 1',
      })
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setLoading(true)

    try {
      // Preparar route_template_id (undefined si es 'none')
      const templateId = selectedTemplate === 'none' ? undefined : selectedTemplate

      if (isDateRange) {
        // Publicar múltiples viajes
        await api.trips.publishMultiple({
          route_id: selectedRoute,
          route_template_id: templateId,
          company_id: companyId,
          capacity,
          start_date: startDate,
          end_date: endDate,
          departure_time: departureTime,
          visibility,
        })
        toast({
          title: 'Éxito',
          description: `Viajes publicados desde ${startDate} hasta ${endDate}`,
        })
      } else {
        // Publicar viaje único
        // Convertir de hora local de México a UTC
        const departureDateTime = localToUTC(singleDate, departureTime)
        await api.trips.create({
          route_id: selectedRoute,
          route_template_id: templateId,
          company_id: companyId,
          capacity,
          departure_datetime: departureDateTime,
          visibility,
        })
        toast({
          title: 'Éxito',
          description: 'Viaje publicado exitosamente',
        })
      }

      onSuccess()
    } catch (error: any) {
      console.error('Error publishing trip:', error)
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        stack: error.stack
      })
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.response?.data?.message || error.message || 'Error al publicar viaje',
      })
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
                  <SelectItem value="none">Sin plantilla</SelectItem>
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

          {/* Preview de combinaciones */}
          {combinations.length > 0 && selectedTemplate !== 'none' && (
            <div className="space-y-2 p-3 border rounded-lg bg-muted/50">
              <Label className="text-sm font-semibold">
                Preview de combinaciones ({combinations.length})
              </Label>
              <div className="max-h-[200px] overflow-y-auto space-y-2">
                {combinations.slice(0, 10).map((combo: any, index: number) => (
                  <div 
                    key={combo.key || index} 
                    className="text-xs flex justify-between items-center p-2 bg-background rounded border"
                  >
                    <div className="flex-1">
                      <span className="font-medium">
                        {combo.origin?.split('|')[0]} → {combo.destination?.split('|')[0]}
                      </span>
                      {combo.isIntraCity && (
                        <span className="ml-2 text-warning text-[10px]">(misma ciudad)</span>
                      )}
                    </div>
                    <div className="text-right">
                      {combo.price && <div className="font-semibold text-success">${combo.price}</div>}
                      {combo.time && (
                        <div className="text-[10px] text-muted-foreground">
                          {combo.time.hours}h {combo.time.minutes}min
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {combinations.length > 10 && (
                  <p className="text-[10px] text-muted-foreground text-center">
                    ... y {combinations.length - 10} combinaciones más
                  </p>
                )}
              </div>
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
                  min={getTodayLocalDateString()}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end-date">Hasta *</Label>
                <Input
                  id="end-date"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  min={startDate || getTodayLocalDateString()}
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
                  min={getTodayLocalDateString()}
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

