import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BotonComponent } from './boton';

describe('Boton', () => {
  let component: BotonComponent;
  let fixture: ComponentFixture<BotonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BotonComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(BotonComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
