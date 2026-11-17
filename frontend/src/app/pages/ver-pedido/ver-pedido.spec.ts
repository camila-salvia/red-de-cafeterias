import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { afterEach, vi } from 'vitest';
import { ApiService } from '../../services/api';
import { AuthService } from '../../services/auth';
import { CartService } from '../../services/cart';
import { ItemCarrito } from '../../models/item-carrito.interface';
import { VerPedidoComponent } from './ver-pedido';

describe('VerPedidoComponent', () => {
  let component: VerPedidoComponent;
  let fixture: ComponentFixture<VerPedidoComponent>;
  let carrito: ReturnType<typeof signal<ItemCarrito[]>>;
  let usuarioId: string | null;
  let crearPedido: ReturnType<typeof vi.fn>;
  let limpiarCarrito: ReturnType<typeof vi.fn>;
  let forzarLogin: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    carrito = signal<ItemCarrito[]>([{
      producto: {
        id: 'producto-1',
        nombre: 'Café',
        descripcion: 'Café de prueba',
        precio: 1200,
      },
      cantidad: 2,
    }]);
    usuarioId = 'usuario-1';
    crearPedido = vi.fn(() => of({
      data: { id: 'pedido-1', estado_pago: 'Pendiente', costo_total: 2400 },
    }));
    limpiarCarrito = vi.fn(() => carrito.set([]));
    forzarLogin = vi.fn();

    await TestBed.configureTestingModule({
      imports: [VerPedidoComponent],
      providers: [
        provideRouter([]),
        {
          provide: ApiService,
          useValue: {
            getMetodosPago: () => of({ data: [{ id: 'pago-1', nombre: 'Efectivo' }] }),
            crearPedido,
          },
        },
        {
          provide: AuthService,
          useValue: {
            usuarioIdActual: () => usuarioId,
            forzarLogin,
          },
        },
        {
          provide: CartService,
          useValue: {
            items: carrito,
            cantidadTotal: () => 2,
            precioTotal: () => 2400,
            cambiarCantidad: vi.fn(),
            eliminarProducto: vi.fn(),
            limpiarCarrito,
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(VerPedidoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    await fixture.whenStable();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('sends an authenticated customer order and clears the cart after success', async () => {
    component.metodoSeleccionado.set('pago-1');

    await component.confirmarPedido();

    expect(crearPedido).toHaveBeenCalledWith({
      direccion_envio: 'Retiro en sucursal',
      metodo_pago: 'pago-1',
      items: [{ productoId: 'producto-1', cantidad: 2 }],
    });
    expect(component.pedidoReciente()?.id).toBe('pedido-1');
    expect(limpiarCarrito).toHaveBeenCalledOnce();
    expect(carrito()).toEqual([]);
  });

  it('keeps the cart and shows an error when the order request fails', async () => {
    crearPedido.mockReturnValue(throwError(() => new HttpErrorResponse({
      status: 503,
      error: { message: 'Database details should not be shown to the customer.' },
    })));
    component.metodoSeleccionado.set('pago-1');

    await component.confirmarPedido();

    expect(limpiarCarrito).not.toHaveBeenCalled();
    expect(carrito()).toHaveLength(1);
    expect(component.mensajeError()).toContain('Tu carrito se conservó');
    expect(component.cargandoPedido()).toBe(false);
  });

  it('preserves the cart and requests login when there is no authenticated user', async () => {
    usuarioId = null;
    component.metodoSeleccionado.set('pago-1');

    await component.confirmarPedido();

    expect(forzarLogin).toHaveBeenCalledWith('Iniciá sesión para continuar.', true);
    expect(crearPedido).not.toHaveBeenCalled();
    expect(limpiarCarrito).not.toHaveBeenCalled();
  });

  it('does not send an order without a payment method', async () => {
    await component.confirmarPedido();

    expect(crearPedido).not.toHaveBeenCalled();
    expect(limpiarCarrito).not.toHaveBeenCalled();
    expect(component.mensajeError()).toContain('método de pago');
  });
});
