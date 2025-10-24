'use client'

import { useState, useEffect, useMemo } from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import estadosMunicipiosData from '@/data/estados-municipios.json'

interface LocationSelectorProps {
  value?: string
  onChange: (value: string) => void
  label: string
  placeholder?: string
  disabled?: boolean
  showStopName?: boolean
  stopNameLabel?: string
}

interface Estado {
  nombre: string
  municipios: string[]
}

export function LocationSelector({
  value,
  onChange,
  label,
  placeholder = 'Selecciona una ubicación',
  disabled = false,
  showStopName = true,
  stopNameLabel = 'Nombre de la parada',
}: LocationSelectorProps) {
  const [selectedEstado, setSelectedEstado] = useState<string>('')
  const [selectedMunicipio, setSelectedMunicipio] = useState<string>('')
  const [stopName, setStopName] = useState<string>('')
  const [municipios, setMunicipios] = useState<string[]>([])

  // Convert JSON object to array of estados
  const estados = useMemo(() => {
    return Object.entries(estadosMunicipiosData).map(([nombre, municipios]) => ({
      nombre,
      municipios: municipios as string[],
    }))
  }, [])

  // Parse initial value if provided
  // Format: "Municipio, Estado|Nombre de la parada"
  useEffect(() => {
    if (value) {
      const parts = value.split('|')
      const location = parts[0]
      const stopNameValue = parts[1] || ''
      
      if (location && location.includes(', ')) {
        const [municipio, estado] = location.split(', ')
        setSelectedMunicipio(municipio)
        setSelectedEstado(estado)
        setStopName(stopNameValue)
        
        const foundEstado = estados.find(e => e.nombre === estado)
        if (foundEstado) {
          setMunicipios(foundEstado.municipios)
        }
      }
    }
  }, [value, estados])

  const handleEstadoChange = (estado: string) => {
    setSelectedEstado(estado)
    setSelectedMunicipio('')
    
    const foundEstado = estados.find(e => e.nombre === estado)
    if (foundEstado) {
      setMunicipios(foundEstado.municipios)
    }
    
    // Clear the parent value when estado changes
    onChange('')
  }

  const handleMunicipioChange = (municipio: string) => {
    setSelectedMunicipio(municipio)
    // Update the value with current stop name
    const newValue = showStopName 
      ? `${municipio}, ${selectedEstado}|${stopName}` 
      : `${municipio}, ${selectedEstado}`
    onChange(newValue)
  }

  const handleStopNameChange = (name: string) => {
    setStopName(name)
    // Update the value if location is selected
    if (selectedMunicipio && selectedEstado) {
      onChange(`${selectedMunicipio}, ${selectedEstado}|${name}`)
    }
  }

  return (
    <div className="space-y-3">
      <Label>{label}</Label>
      
      <div className="space-y-2">
        <Select
          value={selectedEstado}
          onValueChange={handleEstadoChange}
          disabled={disabled}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecciona un estado" />
          </SelectTrigger>
          <SelectContent>
            {estados.map((estado) => (
              <SelectItem key={estado.nombre} value={estado.nombre}>
                {estado.nombre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={selectedMunicipio}
          onValueChange={handleMunicipioChange}
          disabled={!selectedEstado || disabled}
        >
          <SelectTrigger>
            <SelectValue placeholder={selectedEstado ? 'Selecciona un municipio' : 'Primero selecciona un estado'} />
          </SelectTrigger>
          <SelectContent>
            {municipios.map((municipio) => (
              <SelectItem key={municipio} value={municipio}>
                {municipio}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {showStopName && (
          <div className="space-y-1.5">
            <Label htmlFor={`stopName-${label}`} className="text-sm text-muted-foreground">
              {stopNameLabel}
            </Label>
            <Input
              id={`stopName-${label}`}
              value={stopName}
              onChange={(e) => handleStopNameChange(e.target.value)}
              placeholder="Ej: Terminal de autobuses centro"
              disabled={!selectedMunicipio || disabled}
            />
          </div>
        )}
      </div>
    </div>
  )
}
