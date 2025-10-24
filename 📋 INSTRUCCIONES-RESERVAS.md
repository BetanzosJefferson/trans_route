# 📋 Instrucciones para Activar Sistema de Reservas

## 🎉 ¡Todo está listo en el código!

He implementado el **sistema completo de reservas** con integridad financiera. Ahora solo necesitas ejecutar **1 archivo SQL** en Supabase para activarlo.

---

## ✅ Paso Único: Ejecutar SQL en Supabase

### 1. Ir a Supabase SQL Editor

1. Abre tu proyecto en [https://supabase.com](https://supabase.com)
2. Ve a: **SQL Editor** (menú lateral izquierdo)
3. Click en **"New query"**

### 2. Ejecutar SQL (2 pasos - IMPORTANTE EL ORDEN)

**⚠️ Debes ejecutar 2 archivos en este orden:**

#### Paso 2.1: Ejecutar PART1 (ENUMs)
1. Abre el archivo: `database/enhance-reservations-schema-PART1.sql`
2. **Copia TODO el contenido**
3. Pégalo en el editor SQL de Supabase
4. Click en **"Run"** 
5. Deberías ver: `✅ PARTE 1 COMPLETADA: ENUMs creados`

#### Paso 2.2: Ejecutar PART2 (Resto)
1. Ahora abre: `database/enhance-reservations-schema-PART2.sql`
2. **Copia TODO el contenido**
3. Pégalo en el editor SQL de Supabase
4. Click en **"Run"**

**¿Por qué 2 archivos?** PostgreSQL requiere que los nuevos valores de ENUM se committeen antes de usarse. Es una medida de seguridad.

### 3. Verificar que fue exitoso

Deberías ver al final del output:

```
✅ Schema de reservaciones mejorado exitosamente
✅ Sistema anti-fraude activado
✅ Gestión por tramos habilitada
✅ Trazabilidad completa configurada
```

### ⚠️ Errores Comunes y Soluciones

#### Error: "unsafe use of new value 'partial' of enum type"
**Solución:** Ejecuta PART1 PRIMERO, luego PART2. No ambos juntos.

#### Error: "column r.amount_paid does not exist"
**Solución:** Asegúrate de ejecutar PART2 completo después de PART1.

---

## 🚀 ¿Qué acabo de instalar?

### Seguridad Financiera (Anti-Fraude)

- ✅ **Transacciones atómicas**: Reserva + transacción se crean juntas o ninguna se crea
- ✅ **Validación automática**: Imposible tener reserva "pagada" sin transacción real
- ✅ **Prevención de eliminación**: No se pueden borrar transacciones de reservas activas
- ✅ **Vistas de auditoría**: Detecta automáticamente reservas huérfanas o descuadres

### Nuevos Estados

- **Pagos**: `pending`, `partial` (anticipo), `paid`, `refunded`, `refund_pending`
- **Reservas**: `confirmed`, `cancelled`, `no_show`, `modified`, `pending_confirmation`

### Nuevas Capacidades

- ✅ Historial completo de modificaciones (`reservation_modifications`)
- ✅ Gestión automática de disponibilidad por tramos
- ✅ Función SQL para crear reserva + transacción atómicamente
- ✅ Reportes diarios de integridad financiera

---

## 🎨 ¿Qué puedes probar ahora?

### 1. En Desktop (navegador)

1. Reinicia el backend:
   ```bash
   cd backend
   npm run start:dev
   ```

2. Reinicia el frontend:
   ```bash
   cd frontend
   npm run dev
   ```

3. Ve a: **Dashboard → Nueva Reserva** (en el menú lateral)

### 2. En Mobile (o viewport pequeño)

1. Reduce el tamaño de la ventana del navegador
2. Verás el **BottomNav** con el botón central circular elevado:
   - 🏠 Inicio
   - 📋 Reservas
   - **➕ BOTÓN CENTRAL** (Nueva Reserva)
   - 📦 Paquetes
   - 💰 Finanzas

---

## 📝 Flujo de "Nueva Reserva"

### Paso 1: Buscar Viaje
- Por defecto, muestra viajes principales de hoy/mañana
- Filtra por: origen, destino, fecha
- Muestra viajes con asientos disponibles

### Paso 2: Datos del Cliente
- Busca cliente por teléfono (autocompleta si existe)
- Crea nuevo cliente si no existe
- Selecciona número de asientos

### Paso 3: Pago (3 escenarios)

#### ✅ Pago Completo
- Cliente paga todo ahora
- Se crea transacción tipo `ticket`
- Reserva queda en `paid`

#### ⏳ Anticipo
- Cliente paga parte ahora
- Se crea transacción tipo `ticket_deposit`
- Reserva queda en `partial`
- Sistema calcula `amount_pending` automáticamente

#### ⚠️ Pago Pendiente
- Cliente NO paga nada ahora
- NO se crea transacción
- Reserva queda en `pending`
- Pagará al abordar

---

## 🔒 Garantías del Sistema

1. **Imposible crear reserva pagada sin transacción**
   - El trigger `trg_validate_payment_integrity` lo previene

2. **Imposible borrar transacción de reserva activa**
   - El trigger `trg_prevent_transaction_deletion` lo previene

3. **Disponibilidad de asientos siempre correcta**
   - El trigger `trg_reservation_availability` actualiza automáticamente

4. **Auditoría completa**
   - Todo queda registrado en `reservation_modifications`
   - Consulta `v_orphaned_reservations` para detectar problemas

---

## 📊 Consultas Útiles en Supabase

### Ver reservas huérfanas (no debería haber ninguna)
```sql
SELECT * FROM v_orphaned_reservations;
```

### Ver descuadres de pagos (no debería haber ninguno)
```sql
SELECT * FROM v_mismatched_payments;
```

### Reporte de integridad diario
```sql
SELECT * FROM check_financial_integrity();
```

---

## 🐛 Si algo no funciona

### Error: "Función create_reservation_with_transaction no existe"
- **Solución**: Ejecuta de nuevo el archivo SQL completo en Supabase

### Error: "Reserva sin transacciones"
- **Esperado**: Esto solo puede pasar con reservas en `pending`
- **Anormal**: Si pasa con `paid` o `partial`, revisa el trigger

### El botón central no se ve elevado en mobile
- **Solución**: Recarga la página (Ctrl+Shift+R)
- Verifica que estés en viewport < 768px

---

## 📞 GitHub Push

El commit ya está listo localmente. Para hacer push a GitHub:
- Sigue las instrucciones en: `🔗 CONECTAR-GITHUB.md`

---

## 🎯 Resumen: Solo 1 paso

1. ✅ Ejecutar SQL en Supabase (`database/enhance-reservations-schema.sql`)
2. ✅ Reiniciar backend y frontend
3. ✅ Ir a "Nueva Reserva" y probar

¡Todo lo demás ya está implementado! 🚀

