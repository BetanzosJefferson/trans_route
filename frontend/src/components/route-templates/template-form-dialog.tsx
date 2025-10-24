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
import { useToast } from '@/components/ui/use-toast'
import { api } from '@/lib/api'
import { TimeConfiguration } from './time-configuration'
import { CombinationsTable } from './combinations-table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface TemplateFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  route: any
  companyId: string
  template?: any // For editing existing template
}

export function TemplateFormDialog({
  open,
  onOpenChange,
  onSuccess,
  route,
  companyId,
  template,
}: TemplateFormDialogProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [loadingCombinations, setLoadingCombinations] = useState(false)
  const [combinations, setCombinations] = useState<any[]>([])
  const [name, setName] = useState('')
  const [timeConfig, setTimeConfig] = useState<Record<string, { hours: number; minutes: number }>>({})
  const [priceConfig, setPriceConfig] = useState<Record<string, { price: number; enabled: boolean }>>({})

  // Load combinations when route changes or dialog opens
  useEffect(() => {
    if (open && route?.id) {
      loadCombinations()
    }
  }, [open, route?.id])

  // Load existing template data
  useEffect(() => {
    if (template) {
      setName(template.name || '')
      setTimeConfig(template.time_configuration || {})
      setPriceConfig(template.price_configuration || {})
    } else {
      setName(`Plantilla ${route?.name || ''}`)
    }
  }, [template, route])

  const loadCombinations = async () => {
    if (!route?.id) return

    setLoadingCombinations(true)
    try {
      const data = await api.routeTemplates.getCombinations(route.id)
      setCombinations(data)

      // Initialize configs if not editing
      if (!template) {
        initializeConfigs(data)
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Error al cargar combinaciones',
        variant: 'destructive',
      })
    } finally {
      setLoadingCombinations(false)
    }
  }

  const initializeConfigs = (combos: any[]) => {
    const newTimeConfig: Record<string, { hours: number; minutes: number }> = {}
    const newPriceConfig: Record<string, { price: number; enabled: boolean }> = {}

    combos.forEach((combo) => {
      // Initialize time for consecutive combinations
      if (combo.isConsecutive) {
        newTimeConfig[combo.key] = { hours: 0, minutes: 30 }
      }

      // Initialize price for all non-intra-city combinations
      if (!combo.isIntraCity) {
        newPriceConfig[combo.key] = { price: 0, enabled: true }
      } else {
        newPriceConfig[combo.key] = { price: 0, enabled: false }
      }
    })

    setTimeConfig(newTimeConfig)
    setPriceConfig(newPriceConfig)
  }

  const validateForm = () => {
    if (!name || name.trim().length < 3) {
      toast({
        title: 'Error',
        description: 'El nombre debe tener al menos 3 caracteres',
        variant: 'destructive',
      })
      return false
    }

    // Check that at least one time is configured
    const hasTimeConfig = Object.keys(timeConfig).length > 0
    if (!hasTimeConfig) {
      toast({
        title: 'Error',
        description: 'Debe configurar al menos un tiempo entre paradas',
        variant: 'destructive',
      })
      return false
    }

    // Check that at least one combination is enabled
    const hasEnabledCombo = Object.values(priceConfig).some((c) => c.enabled)
    if (!hasEnabledCombo) {
      toast({
        title: 'Error',
        description: 'Debe habilitar al menos una combinación de viaje',
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
      const templateData = {
        route_id: route.id,
        company_id: companyId,
        name: name.trim(),
        time_configuration: timeConfig,
        price_configuration: priceConfig,
        is_active: true,
      }

      if (template) {
        await api.routeTemplates.update(template.id, templateData)
        toast({
          title: 'Plantilla actualizada',
          description: 'La plantilla ha sido actualizada exitosamente',
        })
      } else {
        await api.routeTemplates.create(templateData)
        toast({
          title: 'Plantilla creada',
          description: 'La plantilla ha sido creada exitosamente',
        })
      }

      onSuccess()
      onOpenChange(false)
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Error al guardar la plantilla',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>
            {template ? 'Editar plantilla' : 'Crear plantilla de ruta'}
          </DialogTitle>
          <DialogDescription>
            Configura los tiempos y precios para la ruta: {route?.name}
          </DialogDescription>
        </DialogHeader>

        {loadingCombinations ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
              <p className="text-muted-foreground">Cargando combinaciones...</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4 overflow-y-auto flex-1">
            <div className="space-y-2">
              <Label htmlFor="template-name">Nombre de la plantilla</Label>
              <Input
                id="template-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej: Plantilla Acapulco - CDMX"
              />
            </div>

            <Tabs defaultValue="times" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="times">Configuración de Tiempos</TabsTrigger>
                <TabsTrigger value="prices">Configuración de Precios</TabsTrigger>
              </TabsList>

              <TabsContent value="times" className="space-y-4 mt-4">
                <TimeConfiguration
                  combinations={combinations}
                  timeConfig={timeConfig}
                  onChange={setTimeConfig}
                />
              </TabsContent>

              <TabsContent value="prices" className="space-y-4 mt-4">
                <CombinationsTable
                  combinations={combinations}
                  priceConfig={priceConfig}
                  onChange={setPriceConfig}
                />
              </TabsContent>
            </Tabs>
          </div>
        )}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={loading || loadingCombinations}
          >
            {loading ? 'Guardando...' : template ? 'Actualizar plantilla' : 'Crear plantilla'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

