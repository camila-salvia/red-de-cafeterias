import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { ApiService } from '../../services/api';
import { PagoResultadoComponent } from './pago-resultado';

describe('PagoResultadoComponent', () => {
  const obtenerPedido = vi.fn();

  beforeEach(() => {
    obtenerPedido.mockReset();
    TestBed.configureTestingModule({
      providers: [
        provideRouter([{ path: 'pago/resultado', component: PagoResultadoComponent }]),
        { provide: ApiService, useValue: { obtenerPedido } },
      ],
    });
  });

  it('consulta el pedido indicado en external_reference', async () => {
    obtenerPedido.mockReturnValue(
      of({ data: { id: 'abc', estado_pago: 'Confirmado', costo_total: 100 } })
    );

    await RouterTestingHarness.create('/pago/resultado?external_reference=abc');

    expect(obtenerPedido).toHaveBeenCalledWith('abc');
  });
});