import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TarjetaProductoComponent } from './tarjeta-producto';

describe('TarjetaProducto', () => {
  let component: TarjetaProductoComponent;
  let fixture: ComponentFixture<TarjetaProductoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TarjetaProductoComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TarjetaProductoComponent);
    component = fixture.componentInstance;
    component.producto = {
      id: 'producto-1',
      nombre: 'Café de prueba',
      descripcion: 'Descripción de prueba',
      precio: 1200,
    };
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
