# TransRoute Backend

Backend NestJS para el sistema de gestión de transporte multi-empresa TransRoute.

## 🚀 Características

- **Arquitectura modular** con separación clara por dominios
- **Autenticación JWT** con control de roles (RBAC)
- **Multi-tenant** mediante `company_id` en todas las entidades
- **Documentación Swagger** automática en `/api/docs`
- **Integración con Supabase** para base de datos PostgreSQL
- **Auditoría automática** de todas las acciones CRUD
- **Validación de DTOs** con class-validator
- **Soft delete** en todas las entidades principales

## 📦 Instalación

```bash
npm install
```

## ⚙️ Configuración

Crea un archivo `.env` basado en `.env.example`:

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

## 🏃‍♂️ Ejecución

```bash
# Desarrollo
npm run start:dev

# Producción
npm run build
npm run start:prod
```

## 📚 Documentación API

Una vez iniciado el servidor, la documentación Swagger está disponible en:

```
http://localhost:3000/api/docs
```

## 🔐 Autenticación

### Registro
```
POST /api/v1/auth/register
```

### Login
```
POST /api/v1/auth/login
```

### Uso del token
Incluir en headers de las peticiones:
```
Authorization: Bearer <token>
```

## 👥 Roles de Usuario

- `super_admin`: Acceso completo al sistema
- `owner`: Dueño de empresa
- `admin`: Administrador de empresa
- `call_center`: Centro de llamadas
- `cashier`: Cajero/taquilla
- `commission_agent`: Comisionista
- `driver`: Conductor
- `checker`: Checador
- `developer`: Desarrollador

## 📁 Estructura de Módulos

```
src/
├── modules/
│   ├── auth/           # Autenticación y autorización
│   ├── companies/      # Gestión de empresas
│   ├── users/          # Gestión de usuarios
│   ├── routes/         # Rutas de transporte
│   ├── trips/          # Viajes programados
│   ├── reservations/   # Reservaciones de boletos
│   ├── clients/        # Clientes
│   ├── packages/       # Paquetería
│   ├── vehicles/       # Vehículos
│   ├── transactions/   # Transacciones financieras
│   ├── box-cutoffs/    # Cortes de caja
│   ├── expenses/       # Gastos
│   ├── commissions/    # Comisiones
│   ├── reports/        # Reportes
│   ├── audit-logs/     # Auditoría
│   └── notifications/  # Notificaciones
├── shared/             # Recursos compartidos
│   ├── decorators/     # Decoradores personalizados
│   ├── guards/         # Guards de autenticación
│   ├── enums/          # Enumeraciones
│   └── supabase/       # Servicio de Supabase
└── main.ts            # Punto de entrada
```

## 🔄 Flujo de Negocio

### Crear Viaje
1. Se crea un viaje asociado a una ruta
2. Automáticamente se generan `trip_segments` para todas las combinaciones origen-destino

### Hacer Reservación
1. Se verifica disponibilidad de asientos en el segmento
2. Se crea la reservación
3. Se reducen asientos disponibles
4. Se registra en auditoría

### Corte de Caja
1. Se calculan totales por método de pago
2. Se asocian transacciones al corte
3. Se genera registro de auditoría

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Coverage
npm run test:cov
```

## 📝 Convenciones

- **Nombres en inglés**: Todas las variables, funciones, clases y endpoints
- **Mensajes en español**: Descripciones de Swagger y mensajes de error para usuarios
- **Soft delete**: Se usa `deleted_at` en lugar de borrado físico
- **Timestamps**: Todas las tablas tienen `created_at` y `updated_at`
- **UUIDs**: Se usa UUID v4 como identificador primario

## 🔒 Seguridad

- JWT para autenticación
- RBAC para autorización
- RLS (Row Level Security) en Supabase
- Validación de DTOs
- Sanitización de datos de usuario

## 📊 Auditoría

Todas las acciones CRUD generan registros en `audit_logs` que incluyen:
- Usuario que realizó la acción
- Tipo de acción (create, update, delete, status_change)
- Datos anteriores y nuevos
- IP y user agent
- Timestamp

## 🌐 Endpoints Principales

- `/api/v1/auth/*` - Autenticación
- `/api/v1/companies` - Empresas
- `/api/v1/users` - Usuarios
- `/api/v1/routes` - Rutas
- `/api/v1/trips` - Viajes
- `/api/v1/reservations` - Reservaciones
- `/api/v1/clients` - Clientes
- `/api/v1/vehicles` - Vehículos
- `/api/v1/transactions` - Transacciones
- `/api/v1/box-cutoffs` - Cortes de caja
- `/api/v1/reports/*` - Reportes
- `/api/v1/audit-logs` - Auditoría

## 🤝 Contribución

Este es un proyecto de sistema completo. Mantener las convenciones de nomenclatura y estructura modular.

