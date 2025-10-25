"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export interface ComboboxOption {
  value: string
  label: string
  location?: string
}

interface ComboboxProps {
  options: ComboboxOption[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
  emptyText?: string
  disabled?: boolean
  className?: string
}

export function Combobox({
  options,
  value,
  onChange,
  placeholder = "Seleccionar...",
  emptyText = "No se encontraron resultados.",
  disabled = false,
  className,
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [search, setSearch] = React.useState("")

  // Debug logging
  React.useEffect(() => {
    console.log(`🔄 Combobox [${placeholder}]:`, {
      optionsCount: options.length,
      options: options.map(o => o.label),
      value,
      disabled
    })
  }, [options, value, disabled, placeholder])

  const selectedOption = options.find((option) => option.value === value)

  // Filtrado manual para preservar los valores originales (sin lowercase)
  const filteredOptions = React.useMemo(() => {
    if (!search) return options
    const searchLower = search.toLowerCase()
    return options.filter(
      (opt) =>
        opt.label.toLowerCase().includes(searchLower) ||
        opt.location?.toLowerCase().includes(searchLower) ||
        opt.value.toLowerCase().includes(searchLower)
    )
  }, [options, search])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            "w-full justify-between",
            !value && "text-muted-foreground",
            className
          )}
        >
          {selectedOption ? (
            <div className="flex flex-col items-start">
              <span className="font-medium">{selectedOption.label}</span>
              {selectedOption.location && (
                <span className="text-xs text-muted-foreground">
                  {selectedOption.location}
                </span>
              )}
            </div>
          ) : (
            placeholder
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-[--radix-popover-trigger-width] p-0 z-[9999]"
        sideOffset={4}
      >
        <Command shouldFilter={false} className="max-h-[300px]">
          <CommandInput 
            placeholder="Buscar..." 
            value={search}
            onValueChange={setSearch}
          />
          <CommandEmpty>{emptyText}</CommandEmpty>
          <CommandGroup className="max-h-64 overflow-auto">
            {filteredOptions.map((option) => (
              <CommandItem
                key={option.value}
                value={`${option.label} ${option.location || ''}`.toLowerCase()}
                onSelect={() => {
                  onChange(option.value === value ? "" : option.value);
                  setOpen(false);
                  setSearch("");
                }}
                onMouseDown={(e) => {
                  e.preventDefault();
                }}
                onClick={(e) => {
                  e.stopPropagation();
                }}
                className="cursor-pointer hover:bg-accent pointer-events-auto"
                style={{ pointerEvents: 'auto', zIndex: 1 }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === option.value ? "opacity-100" : "opacity-0"
                  )}
                />
                <div className="flex flex-col">
                  <span className="font-medium">{option.label}</span>
                  {option.location && (
                    <span className="text-xs text-muted-foreground">
                      {option.location}
                    </span>
                  )}
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
