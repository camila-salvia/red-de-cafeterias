import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerPedido } from './ver-pedido';

describe('VerPedido', () => {
  let component: VerPedido;
  let fixture: ComponentFixture<VerPedido>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VerPedido],
    }).compileComponents();

    fixture = TestBed.createComponent(VerPedido);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
