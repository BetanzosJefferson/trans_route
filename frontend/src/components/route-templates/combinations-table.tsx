'use client'

import { useState } from 'react'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { AlertCircle } from 'lucide-react'

interface CombinationsTableProps {
  combinations: any[]
  priceConfig: Record<string, { price: number; enabled: boolean }>
  onChange: (config: Record<string, { price: number; enabled: boolean }>) => void
}

// Helper to parse location
function parseLocation(value: string) {
  const parts = value.split('|')
  const stopName = parts[1] || 'Sin nombre'
  const location = parts[0] || ''
  const [city, state] = location.split(', ')
  return { stopName, city, state }
}

export function CombinationsTable({
  combinations,
  priceConfig,
  onChange,
}: CombinationsTableProps) {
  const handleCheckboxChange = (key: string, checked: boolean) => {
    const combo = combinations.find((c) => c.key === key)
    
    // If it's intra-city and trying to enable, show error
    if (combo?.isIntraCity && checked) {
      return // Don't allow enabling intra-city combinations
    }

    const newConfig = {
      ...priceConfig,
      [key]: {
        ...priceConfig[key],
        enabled: checked,
      },
    }
    onChange(newConfig)
  }

  const handlePriceChange = (key: string, value: string) => {
    const numValue = parseFloat(value) || 0
    const newConfig = {
      ...priceConfig,
      [key]: {
        ...priceConfig[key],
        price: Math.max(0, numValue),
      },
    }
    onChange(newConfig)
  }

  // Calculate number of stops affected
  const getStopsCount = (combo: any) => {
    const [i, j] = combo.key.split('-').map(Number)
    return j - i
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">Combinaciones de Viaje</h3>
        <p className="text-sm text-muted-foreground">
          Configura los precios para cada combinación de origen-destino. Las combinaciones intra-ciudad no pueden tener precio.
        </p>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[60px]">Habilitado</TableHead>
              <TableHead>Ciudad Origen</TableHead>
              <TableHead>Ciudad Destino</TableHead>
              <TableHead className="w-[150px]">Precio</TableHead>
              <TableHead className="text-center">Paradas Afectadas</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {combinations.map((combo) => {
              const origin = parseLocation(combo.origin)
              const dest = parseLocation(combo.destination)
              const config = priceConfig[combo.key] || { price: 0, enabled: true }
              const stopsCount = getStopsCount(combo)

              return (
                <TableRow key={combo.key} className={combo.isIntraCity ? 'bg-muted/50' : ''}>
                  <TableCell>
                    <div className="flex items-center justify-center">
                      <Checkbox
                        checked={config.enabled && !combo.isIntraCity}
                        onCheckedChange={(checked) =>
                          handleCheckboxChange(combo.key, checked as boolean)
                        }
                        disabled={combo.isIntraCity}
                      />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium text-sm">{origin.stopName}</p>
                      <p className="text-xs text-muted-foreground">
                        {origin.city}, {origin.state}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium text-sm">{dest.stopName}</p>
                      <p className="text-xs text-muted-foreground">
                        {dest.city}, {dest.state}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    {combo.isIntraCity ? (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <AlertCircle className="h-4 w-4" />
                        <span>Intra-ciudad</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">$</span>
                        <Input
                          type="number"
                          min="0"
                          step="10"
                          value={config.price}
                          onChange={(e) => handlePriceChange(combo.key, e.target.value)}
                          disabled={!config.enabled}
                          className="w-24"
                        />
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant={stopsCount === 1 ? 'default' : 'secondary'}>
                      {stopsCount} {stopsCount === 1 ? 'combinación' : 'combinaciones'}
                    </Badge>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-start gap-2 text-sm text-muted-foreground">
        <AlertCircle className="h-4 w-4 mt-0.5" />
        <p>
          Las combinaciones intra-ciudad (mismo origen y destino) están deshabilitadas automáticamente
          y no pueden tener precio configurado. Los tiempos sí se configuran para estas combinaciones.
        </p>
      </div>
    </div>
  )
}

