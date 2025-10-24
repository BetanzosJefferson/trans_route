# TransRoute - Sistema SaaS de Gestión de Transporte

<div align="center">

![TransRoute Logo](https://via.placeholder.com/200x80/1a247e/ffffff?text=TransRoute)

**Plataforma completa multi-empresa para gestión de transporte de pasajeros y paquetería**

[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![NestJS](https://img.shields.io/badge/NestJS-10-red)](https://nestjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green)](https://supabase.com/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-cyan)](https://tailwindcss.com/)

</div>

---

## 📋 Tabla de Contenidos

- [Características](#-características)
- [Arquitectura](#-arquitectura)
- [Stack Tecnológico](#-stack-tecnológico)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Instalación](#-instalación)
- [Configuración](#-configuración)
- [Uso](#-uso)
- [API Documentation](#-api-documentation)
- [Deployment](#-deployment)
- [Licencia](#-licencia)

---

## ✨ Características

### 🏢 Multi-tenant
- Soporte completo para múltiples empresas
- Aislamiento de datos por `company_id`
- Row Level Security (RLS) en Supabase

### 🚌 Gestión de Viajes
- Creación de rutas con paradas intermedias
- Generación automática de segmentos de viaje
- Gestión de disponibilidad de asientos en tiempo real
- Asignación de vehículos y conductores

### 👥 Reservaciones
- Sistema completo de reservas
- Gestión de pasajeros
- Validación de disponibilidad
- Cancelaciones y reembolsos

### 📦 Paquetería
- Envío y rastreo de paquetes
- Asociación a viajes
- Estados de entrega
- Tracking number único

### 💰 Finanzas
- Transacciones por método de pago (efectivo, transferencia, tarjeta)
- Cortes de caja automatizados
- Gestión de gastos
- Sistema de comisiones
- Reportes financieros detallados

### 👮 Control de Acceso
- 9 roles de usuario: Super Admin, Owner, Admin, Call Center, Cashier, Commission Agent, Driver, Checker, Developer
- Autenticación JWT
- RBAC (Role-Based Access Control)
- Permisos granulares por módulo

### 📊 Auditoría
- Log automático de todas las acciones CRUD
- Registro de cambios (old_data / new_data)
- Tracking de usuario, IP y user agent
- Historial completo de modificaciones

### 🎨 Diseño Moderno
- Flat Design con color principal #1a247e
- Modo oscuro nativo
- Mobile-first con bottom navigation
- Responsive en todos los dispositivos
- Componentes UI con shadcn/ui

---

## 🏗️ Arquitectura

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (Next.js 14)                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │   App Router │  │  TailwindCSS │  │  shadcn/ui   │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
└─────────────────────────┬───────────────────────────────┘
                          │ API REST / Supabase SDK
┌─────────────────────────┴───────────────────────────────┐
│                   BACKEND (NestJS 10)                    │
│  ┌─────────┐  ┌──────────┐  ┌─────────┐  ┌──────────┐ │
│  │  Auth   │  │  Users   │  │  Trips  │  │  Reports │ │
│  │  (JWT)  │  │  (RBAC)  │  │ (CRUD)  │  │  (Data)  │ │
│  └─────────┘  └──────────┘  └─────────┘  └──────────┘ │
└─────────────────────────┬───────────────────────────────┘
                          │ Supabase Client
┌─────────────────────────┴───────────────────────────────┐
│              DATABASE (Supabase PostgreSQL)              │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Tables + RLS + Triggers + Indexes + Constraints │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

---

## 🛠️ Stack Tecnológico

### Backend
- **Framework:** NestJS 10
- **Lenguaje:** TypeScript 5.3
- **Base de Datos:** PostgreSQL (Supabase)
- **ORM:** Supabase JS SDK
- **Autenticación:** JWT + Passport
- **Validación:** class-validator + class-transformer
- **Documentación:** Swagger/OpenAPI
- **Testing:** Jest + Supertest

### Frontend
- **Framework:** Next.js 14 (App Router)
- **Lenguaje:** TypeScript 5.3
- **Estilos:** TailwindCSS 3.4
- **UI Components:** shadcn/ui + Radix UI
- **Iconos:** Lucide React
- **Gráficas:** Recharts
- **Formularios:** React Hook Form + Zod
- **State:** Zustand
- **Testing:** Playwright

### Infraestructura
- **Base de Datos:** Supabase (PostgreSQL)
- **Storage:** Supabase Storage
- **Auth:** Supabase Auth / JWT
- **Hosting Frontend:** Vercel
- **Hosting Backend:** Railway / Render
- **CI/CD:** GitHub Actions

---

## 📁 Estructura del Proyecto

```
transroute/
├── database/                 # Esquema de base de datos
│   ├── schema.sql           # Definición de tablas
│   ├── seed.sql             # Datos de prueba
│   └── README.md            # Documentación DB
│
├── backend/                  # API NestJS
│   ├── src/
│   │   ├── modules/         # Módulos por dominio
│   │   │   ├── auth/
│   │   │   ├── users/
│   │   │   ├── companies/
│   │   │   ├── routes/
│   │   │   ├── trips/
│   │   │   ├── reservations/
│   │   │   ├── clients/
│   │   │   ├── packages/
│   │   │   ├── vehicles/
│   │   │   ├── transactions/
│   │   │   ├── box-cutoffs/
│   │   │   ├── expenses/
│   │   │   ├── commissions/
│   │   │   ├── reports/
│   │   │   ├── audit-logs/
│   │   │   └── notifications/
│   │   ├── shared/          # Recursos compartidos
│   │   │   ├── decorators/
│   │   │   ├── guards/
│   │   │   ├── enums/
│   │   │   └── supabase/
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── package.json
│   ├── tsconfig.json
│   └── README.md
│
├── frontend/                 # App Next.js
│   ├── src/
│   │   ├── app/
│   │   │   ├── (auth)/      # Rutas públicas
│   │   │   │   ├── login/
│   │   │   │   └── register/
│   │   │   ├── (dashboard)/ # Rutas protegidas
│   │   │   │   └── dashboard/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   └── globals.css
│   │   ├── components/
│   │   │   ├── ui/          # shadcn/ui components
│   │   │   ├── layout/      # Layout components
│   │   │   └── providers/
│   │   └── lib/
│   │       ├── api.ts       # API client
│   │       ├── supabase.ts  # Supabase client
│   │       └── utils.ts
│   ├── package.json
│   ├── tsconfig.json
│   ├── tailwind.config.ts
│   └── next.config.js
│
└── README.md                 # Este archivo
```

---

## 🚀 Instalación

### Prerrequisitos

- Node.js 18+ y npm/yarn
- Cuenta de Supabase
- Git

### 1. Clonar el repositorio

```bash
git clone <repository-url>
cd transroute
```

### 2. Configurar Base de Datos

1. Crea un proyecto en [Supabase](https://supabase.com)
2. Ejecuta el script `database/schema.sql` en el SQL Editor
3. (Opcional) Ejecuta `database/seed.sql` para datos de prueba

### 3. Configurar Backend

```bash
cd backend
npm install

# Crear archivo .env
cp .env.example .env
# Editar .env con tus credenciales de Supabase

# Iniciar en desarrollo
npm run start:dev
```

### 4. Configurar Frontend

```bash
cd frontend
npm install

# Crear archivo .env.local
cp .env.local.example .env.local
# Editar .env.local con tus credenciales

# Iniciar en desarrollo
npm run dev
```

---

## ⚙️ Configuración

### Variables de Entorno - Backend

```env
NODE_ENV=development
PORT=3000
API_PREFIX=api/v1

SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-role-key

JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRATION=7d

CORS_ORIGIN=http://localhost:3001
```

### Variables de Entorno - Frontend

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
```

---

## 💻 Uso

### Acceso al Sistema

1. **Frontend:** http://localhost:3001
2. **Backend API:** http://localhost:3000/api/v1
3. **API Docs:** http://localhost:3000/api/docs

### Usuarios de Prueba (si ejecutaste seed.sql)

```
Super Admin:
  Email: superadmin@transroute.com
  Password: [ver seed.sql]

Owner:
  Email: owner@transroute.com
  Password: [ver seed.sql]

Admin:
  Email: admin@transroute.com
  Password: [ver seed.sql]
```

### Flujo de Trabajo Básico

1. **Login** → Autenticación con JWT
2. **Crear Ruta** → Definir origen, destino y paradas
3. **Crear Viaje** → Asignar vehículo, conductor y horario
4. **Generación Automática** → Se crean segmentos de viaje
5. **Hacer Reservación** → Cliente selecciona origen-destino
6. **Registrar Transacción** → Pago y confirmación
7. **Corte de Caja** → Al final del turno
8. **Ver Reportes** → Análisis de ingresos y ventas

---

## 📚 API Documentation

La documentación completa de la API está disponible en Swagger:

**URL:** http://localhost:3000/api/docs

### Endpoints Principales

| Módulo | Endpoint | Descripción |
|--------|----------|-------------|
| Auth | `POST /auth/login` | Iniciar sesión |
| Auth | `POST /auth/register` | Registrar usuario |
| Companies | `GET /companies` | Listar empresas |
| Users | `GET /users` | Listar usuarios |
| Routes | `GET /routes` | Listar rutas |
| Trips | `GET /trips` | Listar viajes |
| Trips | `POST /trips` | Crear viaje + segmentos |
| Reservations | `GET /reservations` | Listar reservaciones |
| Reservations | `POST /reservations` | Crear reservación |
| Reports | `GET /reports/financial` | Reporte financiero |
| Reports | `GET /reports/sales` | Reporte de ventas |

---

## 🌐 Deployment

### Deploy Backend (Railway)

```bash
cd backend
railway login
railway init
railway up
```

### Deploy Frontend (Vercel)

```bash
cd frontend
vercel login
vercel deploy
```

### Configurar Supabase en Producción

1. Actualiza las variables de entorno en Railway y Vercel
2. Configura Row Level Security policies en Supabase
3. Habilita Auth en Supabase
4. Configura CORS en el backend

---

## 🔐 Seguridad

- ✅ Autenticación JWT
- ✅ RBAC (Control de acceso basado en roles)
- ✅ Row Level Security (RLS) en Supabase
- ✅ Validación de DTOs
- ✅ Sanitización de inputs
- ✅ CORS configurado
- ✅ Rate limiting (recomendado para producción)
- ✅ HTTPS en producción

---

## 🧪 Testing

### Backend

```bash
cd backend

# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Coverage
npm run test:cov
```

### Frontend

```bash
cd frontend

# Playwright tests
npx playwright test
```

---

## 🤝 Contribuciones

Este es un proyecto completo de sistema SaaS. Para contribuir:

1. Fork el proyecto
2. Crea una rama (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -am 'Agrega nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

---

## 📝 Convenciones de Código

- **Nombres:** Todo en inglés (variables, funciones, endpoints, tablas)
- **Mensajes:** En español (UI, errores para usuarios, Swagger descriptions)
- **Formato:** Prettier + ESLint
- **Commits:** Conventional Commits
- **Branches:** feature/, bugfix/, hotfix/

---

## 📄 Licencia

Este proyecto está bajo la licencia MIT. Ver archivo `LICENSE` para más detalles.

---

## 👥 Equipo

- **Desarrollado por:** [Tu Nombre/Empresa]
- **Email:** [contacto@tuempresa.com]
- **Website:** [https://tuempresa.com]

---

## 🙏 Agradecimientos

- [NestJS](https://nestjs.com/) - Framework backend
- [Next.js](https://nextjs.org/) - Framework frontend
- [Supabase](https://supabase.com/) - BaaS
- [shadcn/ui](https://ui.shadcn.com/) - Componentes UI
- [TailwindCSS](https://tailwindcss.com/) - Estilos

---

<div align="center">

**TransRoute** - Transformando la gestión del transporte

Made with ❤️ by developers, for transport companies

[Documentación](./docs) · [Reportar Bug](issues) · [Solicitar Feature](issues)

</div>

