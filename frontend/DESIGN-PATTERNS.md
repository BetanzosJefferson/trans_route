# TransRoute - Patrones de Diseño

## Estructura de Página Estándar

```tsx
<div className="h-full flex flex-col p-6">
  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
    <div>
      <h1 className="text-3xl font-bold">Título</h1>
      <p className="text-muted-foreground mt-2">Descripción</p>
    </div>
    <Button>Acción</Button>
  </div>
  
  <div className="flex-1 overflow-auto space-y-6">
    {/* Contenido */}
  </div>
</div>
```

## Espaciado Consistente

- **Page padding:** `p-6` (24px)
- **Card padding:** `p-5` (20px)
- **Section spacing:** `space-y-6` (24px)
- **Item spacing:** `space-y-4` (16px)
- **Button icon gap:** `mr-2` (8px)
- **Button group gap:** `gap-2` (8px)

## Grids

```tsx
// Stats (4 columnas)
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

// Cards regulares (3 columnas)
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

// 2 columnas
<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
```

## Botones

```tsx
// Primario
<Button>Acción</Button>

// Secundario
<Button variant="outline">Acción</Button>

// Destructivo
<Button variant="destructive">Eliminar</Button>

// Outline destructivo (no elimina directamente)
<Button variant="outline" className="border-destructive text-destructive hover:bg-destructive/10">
  Eliminar
</Button>

// Con icono
<Button>
  <Plus className="mr-2 h-4 w-4" />
  Crear
</Button>
```

## Colores Semánticos

```tsx
// Success (verde)
<span className="text-success">Completado</span>
<Badge className="bg-success text-success-foreground">Activo</Badge>

// Warning (naranja)
<span className="text-warning">Advertencia</span>

// Info (azul)
<span className="text-info">Información</span>

// Error (rojo)
<span className="text-destructive">Error</span>
```

## Tipografía

```tsx
// Page title
<h1 className="text-3xl font-bold">

// Card title
<CardTitle className="text-lg">

// Body text
<p className="text-sm">

// Metadata/secondary
<span className="text-xs text-muted-foreground">
```

## Iconos

- Botones: `h-4 w-4` (16px)
- Navegación: `h-5 w-5` (20px)
- Decorativos pequeños: `h-3 w-3` (12px)

## Estados de Carga (Loading)

Usar siempre el mismo loader animado en todas las páginas:

```tsx
// Loading de página completa
if (loading) {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="text-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
        <p className="text-muted-foreground">Cargando...</p>
      </div>
    </div>
  )
}

// Loading inline (dentro de un card)
{loading ? (
  <div className="text-center py-8">
    <div className="h-6 w-6 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-3"></div>
    <p className="text-muted-foreground text-sm">Cargando...</p>
  </div>
) : (
  // Contenido
)}
```

## Dark Mode

Todo funciona automáticamente con las variables CSS. Solo recuerda:

- Usar `text-success`, `text-warning`, etc. (no `text-green-600`)
- Botones destructivos ya son visibles
- Inputs de fecha/hora ya tienen `color-scheme: dark`

## Anti-patrones

❌ NO: `<div className="p-4">` en una página y `p-6` en otra

✅ SÍ: Siempre `p-6` para páginas

❌ NO: `text-green-600`, `text-red-500`

✅ SÍ: `text-success`, `text-destructive`

❌ NO: `mr-1` en un botón, `mr-2` en otro

✅ SÍ: Siempre `mr-2` para iconos en botones

❌ NO: Cards con padding random

✅ SÍ: Siempre `p-5` cuando sobrescribes el default

