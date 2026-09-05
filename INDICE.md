# 📚 ÍNDICE DE DOCUMENTACIÓN - Red de Cafeterías

**Creado**: 2026-09-04  
**Grupo**: Vivas Martin, Salvia Camila, Marianela Leonardelli  
**Estado**: 65% implementado, 35% falta (crítico)

---

## 🚀 Comenzar aquí

### Para entender qué falta:
📄 **[DIAGRAMA_ESTADO.md](./DIAGRAMA_ESTADO.md)** ← LEER PRIMERO
- Arquitectura visual de la app
- Qué está ✅ vs ❌
- Flujo de login (actual vs correcto)
- Tabla de estado de rutas protegidas
- Responsabilidades por integrante

### Para empezar a trabajar HOY:
📄 **[GUIA_RAPIDA_INICIO.md](./GUIA_RAPIDA_INICIO.md)** ← SEGUNDA LECTURA
- ⚠️ Problema más urgente: Login JWT
- Solución inmediata (código listo para copiar)
- Setup de testing en backend
- Protección de rutas (checklist)
- Template para primer test

### Para ver TODAS las tareas:
📄 **[CHECKLIST_TAREAS.md](./CHECKLIST_TAREAS.md)** ← PLAN DE TRABAJO
- Checklist priorizado por semana
- Tareas por integrante
- Tests y validaciones
- Verificación final

### Para análisis detallado:
📄 **[ANALISIS_FALTANTE.md](./ANALISIS_FALTANTE.md)** ← REFERENCIA COMPLETA
- Análisis exhaustivo: ✅ vs ❌
- Explicación de cada problema
- Archivos a crear/modificar
- Requisitos técnicos y funcionales

---

## 🔍 ¿Qué documento necesito?

