import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PagoResultado } from './pago-resultado';

describe('PagoResultado', () => {
  let component: PagoResultado;
  let fixture: ComponentFixture<PagoResultado>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PagoResultado],
    }).compileComponents();

    fixture = TestBed.createComponent(PagoResultado);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
