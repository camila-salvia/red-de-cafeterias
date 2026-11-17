import { Routes } from '@angular/router';
import { InicioComponent } from './pages/inicio/inicio';
import { LoginComponent } from './pages/login/login';
import { Pedidos } from './pages/pedidos/pedidos';
import { AdminDashboard } from './pages/admin-dashboard/admin-dashboard';
import { ComentariosComponent } from './pages/comentarios/comentarios';
import { authGuard } from './guards/auth-guard';
import { adminGuard } from './guards/admin.guard';
import { clienteGuard } from './guards/cliente.guard';

export const routes: Routes = [
  { path: '', component: InicioComponent },
  { path: 'login', component: LoginComponent },
  { path: 'pedidos', component: Pedidos, canActivate: [adminGuard] },
  { path: 'admin', component: AdminDashboard, canActivate: [adminGuard] },
  { path: 'comentarios', component: ComentariosComponent },
  { path: 'pedido/:id', loadComponent: () => import('./pages/detalle-pedido/detalle-pedido').then(m => m.DetallePedidoComponent), canActivate: [authGuard] },
  { path: 'ver-pedido', loadComponent: () => import('./pages/ver-pedido/ver-pedido').then(m => m.VerPedidoComponent), canActivate: [authGuard, clienteGuard]},
  { path: 'mis-pedidos', loadComponent: () => import('./pages/mis-pedidos/mis-pedidos').then(m => m.MisPedidosComponent), canActivate: [authGuard, clienteGuard]},
  { path: '**', redirectTo: '' }
];