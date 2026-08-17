import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormularioLogin } from './formulario-login';

describe('FormularioLogin', () => {
  let component: FormularioLogin;
  let fixture: ComponentFixture<FormularioLogin>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormularioLogin],
    }).compileComponents();

    fixture = TestBed.createComponent(FormularioLogin);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
