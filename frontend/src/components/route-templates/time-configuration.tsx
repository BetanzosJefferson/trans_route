'use client'

import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { MapPin } from 'lucide-react'

interface TimeConfigurationProps {
  combinations: any[]
  timeConfig: Record<string, { hours: number; minutes: number }>
  onChange: (config: Record<string, { hours: number; minutes: number }>) => void
}

// Helper to parse location
function parseLocation(value: string) {
  const parts = value.split('|')
  const stopName = parts[1] || 'Sin nombre'
  const location = parts[0] || ''
  const [city] = location.split(', ')
  return { stopName, city }
}

export function TimeConfiguration({
  combinations,
  timeConfig,
  onChange,
}: TimeConfigurationProps) {
  // Filter only consecutive combinations for time configuration
  const consecutiveCombinations = combinations.filter((c) => c.isConsecutive)

  const handleTimeChange = (key: string, field: 'hours' | 'minutes', value: string) => {
    const numValue = parseInt(value) || 0
    const newConfig = {
      ...timeConfig,
      [key]: {
        ...timeConfig[key],
        [field]: Math.max(0, numValue),
      },
    }
    onChange(newConfig)
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">Configuración de Tiempos</h3>
        <p className="text-sm text-muted-foreground">
          Define el tiempo de viaje entre cada parada consecutiva
        </p>
      </div>

      <div className="space-y-3">
        {consecutiveCombinations.map((combo) => {
          const origin = parseLocation(combo.origin)
          const dest = parseLocation(combo.destination)
          const time = timeConfig[combo.key] || { hours: 0, minutes: 30 }

          return (
            <div
              key={combo.key}
              className="flex items-center gap-4 rounded-md border bg-card p-4"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{origin.stopName}</span>
                  <span className="text-muted-foreground">→</span>
                  <span>{dest.stopName}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {origin.city} - {dest.city}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex flex-col">
                  <Label htmlFor={`${combo.key}-hours`} className="text-xs mb-1">
                    Horas
                  </Label>
                  <Input
                    id={`${combo.key}-hours`}
                    type="number"
                    min="0"
                    value={time.hours}
                    onChange={(e) => handleTimeChange(combo.key, 'hours', e.target.value)}
                    className="w-20 text-center"
                  />
                </div>

                <span className="mt-5 text-muted-foreground">:</span>

                <div className="flex flex-col">
                  <Label htmlFor={`${combo.key}-minutes`} className="text-xs mb-1">
                    Minutos
                  </Label>
                  <Input
                    id={`${combo.key}-minutes`}
                    type="number"
                    min="0"
                    max="59"
                    value={time.minutes}
                    onChange={(e) => handleTimeChange(combo.key, 'minutes', e.target.value)}
                    className="w-20 text-center"
                  />
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

