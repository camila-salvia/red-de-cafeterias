import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CartService } from './cart';

// Lo que viaja dentro del JWT (lo arma el backend en usuario.controller -> login)
export interface TokenPayload {
  id: string;
  email: string;
  esAdmin: boolean;
  exp?: number; // vencimiento, en segundos desde epoch
  iat?: number;
}

// Lo que responde POST /usuario/login dentro de "data"
export interface DatosLogin {
  id: string;
  nombre: string;
  token: string;
  esAdmin: boolean;
}

// Única fuente de verdad de las claves de almacenamiento
const TOKEN_KEY = 'token_cafeteria';
const NOMBRE_KEY = 'nombre_usuario';
// Claves de versiones anteriores: ahora el id y el rol salen del token
const CLAVES_VIEJAS = ['usuario_id', 'es_admin'];

const MENSAJE_VENCIDA = 'Tu sesión venció. Iniciá sesión nuevamente.';
// setTimeout no admite más de ~24,8 días
const MAX_TIMEOUT_MS = 2_147_483_647;

function decodificarToken(token: string): TokenPayload | null {
  try {
    const parteCarga = token.split('.')[1];
    if (!parteCarga) return null;
    // base64url -> base64 (con relleno) -> bytes -> texto UTF-8
    const base64 = parteCarga.replace(/-/g, '+').replace(/_/g, '/');
    const conRelleno = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=');
    const bytes = Uint8Array.from(atob(conRelleno), c => c.charCodeAt(0));
    return JSON.parse(new TextDecoder().decode(bytes)) as TokenPayload;
  } catch {
    return null;
  }
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private router = inject(Router);
  private cartService = inject(CartService);
  private temporizador: ReturnType<typeof setTimeout> | null = null;

  private token = signal<string | null>(null);
  // Se decodifica solo para mostrar/ocultar partes de la UI. La seguridad real la hace el backend.
  private payload = computed(() => {
    const token = this.token();
    return token ? decodificarToken(token) : null;
  });

  isLoggedIn = computed(() => this.token() !== null);
  esAdmin = computed(() => this.payload()?.esAdmin === true);
  usuarioIdActual = computed(() => this.payload()?.id ?? null);
  usuarioActual = signal<string | null>(null);

  // Aviso para mostrar en /login cuando la sesión se cierra sola o hay que iniciar sesión
  mensajeSesion = signal<string | null>(null);

  constructor() {
    const guardado = localStorage.getItem(TOKEN_KEY);
    if (guardado && this.esTokenVigente(guardado)) {
      this.token.set(guardado);
      this.usuarioActual.set(localStorage.getItem(NOMBRE_KEY));
      this.programarExpiracion();
    } else {
      this.limpiarAlmacenamiento();
      if (guardado) this.mensajeSesion.set(MENSAJE_VENCIDA);
    }
  }

  getToken(): string | null {
    return this.token();
  }

  login(datos: DatosLogin): void {
    localStorage.setItem(TOKEN_KEY, datos.token);
    localStorage.setItem(NOMBRE_KEY, datos.nombre);

    this.token.set(datos.token);
    this.usuarioActual.set(datos.nombre);
    this.mensajeSesion.set(null);
    this.programarExpiracion();
  }

  // Cierre de sesión voluntario (botón "Cerrar sesión")
  logout(): void {
    this.limpiarTemporizador();
    this.limpiarAlmacenamiento();

    this.token.set(null);
    this.usuarioActual.set(null);
    this.mensajeSesion.set(null);
    // el carrito es de la sesión: no debe quedar para el próximo usuario
    this.cartService.limpiarCarrito();
  }

  // Cierre forzado (token vencido o rechazado por el backend): cierra, avisa y lleva al login
  forzarLogin(mensaje: string): void {
    this.logout();
    this.mensajeSesion.set(mensaje);
    this.router.navigate(['/login']);
  }

  // Para los guards: ¿hay sesión y el token sigue vigente? Si venció, la cierra.
  // No navega: el guard devuelve el UrlTree por su cuenta.
  estaAutenticado(): boolean {
    const token = this.token();
    if (!token) return false;
    if (this.esTokenVigente(token)) return true;

    this.logout();
    this.mensajeSesion.set(MENSAJE_VENCIDA);
    return false;
  }

  private esTokenVigente(token: string): boolean {
    const payload = decodificarToken(token);
    if (!payload) return false;
    return payload.exp === undefined || payload.exp * 1000 > Date.now();
  }

  // Cierra la sesión justo cuando vence el token, aunque la pestaña quede abierta sin actividad
  private programarExpiracion(): void {
    this.limpiarTemporizador();
    const exp = this.payload()?.exp;
    if (exp === undefined) return;

    const ms = Math.min(Math.max(exp * 1000 - Date.now(), 0), MAX_TIMEOUT_MS);
    this.temporizador = setTimeout(() => {
      if (this.estaAutenticado()) {
        this.programarExpiracion(); // el timeout se había acortado: reprogramar
      } else {
        this.router.navigate(['/login']);
      }
    }, ms);
  }

  private limpiarTemporizador(): void {
    if (this.temporizador !== null) {
      clearTimeout(this.temporizador);
      this.temporizador = null;
    }
  }

  private limpiarAlmacenamiento(): void {
    [TOKEN_KEY, NOMBRE_KEY, ...CLAVES_VIEJAS].forEach(clave => localStorage.removeItem(clave));
  }
}