### Si eres **Vivas Martin** (50026):
1. Leer: [DIAGRAMA_ESTADO.md](./DIAGRAMA_ESTADO.md) → Tu sección
2. Hacer: Test Usuario → [GUIA_RAPIDA_INICIO.md#template-para-primer-test](./GUIA_RAPIDA_INICIO.md)
3. Hacer: Validación Usuario → [ANALISIS_FALTANTE.md#1-validaciones-completas---incompletas](./ANALISIS_FALTANTE.md)
4. Hacer: Protección rutas Usuario → [GUIA_RAPIDA_INICIO.md#-protección-de-rutas---checklist-rápido](./GUIA_RAPIDA_INICIO.md)

### Si eres **Salvia Camila** (49373):
1. Leer: [DIAGRAMA_ESTADO.md](./DIAGRAMA_ESTADO.md) → Tu sección
2. Hacer: Test Producto → [GUIA_RAPIDA_INICIO.md#template-para-primer-test](./GUIA_RAPIDA_INICIO.md)
3. Hacer: Comentario validator → [GUIA_RAPIDA_INICIO.md#-crear-validador-de-comentario](./GUIA_RAPIDA_INICIO.md)
4. Hacer: AdminDashboard → [ANALISIS_FALTANTE.md#3-admindashboard---vacío](./ANALISIS_FALTANTE.md)

### Si eres **Marianela Leonardelli** (51337):
1. Leer: [DIAGRAMA_ESTADO.md](./DIAGRAMA_ESTADO.md) → Tu sección
2. URGENTE: Arreglar Login → [GUIA_RAPIDA_INICIO.md#-problema-más-urgente---login-roto](./GUIA_RAPIDA_INICIO.md) ⚠️
3. Hacer: Test Comentario → [GUIA_RAPIDA_INICIO.md#template-para-primer-test](./GUIA_RAPIDA_INICIO.md)
4. Hacer: MisPedidos + Comentarios → [ANALISIS_FALTANTE.md#importante---frontend-funcionalidad](./ANALISIS_FALTANTE.md)

### Si necesitas:
- **Entender arquitectura**: [DIAGRAMA_ESTADO.md](./DIAGRAMA_ESTADO.md)
- **Código listo para copiar**: [GUIA_RAPIDA_INICIO.md](./GUIA_RAPIDA_INICIO.md)
- **Plan de trabajo**: [CHECKLIST_TAREAS.md](./CHECKLIST_TAREAS.md)
- **Referencia técnica completa**: [ANALISIS_FALTANTE.md](./ANALISIS_FALTANTE.md)

---

## 📊 RESUMEN EJECUTIVO (2 minutos)

**Estado**: 65% listo, 35% falta crítico  
**Problema más urgente**: Login no usa JWT (inseguro)  
**Tiempo falta**: 30-40 horas entre 3 personas (1-2 semanas)

### Top 3 Tareas ESTA SEMANA:
1. ✅ Arreglar login JWT (2h) - **MARIANELA**
2. ✅ Configurar tests backend (1h) - **TODOS**
3. ✅ Hacer 3 tests unitarios (6-8h) - **VIVAS + SALVIA + MARIANELA**
4. ✅ Proteger rutas faltantes (2h) - **TODOS**

### Top 3 Tareas PRÓXIMA SEMANA:
1. ✅ AdminDashboard (4-5h) - **SALVIA**
2. ✅ MisPedidos + Comentarios (4-5h) - **MARIANELA**
3. ✅ Tests e2e (3-4h) - **TODOS**

---

## 🗂️ ESTRUCTURA DE ARCHIVOS

```
red-de-cafeterias/
├─ 📄 DIAGRAMA_ESTADO.md          ← Arquitectura + estado actual
├─ 📄 GUIA_RAPIDA_INICIO.md       ← Quick start con código
├─ 📄 CHECKLIST_TAREAS.md         ← Plan de trabajo semanal
├─ 📄 ANALISIS_FALTANTE.md        ← Análisis detallado
├─ 📄 README.md                   ← (crear: instrucciones de setup)
├─ backend/
│  ├─ package.json                ← Instalar vitest para tests
│  ├─ src/
│  │  ├─ app.ts
│  │  ├─ usuario/                 ← CRUD 1 (Vivas)
│  │  ├─ categoria/               ← CRUD 2 (Salvia) - PROTEGER RUTAS
│  │  ├─ producto/                ← CRUD dependiente
│  │  ├─ comentario/              ← CRUD - CREAR VALIDATOR ❌
│  │  ├─ pedido/                  ← CRUD - PROTEGER GET
│  │  ├─ detalle-pedido/
│  │  ├─ metodo-pago/             ← PROTEGER RUTAS
│  │  ├─ tests/                   ← CREAR: usuario.test.ts, producto.test.ts, comentario.test.ts
│  │  └─ shared/
│  │     ├─ middleware/
│  │     │  └─ auth.middleware.ts ← YA tiene verificarToken + soloAdmin ✓
│  │     └─ database/
│  │        └─ orm.ts             ← MikroORM config ✓
│  └─ vitest.config.ts            ← CREAR
│
└─ frontend/
   ├─ package.json                ← vitest + angular testing YA instalado ✓
   ├─ src/
   │  ├─ app.routes.ts
   │  ├─ pages/
   │  │  ├─ login/                ← ❌ ARREGLAR: usar JWT
   │  │  ├─ inicio/               ← ✓ Listado productos + filtro
   │  │  ├─ admin-dashboard/      ← ❌ VACÍO - crear CRUD UI
   │  │  ├─ mis-pedidos/          ← ⚠️ INCOMPLETO
   │  │  ├─ ver-pedido/           ← ⚠️ INCOMPLETO
   │  │  └─ comentarios/          ← ❌ INCOMPLETO
   │  ├─ components/
   │  │  ├─ tarjeta-producto/     ← ✓ @Input/@Output, TEST mejorar
   │  │  └─ formulario-login/     ← TEST mejorar
   │  ├─ services/
   │  │  ├─ api.ts                ← ✓ login() existe, comentarios falta
   │  │  ├─ auth.ts               ← ✓ maneja tokens
   │  │  └─ cart.ts               ← ✓ basic setup
   │  ├─ guards/
   │  │  ├─ auth-guard.ts         ← ✓ verifica token
   │  │  └─ admin-guard.ts        ← CREAR para admin
   │  ├─ interceptors/
   │  │  └─ auth.interceptor.ts   ← ✓ envía token en headers
   │  └─ environments/             ← ✓ development + production
   └─ e2e/                         ← ❌ CREAR tests e2e
```

---

## 🎓 REQUISITOS A CUMPLIR

### Backend Técnicos:
- ✅ TypeScript
- ✅ Express + MikroORM (ORM)
- ✅ MySQL persistente
- ✅ JWT + 2 niveles acceso
- ✅ Validación entrada
- ❌ **3 tests unitarios** (1 por integrante)
- ❌ **1 test integración**
- ❌ **Protecciones completas** (faltan varias rutas)

### Frontend Técnicos:
- ✅ Angular + Bootstrap
- ✅ HTML5 + CSS/SCSS
- ✅ Componentes con @Input/@Output
- ✅ Guard de autenticación
- ✅ Interceptor de token
- ❌ **1 test unitario real** (solo "create" ahora)
- ❌ **1 test e2e**
- ❌ **CSS mobile-first 3 breakpoints** (verificar)

### Funcionales:
- ✅ 3 CRUDs simples
- ✅ CRUDs dependientes
- ✅ Listados con filtro
- ⚠️ **Detalles de listados** (parcial)
- ✅ **3 casos de uso** (realizar pedido, comentar, agregar producto)

---

## 📞 CONTACTO Y ESCALADAS

Si necesitas ayuda o tienes dudas:

1. **Revisar**: [GUIA_RAPIDA_INICIO.md](./GUIA_RAPIDA_INICIO.md) - 90% de respuestas ahí
2. **Revisar**: [ANALISIS_FALTANTE.md](./ANALISIS_FALTANTE.md) - Análisis técnico
3. **Revisar**: [DIAGRAMA_ESTADO.md](./DIAGRAMA_ESTADO.md) - Flujos y protecciones
4. **Preguntar en grupo** si está bloqueado

---

## ✅ ANTES DE ENTREGAR

- [ ] Todos los tests pasan (backend + frontend)
- [ ] No hay errores en consola
- [ ] Login funciona con JWT
- [ ] Rutas protegidas funcionan
- [ ] Admin puede gestionar productos
- [ ] Usuario puede crear pedido
- [ ] Usuario puede ver sus pedidos
- [ ] Comentarios funcionales
- [ ] CSS responsive en 3 breakpoints
- [ ] Base de datos sincronizada

---

## 📅 TIMELINE RECOMENDADO

```
SEMANA 1 (Crítico - 20-24 horas/grupo)
├─ Lunes: Login JWT + Test setup
├─ Martes: 3 tests unitarios
├─ Miércoles: Test integración + Protecciones
├─ Jueves: AdminDashboard
└─ Viernes: Buffer + Code review

SEMANA 2 (Importante - 15-18 horas/grupo)
├─ MisPedidos + Comentarios
├─ Tests e2e setup
├─ Validaciones faltantes
└─ Pulir UI

SEMANA 3 (Final - 5-10 horas/grupo)
├─ Bonus features (voluntario)
├─ CSS finales
└─ Entrega
```

---

## 🔗 RECURSOS

- **Código Backend**: `/backend/src/`
- **Código Frontend**: `/frontend/src/`
- **BD Schema**: `/backend/src/shared/database/schema.sql`
- **Propuesta Proyecto**: `/Propsal DSW.md`
- **Requisitos**: `/requisitos-backend.md`

---

**¿Por dónde empezar?**

```
1. Leer DIAGRAMA_ESTADO.md (5 min)
2. Leer GUIA_RAPIDA_INICIO.md (10 min)
3. Dividir tareas según asignación (5 min)
4. Comenzar: Arreglar Login (es lo más crítico)
5. Mientras tanto: Setup tests backend

¡Total: 20 minutos hasta empezar a codificar!
```

---

*Última actualización: 2026-09-04*  
*Documento de referencia para todo el proyecto*
