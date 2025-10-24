# 🎯 GUÍA RÁPIDA - NOMBRES DE PARADAS

## ✨ Nueva Funcionalidad Implementada

Ahora cada ubicación (origen, destino, paradas) tiene **DOS componentes**:

1. **📍 Ubicación geográfica**: Estado y Municipio
2. **🏢 Nombre de la parada**: Terminal, estación, punto específico

---

## 🚀 ACCESO RÁPIDO

```
http://localhost:3001/dashboard/routes
```

---

## 📝 EJEMPLO PRÁCTICO

### Escenario: Ruta con múltiples terminales en Acapulco

#### Configuración:
```
Nombre de la ruta: "Acapulco Completo"

🔹 ORIGEN
   Ciudad: Acapulco de Juarez, Guerrero
   Parada: "Terminal de autobuses centro"

🔹 PARADA 1
   Ciudad: Acapulco de Juarez, Guerrero
   Parada: "Terminal costera"

🔹 PARADA 2
   Ciudad: Acapulco de Juarez, Guerrero
   Parada: "Terminal diamante"

🔹 DESTINO
   Ciudad: Acapulco de Juarez, Guerrero
   Parada: "Aeropuerto internacional"
```

#### ✅ ESTO AHORA ES POSIBLE
Antes NO podías tener múltiples paradas en la misma ciudad.
Ahora SÍ puedes, siempre que tengan diferentes nombres.

---

## 🎨 INTERFAZ DEL FORMULARIO

### Al crear/editar una ruta verás:

```
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃ Crear nueva ruta                ┃
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
┃                                 ┃
┃ Origen                          ┃
┃ ┌─────────────────────────────┐ ┃
┃ │ Estado          ▼           │ ┃
┃ │ [Guerrero                 ] │ ┃
┃ └─────────────────────────────┘ ┃
┃ ┌─────────────────────────────┐ ┃
┃ │ Municipio       ▼           │ ┃
┃ │ [Acapulco de Juarez       ] │ ┃
┃ └─────────────────────────────┘ ┃
┃ ┌─────────────────────────────┐ ┃
┃ │ Nombre de la parada         │ ┃
┃ │ Terminal centro             │ ┃
┃ └─────────────────────────────┘ ┃
┃                                 ┃
┃ Destino                         ┃
┃ ┌─────────────────────────────┐ ┃
┃ │ Estado          ▼           │ ┃
┃ │ [Ciudad de Mexico         ] │ ┃
┃ └─────────────────────────────┘ ┃
┃ ┌─────────────────────────────┐ ┃
┃ │ Municipio       ▼           │ ┃
┃ │ [Ciudad de México         ] │ ┃
┃ └─────────────────────────────┘ ┃
┃ ┌─────────────────────────────┐ ┃
┃ │ Nombre de la parada         │ ┃
┃ │ Terminal TAPO               │ ┃
┃ └─────────────────────────────┘ ┃
┃                                 ┃
┃ Paradas intermedias (opcional)  ┃
┃ [+ Agregar parada]              ┃
┃                                 ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
```

---

## 📋 PASO A PASO

### 1️⃣ Crear ruta con múltiples paradas en una ciudad

1. Ve a `/dashboard/routes`
2. Click "Crear ruta"
3. **Configura el ORIGEN:**
   - Estado: `Guerrero`
   - Municipio: `Acapulco de Juarez`
   - Nombre: `Terminal centro` ✍️
4. **Configura el DESTINO:**
   - Estado: `Jalisco`
   - Municipio: `Guadalajara`
   - Nombre: `Terminal Nuevo Sur` ✍️
5. **Agrega paradas en la misma ciudad:**
   - Click "Agregar parada"
   - Estado: `Guerrero`
   - Municipio: `Acapulco de Juarez` (misma ciudad)
   - Nombre: `Terminal costera` ✍️ (diferente nombre)
   - Click "Agregar"
6. **Agrega otra parada:**
   - Click "Agregar parada"
   - Estado: `Guerrero`
   - Municipio: `Acapulco de Juarez` (misma ciudad otra vez)
   - Nombre: `Terminal diamante` ✍️ (otro nombre diferente)
   - Click "Agregar"
7. Click "Crear ruta"

✅ **RESULTADO:** Ruta creada con 3 puntos en Acapulco:
- Terminal centro (origen)
- Terminal costera (parada)
- Terminal diamante (parada)

---

## 🎯 VALIDACIONES

### ✅ PERMITIDO:
```
Origen:  Acapulco, Guerrero | Terminal A
Parada:  Acapulco, Guerrero | Terminal B
Parada:  Acapulco, Guerrero | Terminal C
Destino: Acapulco, Guerrero | Terminal D

✓ Misma ciudad, diferentes nombres
```

### ❌ NO PERMITIDO:
```
Origen:  Acapulco, Guerrero | Terminal A
Destino: Acapulco, Guerrero | Terminal A

✗ Misma ciudad, mismo nombre (duplicado exacto)
```

### ⚠️ REQUERIDO:
```
Origen:  Acapulco, Guerrero | [VACÍO]

✗ Debes ingresar un nombre de parada
```

---

## 🖼️ VISTA DE RUTAS

### Cómo se ve una ruta en la lista:

