import { Routes } from '@angular/router';
import { InicioComponent } from './pages/inicio/inicio';
import { LoginComponent } from './pages/login/login';
import { Pedidos } from './pages/pedidos/pedidos';
import { AdminDashboard } from './pages/admin-dashboard/admin-dashboard';
import { ComentariosComponent } from './pages/comentarios/comentarios';
import { authGuard } from './guards/auth-guard';

export const routes: Routes = [
  { path: '', component: InicioComponent },
  { path: 'login', component: LoginComponent },
  { path: 'pedidos', component: Pedidos, canActivate: [authGuard] },
  { path: 'admin', component: AdminDashboard, canActivate: [authGuard] },
  { path: 'comentarios', component: ComentariosComponent },
  { path: '**', redirectTo: '' }
];