import { signal, type WritableSignal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AuthService } from '../../services/auth';
import { HeaderComponent } from './header';

describe('Header', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;
  let esAdmin: WritableSignal<boolean>;
  let isLoggedIn: WritableSignal<boolean>;

  beforeEach(async () => {
    esAdmin = signal(false);
    isLoggedIn = signal(false);
    await TestBed.configureTestingModule({
      imports: [HeaderComponent],
      providers: [
        provideRouter([]),
        {
          provide: AuthService,
          useValue: {
            isLoggedIn,
            esAdmin,
            usuarioActual: () => null,
            logout: () => undefined,
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('shows the admin panel before the greeting and logout button', () => {
    esAdmin.set(true);
    isLoggedIn.set(true);
    fixture.detectChanges();

    const navigationText = (fixture.nativeElement as HTMLElement)
      .querySelector('nav')?.textContent ?? '';
    const panelIndex = navigationText.indexOf('Panel Admin');
    const greetingIndex = navigationText.indexOf('Hola,');
    const logoutIndex = navigationText.indexOf('Cerrar sesión');

    expect(panelIndex).toBeGreaterThanOrEqual(0);
    expect(panelIndex).toBeLessThan(greetingIndex);
    expect(greetingIndex).toBeLessThan(logoutIndex);
  });
});
