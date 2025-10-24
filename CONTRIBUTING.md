# Guía de Contribución

¡Gracias por tu interés en contribuir a TransRoute! 

## 🤝 Cómo Contribuir

### 1. Fork y Clone

```bash
git clone https://github.com/your-username/transroute.git
cd transroute
```

### 2. Crear Rama

```bash
git checkout -b feature/nueva-funcionalidad
# o
git checkout -b bugfix/correccion-bug
```

### 3. Hacer Cambios

- Sigue las convenciones de código
- Escribe tests para nuevas funcionalidades
- Actualiza documentación si es necesario

### 4. Commit

```bash
git add .
git commit -m "feat: descripción del cambio"
```

#### Convención de Commits

Seguimos [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` Nueva funcionalidad
- `fix:` Corrección de bug
- `docs:` Cambios en documentación
- `style:` Formateo, missing semi colons, etc
- `refactor:` Refactorización de código
- `test:` Añadir o modificar tests
- `chore:` Mantenimiento

### 5. Push y Pull Request

```bash
git push origin feature/nueva-funcionalidad
```

Luego abre un Pull Request en GitHub con:
- Descripción clara del cambio
- Screenshots (si aplica)
- Tests que pasaron
- Referencia a issues relacionados

## 📝 Convenciones de Código

### Nomenclatura

- **Variables/Funciones:** camelCase (inglés)
- **Componentes:** PascalCase
- **Constantes:** UPPER_CASE
- **Archivos:** kebab-case
- **Tablas DB:** snake_case (inglés)

### TypeScript

- Usa tipos explícitos
- Evita `any` cuando sea posible
- Usa interfaces para objetos

### Backend (NestJS)

- Un módulo por dominio
- DTOs para validación
- Services para lógica de negocio
- Controllers para endpoints

### Frontend (Next.js)

- Componentes funcionales con hooks
- Props tipadas con TypeScript
- Usa TailwindCSS para estilos
- shadcn/ui para componentes UI

## 🧪 Tests

Asegúrate que todos los tests pasen:

```bash
# Backend
cd backend
npm run test

# Frontend
cd frontend
npm run test
```

## 📚 Documentación

Si añades nuevas funcionalidades:

- Actualiza README.md
- Añade comentarios JSDoc
- Actualiza Swagger docs (backend)

## 🐛 Reportar Bugs

Usa el template de issues de GitHub incluyendo:

- Descripción del bug
- Pasos para reproducir
- Comportamiento esperado vs actual
- Screenshots (si aplica)
- Versión del sistema

## 💡 Sugerir Features

Abre un issue con el tag `enhancement` describiendo:

- Problema que resuelve
- Propuesta de solución
- Beneficios
- Posibles alternativas

## ✅ Checklist antes de PR

- [ ] Código sigue convenciones
- [ ] Tests escritos y pasando
- [ ] Documentación actualizada
- [ ] No hay console.logs
- [ ] Build exitoso
- [ ] Probado localmente

## 📞 Contacto

Si tienes dudas:
- Abre un issue
- Envía email a [contacto@transroute.com]

¡Gracias por contribuir! 🎉

