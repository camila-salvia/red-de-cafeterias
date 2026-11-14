import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ApiService } from '../../services/api';
import { AuthService } from '../../services/auth';
import { MisPedidosComponent } from './mis-pedidos';

describe('MisPedidosComponent', () => {
  let component: MisPedidosComponent;
  let fixture: ComponentFixture<MisPedidosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MisPedidosComponent],
      providers: [
        provideRouter([]),
        { provide: ApiService, useValue: { obtenerMisPedidos: () => undefined } },
        { provide: AuthService, useValue: { usuarioIdActual: () => null } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MisPedidosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
