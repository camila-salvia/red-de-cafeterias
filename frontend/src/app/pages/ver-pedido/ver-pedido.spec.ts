import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { signal } from '@angular/core';
import { of } from 'rxjs';
import { ApiService } from '../../services/api';
import { AuthService } from '../../services/auth';
import { CartService } from '../../services/cart';
import { VerPedidoComponent } from './ver-pedido';

describe('VerPedidoComponent', () => {
  let component: VerPedidoComponent;
  let fixture: ComponentFixture<VerPedidoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VerPedidoComponent],
      providers: [
        provideRouter([]),
        { provide: ApiService, useValue: { getMetodosPago: () => of({ data: [] }) } },
        {
          provide: AuthService,
          useValue: {
            usuarioIdActual: () => null,
          },
        },
        {
          provide: CartService,
          useValue: {
            items: signal([]),
            cantidadTotal: () => 0,
            precioTotal: () => 0,
            cambiarCantidad: () => undefined,
            eliminarProducto: () => undefined,
            limpiarCarrito: () => undefined,
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(VerPedidoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
