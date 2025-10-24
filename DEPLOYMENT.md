# TransRoute - Guía de Deployment

Guía completa para desplegar TransRoute en producción.

---

## 📋 Tabla de Contenidos

1. [Preparación](#preparación)
2. [Deploy Database (Supabase)](#deploy-database-supabase)
3. [Deploy Backend (Railway)](#deploy-backend-railway)
4. [Deploy Frontend (Vercel)](#deploy-frontend-vercel)
5. [Configuración Post-Deployment](#configuración-post-deployment)
6. [Monitoreo](#monitoreo)

---

## Preparación

### Checklist Pre-Deployment

- [ ] Código probado localmente
- [ ] Variables de entorno documentadas
- [ ] Base de datos migrada y probada
- [ ] Tests pasando
- [ ] Documentación actualizada
- [ ] Credenciales de producción listas

---

## Deploy Database (Supabase)

### 1. Crear Proyecto

1. Ve a [Supabase Dashboard](https://app.supabase.com)
2. Click en "New Project"
3. Selecciona organización y región
4. Espera a que el proyecto se inicialice

### 2. Ejecutar Migraciones

```sql
-- En SQL Editor de Supabase
-- Ejecutar database/schema.sql
-- Ejecutar database/seed.sql (opcional, solo en staging)
```

### 3. Configurar Row Level Security (RLS)

```sql
-- Ejemplo de policy para tabla users
CREATE POLICY "Users can view their own data"
  ON users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all users"
  ON users FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role IN ('super_admin', 'owner', 'admin')
    )
  );
```

### 4. Obtener Credenciales

```
Project URL: https://xxx.supabase.co
Anon Key: eyJhbGc...
Service Role Key: eyJhbGc...
```

---

## Deploy Backend (Railway)

### 1. Instalación Railway CLI

```bash
npm install -g @railway/cli
railway login
```

### 2. Inicializar Proyecto

```bash
cd backend
railway init
```

### 3. Configurar Variables de Entorno

```bash
railway variables set NODE_ENV=production
railway variables set PORT=3000
railway variables set API_PREFIX=api/v1
railway variables set SUPABASE_URL=https://xxx.supabase.co
railway variables set SUPABASE_ANON_KEY=eyJhbGc...
railway variables set SUPABASE_SERVICE_KEY=eyJhbGc...
railway variables set JWT_SECRET=your-super-secure-production-secret
railway variables set JWT_EXPIRATION=7d
railway variables set CORS_ORIGIN=https://your-frontend.vercel.app
```

### 4. Deploy

```bash
railway up
```

### 5. Configurar Dominio

```bash
railway domain
# Seleccionar dominio custom o usar el generado
```

### 6. Verificar Deployment

```bash
# URL de tu backend
https://your-backend.railway.app/api/v1
https://your-backend.railway.app/api/docs
```

---

## Deploy Frontend (Vercel)

### 1. Instalación Vercel CLI

```bash
npm install -g vercel
vercel login
```

### 2. Configurar Proyecto

```bash
cd frontend
vercel
```

Sigue las instrucciones:
- Setup and deploy? → Yes
- Which scope? → [Tu equipo]
- Link to existing project? → No
- Project name? → transroute-frontend
- Directory? → ./
- Override settings? → No

### 3. Configurar Variables de Entorno

En Vercel Dashboard o CLI:

```bash
vercel env add NEXT_PUBLIC_SUPABASE_URL
# Ingresa: https://xxx.supabase.co

vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
# Ingresa: eyJhbGc...

vercel env add NEXT_PUBLIC_API_URL
# Ingresa: https://your-backend.railway.app/api/v1
```

### 4. Deploy a Producción

```bash
vercel --prod
```

### 5. Configurar Dominio Custom (Opcional)

```bash
vercel domains add yourdomain.com
```

Configura DNS:
```
Type: CNAME
Name: @
Value: cname.vercel-dns.com
```

---

## Configuración Post-Deployment

### 1. Actualizar CORS

En `backend/src/main.ts`, verifica:

```typescript
app.enableCors({
  origin: process.env.CORS_ORIGIN || 'https://your-frontend.vercel.app',
  credentials: true,
});
```

Redeploy backend:
```bash
cd backend
railway up
```

### 2. Probar Autenticación

```bash
# Test login
curl -X POST https://your-backend.railway.app/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password"}'
```

### 3. Configurar Supabase Auth (Opcional)

Si usas Supabase Auth en lugar de JWT:

1. En Supabase Dashboard → Authentication → Settings
2. Añade URLs permitidas:
   - Site URL: `https://your-frontend.vercel.app`
   - Redirect URLs: `https://your-frontend.vercel.app/auth/callback`

### 4. Habilitar Backups

**Supabase:**
- Automático en planes Pro+

**Railway:**
```bash
railway backups enable
```

### 5. Configurar Alertas

**Vercel:**
- Settings → Notifications
- Configurar alertas de deployment

**Railway:**
- Settings → Notifications
- Configurar webhooks de deployment

---

## Monitoreo

### 1. Logs

**Backend (Railway):**
```bash
railway logs
```

**Frontend (Vercel):**
```bash
vercel logs <deployment-url>
```

### 2. Analytics

**Vercel Analytics:**
```bash
# Habilitar en Dashboard
npm install @vercel/analytics
```

```typescript
// frontend/src/app/layout.tsx
import { Analytics } from '@vercel/analytics/react'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
```

### 3. Error Tracking (Opcional)

**Sentry:**

```bash
npm install @sentry/nextjs @sentry/node
```

```typescript
// sentry.client.config.ts
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
})
```

### 4. Uptime Monitoring

Usa servicios como:
- [UptimeRobot](https://uptimerobot.com/) (Gratis)
- [Pingdom](https://www.pingdom.com/)
- [Better Uptime](https://betteruptime.com/)

---

## CI/CD con GitHub Actions

### 1. Crear Workflow

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Railway
        run: |
          npm install -g @railway/cli
          railway up --service backend
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}

  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Vercel
        run: vercel --prod --token=${{ secrets.VERCEL_TOKEN }}
```

### 2. Añadir Secrets

En GitHub Settings → Secrets:
- `RAILWAY_TOKEN`
- `VERCEL_TOKEN`

---

## Rollback

### Backend (Railway)

```bash
railway rollback
```

### Frontend (Vercel)

```bash
# Listar deployments
vercel ls

# Promover deployment anterior
vercel promote <deployment-url>
```

---

## Troubleshooting

### Error: CORS Policy

**Solución:** Verifica que `CORS_ORIGIN` en backend coincida con la URL del frontend.

### Error: Database Connection

**Solución:** Verifica credenciales de Supabase y que el proyecto esté activo.

### Error: JWT Invalid

**Solución:** Asegúrate que `JWT_SECRET` sea el mismo en backend y que no haya expirado el token.

### Error: Build Failed

**Solución:** 
```bash
# Limpiar caché
rm -rf node_modules .next
npm install
npm run build
```

---

## Checklist Post-Deployment

- [ ] Backend accesible en URL pública
- [ ] Frontend accesible en URL pública
- [ ] Swagger docs funcionando
- [ ] Login/Registro funcionando
- [ ] Base de datos accesible
- [ ] CORS configurado correctamente
- [ ] SSL/HTTPS habilitado
- [ ] Variables de entorno configuradas
- [ ] Backups habilitados
- [ ] Monitoreo configurado
- [ ] Dominio custom configurado (si aplica)

---

## Soporte

Si encuentras problemas:

1. Revisa logs de Railway y Vercel
2. Verifica variables de entorno
3. Consulta documentación oficial
4. Abre un issue en GitHub

---

¡Deployment exitoso! 🎉

