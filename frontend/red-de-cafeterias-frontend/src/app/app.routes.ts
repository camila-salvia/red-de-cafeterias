import { Routes } from '@angular/router';
import { HomeComponent } from './features/home/home.component';
import { LoginComponent } from './features/login/login.component';
import { ReservasComponent } from './features/reservas/reservas.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'reservas', component: ReservasComponent }
];