```
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃ Acapulco - Guadalajara     [Activa]┃
┃ 📍 Acapulco de Juarez → Guadalajara┃
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
┃                                     ┃
┃ Origen                              ┃
┃ 🏢 Terminal centro                  ┃
┃    Acapulco de Juarez, Guerrero     ┃
┃                                     ┃
┃ Destino                             ┃
┃ 🏢 Terminal Nuevo Sur               ┃
┃    Guadalajara, Jalisco             ┃
┃                                     ┃
┃ Paradas (2)                         ┃
┃ 1. Terminal costera                 ┃
┃    Acapulco de Juarez               ┃
┃ 2. Terminal diamante                ┃
┃    Acapulco de Juarez               ┃
┃                                     ┃
┃ 🧭 650 km • 480 min                ┃
┃                                     ┃
┃ [Editar]  [Eliminar]                ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
```

---

## 💡 CASOS DE USO REALES

### Caso 1: Terminal con múltiples áreas
```
Ruta: "CDMX Norte - Múltiples puntos"
- Origen: Ciudad de México | Terminal Norte - Área A
- Parada: Ciudad de México | Terminal Norte - Área B
- Parada: Ciudad de México | Terminal Norte - Área C
- Destino: Querétaro | Central de Autobuses
```

### Caso 2: Ruta urbana
```
Ruta: "Guadalajara Centro-Periferia"
- Origen: Guadalajara | Centro histórico
- Parada: Guadalajara | Plaza del Sol
- Parada: Guadalajara | Periférico Norte
- Parada: Guadalajara | Tlaquepaque Centro
- Destino: Guadalajara | Zapopan Plaza
```

### Caso 3: Ruta con aeropuerto
```
Ruta: "Cancún Aeropuerto-Hoteles"
- Origen: Cancún | Aeropuerto Internacional
- Parada: Cancún | Terminal ADO Centro
- Parada: Cancún | Zona Hotelera Norte
- Parada: Cancún | Zona Hotelera Centro
- Destino: Cancún | Zona Hotelera Sur
```

---

## 🔧 FUNCIONES DRAG & DROP

### Reordenar paradas:

```
Paradas actuales:
1. ⣿ Terminal A
2. ⣿ Terminal B
3. ⣿ Terminal C

[Arrastra ⣿ para reordenar]

Paradas reordenadas:
1. ⣿ Terminal C  ← Movido arriba
2. ⣿ Terminal A  ← Ahora segundo
3. ⣿ Terminal B  ← Ahora tercero
```

---

## 📊 FORMATO TÉCNICO

### Almacenamiento en base de datos:
```sql
origin = 'Acapulco de Juarez, Guerrero|Terminal centro'
destination = 'Guadalajara, Jalisco|Terminal Sur'
stops = ARRAY[
  'Acapulco de Juarez, Guerrero|Terminal costera',
  'Acapulco de Juarez, Guerrero|Terminal diamante',
  'Chilpancingo, Guerrero|Central camionera'
]
```

### Estructura:
```
"[Municipio, Estado]|[Nombre de la parada]"
         ↑              ↑
    Ubicación      Separador "|"      Nombre
```

---

## ✅ CHECKLIST DE USO

Antes de crear una ruta, verifica:

- [ ] ¿Seleccionaste estado de origen?
- [ ] ¿Seleccionaste municipio de origen?
- [ ] ✨ **¿Ingresaste nombre de parada de origen?**
- [ ] ¿Seleccionaste estado de destino?
- [ ] ¿Seleccionaste municipio de destino?
- [ ] ✨ **¿Ingresaste nombre de parada de destino?**
- [ ] (Opcional) ¿Agregaste paradas intermedias?
- [ ] ✨ **Cada parada tiene su nombre único?**
- [ ] ¿El nombre de la ruta es descriptivo?

---

## 🎓 TIPS

### 💡 Tip 1: Nombres descriptivos
```
✅ Bueno:
- "Terminal de autobuses centro"
- "Central camionera nuevo"
- "Estación ADO"
- "Aeropuerto internacional"

❌ Evita:
- "Terminal 1" (muy genérico)
- "T1" (abreviatura poco clara)
- "Parada" (sin contexto)
```

### 💡 Tip 2: Consistencia
```
Si usas "Terminal de autobuses [nombre]"
úsalo en todas las paradas:
- Terminal de autobuses centro
- Terminal de autobuses norte
- Terminal de autobuses sur
```

### 💡 Tip 3: Nombres únicos
```
En la misma ciudad, asegúrate de que cada
nombre sea claramente diferente:
- ✅ "Terminal centro" vs "Terminal norte"
- ❌ "Terminal" vs "Terminal 2" (confuso)
```

---

## 🆘 PROBLEMAS COMUNES

### Problema: "El origen debe tener un nombre de parada"
**Solución:** Ingresa un nombre en el campo "Nombre de la parada" debajo del selector de municipio.

### Problema: "No puedo agregar la misma ciudad otra vez"
**Solución:** Ahora SÍ puedes. Asegúrate de poner un nombre diferente en el campo "Nombre de la parada".

### Problema: "Dice 'Sin nombre' en la vista de rutas"
**Solución:** Edita la ruta y agrega nombres a las paradas que no lo tienen.

---

## 📞 RESUMEN ULTRA RÁPIDO

1. **Origen** = Ciudad + Nombre de parada ✨
2. **Destino** = Ciudad + Nombre de parada ✨
3. **Paradas** = Ciudad + Nombre de parada ✨
4. **Múltiples paradas en misma ciudad** = ✅ POSIBLE
5. **Mismo nombre en misma ciudad** = ❌ NO PERMITIDO

---

## 🎉 ¡EMPIEZA AHORA!

```
👉 http://localhost:3001/dashboard/routes
```

**Crea tu primera ruta con nombres de paradas** 🚀

---

**Fecha:** 24 de octubre, 2025  
**Versión:** 2.0.0  
**Estado:** ✅ LISTO PARA USAR

