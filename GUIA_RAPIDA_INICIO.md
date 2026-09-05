# 🚀 GUÍA RÁPIDA - Primeros pasos (Semana 1)

## ⚠️ PROBLEMA MÁS URGENTE - LOGIN ROTO

**Estado actual**: El frontend obtiene TODOS los usuarios y compara passwords en navegador.  
**Problema**: Nunca usa el JWT, nunca usa el endpoint `/api/usuario/login` que YA existe en backend.  
**Riesgo**: Fallaría cualquier auditoría de seguridad.

### Solución inmediata (30 minutos):

**1. Verificar que backend está generando JWT correctamente:**
```bash
# Desde backend/
npm run start:dev

# En otra terminal, probar:
curl -X POST http://localhost:3000/api/usuario/login \
  -H "Content-Type: application/json" \
  -d '{"email":"usuario@test.com","password":"password123"}'

# Debe retornar: { message: "...", data: { token: "...", id, nombre, esAdmin } }
```

**2. Arreglar frontend login** (`frontend/src/app/pages/login/login.ts`):

```typescript
// CAMBIAR ESTO (ACTUAL - INCORRECTO):
this.apiService.obtenerUsuarios().subscribe({
  next: (respuesta: any) => {
    const usuarioValido = listaUsuarios.find(
      (u: any) => u.email === this.email() && u.password === this.password()
    );
    if (usuarioValido) {
      this.authService.login(usuarioValido.nombre, usuarioValido.id);
    }
  }
});

// POR ESTO (CORRECTO - USA JWT):
this.apiService.login({ email: this.email(), password: this.password() }).subscribe({
  next: (respuesta: any) => {
    if (respuesta.data) {
      this.authService.login(respuesta.data);  // Recibe: {token, id, nombre, esAdmin}
      this.router.navigate(['/']);
    }
  },
  error: (err) => {
    this.mensajeError.set('Credenciales inválidas');
  }
});
```

**3. Actualizar AuthService** (`frontend/src/app/services/auth.ts`):

```typescript
// CAMBIAR:
login(usuarioData: { id: string; nombre: string; token: string; esAdmin: boolean }) {
  localStorage.setItem('token_cafeteria', usuarioData.token);
  localStorage.setItem('usuario_id', usuarioData.id);
  localStorage.setItem('nombre_usuario', usuarioData.nombre);
  localStorage.setItem('es_admin', String(usuarioData.esAdmin));
  this.isLoggedIn.set(true);
  this.usuarioActual.set(usuarioData.nombre);
  this.esAdmin.set(usuarioData.esAdmin);
}

// Se mantiene igual - el interceptor YA envía el token ✓
```

**4. Probar el flujo:**
```bash
# Backend + Frontend corriendo
# Login en http://localhost:3000/login
# Email: cualquier usuario existente
# Password: la correcta
# Debe redirigir a inicio con token en localStorage
```

---

## 📦 INSTALACIÓN DE TESTING (Backend)

**En `backend/` terminal:**

```bash
# 1. Instalar vitest
npm install --save-dev vitest @vitest/ui

# 2. Actualizar package.json script:
# Cambiar: "test": "echo \"Error: no test specified\" && exit 1"
# Por:     "test": "vitest"

# 3. Crear carpeta de tests
mkdir -p src/tests

# 4. Crear archivo de configuración vitest (en root backend):
cat > vitest.config.ts << 'EOF'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node'
  }
})
EOF

# 5. Probar que corre:
npm test
```

---

## 🧪 TEMPLATE PARA PRIMER TEST (Usuario)

**Archivo**: `backend/src/tests/usuario.test.ts`

```typescript
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { MikroORM } from '@mikro-orm/core'
import { orm } from '../shared/database/orm.js'
import { Usuario } from '../usuario/usuario.entity.js'

describe('Usuario', () => {
  let em = orm.em

  beforeAll(async () => {
    // await orm.em.nativeDelete(Usuario, {}) // Opcional: limpiar antes
  })

  it('debe crear un usuario con datos válidos', async () => {
    const usuario = em.create(Usuario, {
      nombre: 'Juan',
      apellido: 'Pérez',
      email: 'juan@test.com',
      password: 'password123',
      telefono: 1234567890,
      direccion: 'Calle Falsa 123',
      esAdmin: false
    })

    await em.flush()

    expect(usuario.id).toBeDefined()
    expect(usuario.email).toBe('juan@test.com')
  })

  it('debe obtener usuario por ID', async () => {
    const usuarios = await em.find(Usuario, {})
    expect(usuarios.length).toBeGreaterThan(0)
  })

  afterAll(async () => {
    // await orm.close()
  })
})
```

**Correr test:**
```bash
npm test -- usuario.test.ts
```

---

## 🔐 PROTECCIÓN DE RUTAS - Checklist rápido

**Archivos que DEBEN cambiar:**

### 1️⃣ `backend/src/producto/producto.routes.ts` (YA LO TIENE ✓)
```typescript
router.post('/', verificarToken, soloAdmin, validarProductoInput, add);
router.put('/:id', verificarToken, soloAdmin, validarProductoInput, update);
router.delete('/:id', verificarToken, soloAdmin, remove);
// ✓ Correcto - solo admin puede crear/editar/borrar productos
```

