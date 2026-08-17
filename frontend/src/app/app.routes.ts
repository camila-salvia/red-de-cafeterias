import { Routes } from '@angular/router';
import { InicioComponent } from './pages/inicio/inicio';
import { LoginComponent } from './pages/login/login';
import { Pedidos } from './pages/pedidos/pedidos';
import { AdminDashboard } from './pages/admin-dashboard/admin-dashboard';

export const routes: Routes = [
  { path: '', component: InicioComponent },
  { path: 'login', component: LoginComponent },
  { path: 'pedidos', component: Pedidos },
  { path: 'admin', component: AdminDashboard },
  { path: '**', redirectTo: '' }
];