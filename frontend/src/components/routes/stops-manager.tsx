'use client'

import { useState } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Plus, X, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { LocationSelector } from './location-selector'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface Stop {
  id: string
  value: string // Format: "Municipio, Estado|Nombre de la parada"
}

interface StopsManagerProps {
  stops: string[]
  onChange: (stops: string[]) => void
}

// Helper function to parse location string
function parseLocation(value: string) {
  const parts = value.split('|')
  const location = parts[0] || ''
  const stopName = parts[1] || ''
  const locationParts = location.split(', ')
  const city = locationParts[0] || ''
  const state = locationParts[1] || ''
  return { location, stopName, city, state }
}

function SortableStop({ stop, onRemove }: { stop: Stop; onRemove: (id: string) => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: stop.id })

  const { city, stopName } = parseLocation(stop.value)

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-2 rounded-md border bg-card p-3 text-card-foreground"
    >
      <button
        type="button"
        className="cursor-grab active:cursor-grabbing touch-none"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-5 w-5 text-muted-foreground" />
      </button>
      <div className="flex-1">
        <div className="flex items-center gap-1.5">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">{stopName || 'Sin nombre'}</span>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">{city}</p>
      </div>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => onRemove(stop.id)}
        className="h-8 w-8 p-0"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  )
}

export function StopsManager({ stops, onChange }: StopsManagerProps) {
  const [isAddingStop, setIsAddingStop] = useState(false)
  const [newStopValue, setNewStopValue] = useState('')

  // Convert stops array to objects with IDs for drag and drop
  const stopsWithIds: Stop[] = stops.map((value, index) => ({
    id: `stop-${index}`,
    value,
  }))

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = stopsWithIds.findIndex((stop) => stop.id === active.id)
      const newIndex = stopsWithIds.findIndex((stop) => stop.id === over.id)

      const reorderedStops = arrayMove(stopsWithIds, oldIndex, newIndex)
      onChange(reorderedStops.map((stop) => stop.value))
    }
  }

  const handleRemoveStop = (id: string) => {
    const updatedStops = stopsWithIds.filter((stop) => stop.id !== id)
    onChange(updatedStops.map((stop) => stop.value))
  }

  const handleAddStop = () => {
    if (newStopValue) {
      const { location, stopName } = parseLocation(newStopValue)
      
      // Validate that we have both location and stop name
      if (!location || !stopName.trim()) {
        return
      }

      // Allow duplicate locations with different stop names
      onChange([...stops, newStopValue])
      setNewStopValue('')
      setIsAddingStop(false)
    }
  }

  const isValidStop = () => {
    if (!newStopValue) return false
    const { location, stopName } = parseLocation(newStopValue)
    
    // Check if we have both location and stop name
    if (!location || !stopName.trim()) return false
    
    // Check for exact duplicates (same location AND same stop name)
    const isDuplicate = stops.some(stop => stop === newStopValue)
    
    return !isDuplicate
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label>Paradas intermedias (opcional)</Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setIsAddingStop(true)}
          className="h-8"
        >
          <Plus className="mr-1 h-4 w-4" />
          Agregar parada
        </Button>
      </div>

      {stopsWithIds.length > 0 ? (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={stopsWithIds.map((stop) => stop.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2">
              {stopsWithIds.map((stop) => (
                <SortableStop key={stop.id} stop={stop} onRemove={handleRemoveStop} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      ) : (
        <div className="rounded-md border border-dashed p-8 text-center">
          <p className="text-sm text-muted-foreground">
            No hay paradas intermedias.
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Haz clic en "Agregar parada" para añadir una.
          </p>
        </div>
      )}

      <Dialog open={isAddingStop} onOpenChange={setIsAddingStop}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agregar parada intermedia</DialogTitle>
            <DialogDescription>
              Selecciona la ubicación y nombre de la parada. Puedes agregar múltiples paradas en la misma ciudad con diferentes nombres.
            </DialogDescription>
          </DialogHeader>

          <LocationSelector
            value={newStopValue}
            onChange={setNewStopValue}
            label="Ubicación de la parada"
            stopNameLabel="Nombre de la parada"
            showStopName={true}
          />

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsAddingStop(false)
                setNewStopValue('')
              }}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleAddStop}
              disabled={!isValidStop()}
            >
              Agregar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