### 2️⃣ `backend/src/categoria/categoria.routes.ts` (FALTA PROTEGER)
```typescript
// ACTUAL (INCORRECTO):
router.post('/', sanitizeCategoriaInput, add);
router.put('/:id', sanitizeCategoriaInput, update);
router.delete('/:id', remove);

// DEBE SER:
import { verificarToken, soloAdmin } from '../shared/middleware/auth.middleware.js'

router.post('/', verificarToken, soloAdmin, sanitizeCategoriaInput, add);
router.put('/:id', verificarToken, soloAdmin, sanitizeCategoriaInput, update);
router.delete('/:id', verificarToken, soloAdmin, remove);
router.get('/', findAll);  // ← público OK
router.get('/:id', findOne);  // ← público OK
```

### 3️⃣ `backend/src/comentario/comentario.routes.ts` (FALTA PROTEGER)
```typescript
// ACTUAL (INCORRECTO):
router.post('/', sanitizeComentarioInput, add);
router.put('/:id', sanitizeComentarioInput, update);
router.delete('/:id', remove);

// DEBE SER:
import { verificarToken } from '../shared/middleware/auth.middleware.js'

router.post('/', verificarToken, sanitizeComentarioInput, add);
router.put('/:id', verificarToken, sanitizeComentarioInput, update);
router.delete('/:id', verificarToken, remove);
router.get('/', findAll);  // ← público OK
router.get('/:id', findOne);  // ← público OK
```

### 4️⃣ `backend/src/pedido/pedido.routes.ts` (FALTA PROTEGER GET)
```typescript
// ACTUAL (INCOMPLETO):
router.post('/', verificarToken, validarPedidoInput, add);
router.get('/', findAll);  // ← PROBLEMA: cualquiera puede ver todos los pedidos
router.get('/usuario/:usuarioId', findByUsuario);  // ← PROBLEMA: sin protección

// DEBE SER:
import { soloAdmin } from '../shared/middleware/auth.middleware.js'

router.post('/', verificarToken, validarPedidoInput, add);  // ✓ Autenticado crea su pedido
router.get('/', verificarToken, soloAdmin, findAll);  // ← Solo admin ve todos
router.get('/usuario/:usuarioId', verificarToken, findByUsuario);  // ← Usuario ve sus propios
router.get('/:id', verificarToken, findOne);
// NOTA: el orden importa! rutas específicas ANTES que genéricas
```

---

## 👮 CREAR VALIDADOR DE COMENTARIO

**Archivo nuevo**: `backend/src/comentario/comentario.validator.ts`

```typescript
import { Request, Response, NextFunction } from 'express'
import { orm } from '../shared/database/orm.js'
import { Usuario } from '../usuario/usuario.entity.js'

export function validarComentarioInput(req: Request, res: Response, next: NextFunction) {
  const input = req.body.sanitizedInput || req.body
  const errores: string[] = []

  // Validar contenido
  if (!input.contenido || typeof input.contenido !== 'string' || input.contenido.trim().length === 0) {
    errores.push('El contenido del comentario es obligatorio.')
  } else if (input.contenido.length > 500) {
    errores.push('El comentario no puede exceder 500 caracteres.')
  }

  // Validar puntuación
  const puntuacion = Number(input.puntuacion)
  if (isNaN(puntuacion) || puntuacion < 1 || puntuacion > 5 || !Number.isInteger(puntuacion)) {
    errores.push('La puntuación debe ser un número entero entre 1 y 5.')
  }

  // Validar usuario
  if (!input.usuario || typeof input.usuario !== 'string') {
    errores.push('Debe especificar un usuario válido.')
  }

  if (errores.length > 0) {
    return res.status(400).json({
      message: 'Datos de comentario inválidos.',
      errores
    })
  }

  next()
}
```

**Usar en rutas:**
```typescript
// backend/src/comentario/comentario.routes.ts
import { validarComentarioInput } from './comentario.validator.js'

router.post('/', verificarToken, sanitizeComentarioInput, validarComentarioInput, add);
```

---

## ⏱️ TIMELINE RECOMENDADO

### ESTA SEMANA:
- **Lunes**: Arreglar login (2h) + Test setup backend (1h)
- **Martes**: Cada uno: su test unitario (3h c/u)
- **Miércoles**: Test integración (2h) + Proteger rutas (2h)
- **Jueves**: Admin Dashboard básico (3h)
- **Viernes**: Code review + buffer

### PRÓXIMA SEMANA:
- Tests frontend
- MisPedidos y Comentarios
- Pulir UI
- Validación CSS responsive

---

## 🆘 RECURSOS ÚTILES

- **Express + TypeScript**: http://expressjs.com/
- **MikroORM**: https://mikro-orm.io/
- **Angular Guards**: https://angular.io/guide/router#preventing-unauthorized-access
- **JWT**: https://jwt.io/
- **Vitest**: https://vitest.dev/

---

## ✅ CHECKLIST DÍA 1

- [ ] Backend login genera JWT correctamente
- [ ] Frontend login usa JWT (descarta obtenerUsuarios)
- [ ] AuthService recibe y guarda token
- [ ] Token se envía en requests (interceptor)
- [ ] Rutas categoria, comentario, pedido protegidas
- [ ] Validador comentario creado
- [ ] Testing setup en backend
- [ ] Primer test usuario corre sin errores

---

*Tiempo estimado semana 1: 30-40 horas de trabajo entre 3 personas*
