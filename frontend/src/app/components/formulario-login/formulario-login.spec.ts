import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormularioLoginComponent } from './formulario-login';

describe('FormularioLogin', () => {
  let component: FormularioLoginComponent;
  let fixture: ComponentFixture<FormularioLoginComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormularioLoginComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FormularioLoginComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
