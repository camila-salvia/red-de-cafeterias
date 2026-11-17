import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { ApiService } from '../../services/api';
import { AuthService } from '../../services/auth';
import { DetallePedidoComponent } from './detalle-pedido';

describe('DetallePedidoComponent', () => {
  let fixture: ComponentFixture<DetallePedidoComponent>;
  let admin: boolean;

  const pedido = {
    id: 'pedido-1',
    fecha_pedido: '2026-11-12T12:00:00.000Z',
    estado_pago: 'Confirmado',
    direccion_envio: 'Av. Siempre Viva 123',
    costo_total: 8500,
    usuario: { nombre: 'Camila', apellido: 'Salvia', email: 'camila@example.com' },
    metodo_pago: { nombre: 'Efectivo' },
    detalles: [{
      id: 'detalle-1',
      cantidad: 2,
      precio_unitario: 3000,
      producto: { id: 'producto-1', nombre: 'Café con leche' },
    }],
  };

  beforeEach(async () => {
    admin = false;
    await TestBed.configureTestingModule({
      imports: [DetallePedidoComponent],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: convertToParamMap({ id: 'pedido-1' }) } },
        },
        { provide: ApiService, useValue: { obtenerPedido: () => of({ data: pedido }) } },
        { provide: AuthService, useValue: { esAdmin: () => admin } },
      ],
    }).compileComponents();
  });

  function cargarComponente() {
    fixture = TestBed.createComponent(DetallePedidoComponent);
    fixture.detectChanges();
    return fixture.whenStable();
  }

  it('muestra la información del pedido sin mostrar datos del cliente al usuario', async () => {
    await cargarComponente();

    const contenido = fixture.nativeElement.textContent;
    expect(contenido).toContain('Av. Siempre Viva 123');
    expect(contenido).toContain('Café con leche');
    expect(contenido).toContain('Total:');
    expect(contenido).not.toContain('Camila');
    expect(contenido).not.toContain('camila@example.com');
  });

  it('muestra los datos del cliente a un administrador', async () => {
    admin = true;
    await cargarComponente();

    const contenido = fixture.nativeElement.textContent;
    expect(contenido).toContain('Camila');
    expect(contenido).toContain('Salvia');
    expect(contenido).toContain('camila@example.com');
  });
});
