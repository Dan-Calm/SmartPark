import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AdminDisponiblesPage } from './admin-disponibles.page';

const routes: Routes = [
  {
    path: '',
    component: AdminDisponiblesPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminDisponiblesPageRoutingModule {}
