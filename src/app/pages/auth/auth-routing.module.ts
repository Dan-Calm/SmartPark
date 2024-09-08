import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AuthPage } from './auth.page';

const routes: Routes = [
  {
    path: '',
    component: AuthPage
  },
  {
    path: 'forgot-password',
    loadChildren: () => import('./forgot-password/forgot-password.module').then( m => m.ForgotPasswordPageModule)
  },
  {
    path: 'sign-up',
    loadChildren: () => import('./sign-up/sign-up.module').then( m => m.SignUpPageModule)
  },
  {
    path: 'disponibles',
    loadChildren: () => import('./disponibles/disponibles.module').then( m => m.DisponiblesPageModule)
  },
  {
    path: 'administrador',
    loadChildren: () => import('./administrador/administrador.module').then( m => m.AdministradorPageModule)
  },
  {
    path: 'historial',
    loadChildren: () => import('./historial/historial.module').then( m => m.HistorialPageModule)
  },
  {
    path: 'home',
    loadChildren: () => import('./home/home.module').then( m => m.HomePageModule)
  },
  {
    path: 'restaurar',
    loadChildren: () => import('./restaurar/restaurar.module').then( m => m.RestaurarPageModule)
  },
  {
    path: 'historial-admin',
    loadChildren: () => import('./historial-admin/historial-admin.module').then( m => m.HistorialAdminPageModule)
  },
  {
    path: 'administrar-usuarios',
    loadChildren: () => import('./administrar-usuarios/administrar-usuarios.module').then( m => m.AdministrarUsuariosPageModule)
  },
  {
    path: 'datos-auto',
    loadChildren: () => import('./datos-auto/datos-auto.module').then( m => m.DatosAutoPageModule)
  },
  {
    path: 'pago-ticket',
    loadChildren: () => import('./pago-ticket/pago-ticket.module').then( m => m.PagoTicketPageModule)
  },
  {
    path: 'admin-disponibles',
    loadChildren: () => import('./admin-disponibles/admin-disponibles.module').then( m => m.AdminDisponiblesPageModule)
  },
  {
    path: 'admin-stats',
    loadChildren: () => import('./admin-stats/admin-stats.module').then( m => m.AdminStatsPageModule)
  },
  {
    path: 'entrada-patente',
    loadChildren: () => import('./entrada-patente/entrada-patente.module').then( m => m.EntradaPatentePageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AuthPageRoutingModule {}
