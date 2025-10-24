# TransRoute Frontend

Frontend de Next.js 14 para el sistema TransRoute.

## 🚀 Características

- **Next.js 14** con App Router
- **TypeScript** para type safety
- **TailwindCSS** para estilos
- **shadcn/ui** para componentes UI
- **Modo Oscuro** nativo
- **Mobile-First** con bottom navigation
- **Responsive** en todos los dispositivos

## 📦 Instalación

```bash
npm install
```

## ⚙️ Configuración

Crea un archivo `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
```

## 🏃‍♂️ Ejecución

```bash
# Desarrollo
npm run dev

# Producción
npm run build
npm start
```

## 📁 Estructura

```
src/
├── app/
│   ├── (auth)/          # Páginas públicas
│   ├── (dashboard)/     # Páginas protegidas
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/              # Componentes shadcn/ui
│   ├── layout/          # Layout components
│   └── providers/       # Context providers
└── lib/
    ├── api.ts           # API client
    ├── supabase.ts      # Supabase client
    └── utils.ts         # Utilities
```

## 🎨 Diseño

- **Color Principal:** #1a247e
- **Estilo:** Flat Design
- **Modo Oscuro:** Activable
- **Mobile-First:** Bottom navigation en móvil

## 📱 Navegación

### Desktop
- Sidebar izquierdo con todos los módulos
- Header superior con theme toggle y user menu

### Mobile
- Bottom navigation bar con 5 opciones principales
- Header minimalista
- Menú de usuario en header

## 🔗 Páginas

- `/` - Landing page
- `/login` - Inicio de sesión
- `/register` - Registro
- `/dashboard` - Dashboard principal
- `/dashboard/trips` - Gestión de viajes
- `/dashboard/reservations` - Gestión de reservaciones
- `/dashboard/packages` - Gestión de paquetería
- `/dashboard/finances` - Módulo financiero
- `/dashboard/reports` - Reportes y estadísticas

## 🧩 Componentes UI

Componentes de shadcn/ui disponibles:
- Button
- Card
- Input
- Label
- Toast/Toaster
- Dropdown Menu
- Más...

## 🌐 API Integration

El cliente API está en `src/lib/api.ts`:

```typescript
import { api } from '@/lib/api'

// Login
await api.login(email, password)

// Get trips
const trips = await api.trips.getAll(companyId)

// Create reservation
await api.reservations.create(data)
```

## 🎯 TypeScript

Todo el código está tipado con TypeScript para mejor developer experience y menos errores.

## 📝 Convenciones

- Componentes en PascalCase
- Funciones en camelCase
- Constantes en UPPER_CASE
- Archivos de componentes: `component-name.tsx`
- Hooks personalizados: `use-hook-name.ts`

## 🧪 Testing

```bash
# Playwright tests
npx playwright test
```

## 🚢 Deploy

Ver [DEPLOYMENT.md](../DEPLOYMENT.md) en la raíz del proyecto.

## 📚 Recursos

- [Next.js Docs](https://nextjs.org/docs)
- [TailwindCSS Docs](https://tailwindcss.com/docs)
- [shadcn/ui Docs](https://ui.shadcn.com/)

