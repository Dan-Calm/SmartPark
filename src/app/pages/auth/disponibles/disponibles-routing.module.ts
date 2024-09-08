import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DisponiblesPage } from './disponibles.page';

const routes: Routes = [
  {
    path: '',
    component: DisponiblesPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DisponiblesPageRoutingModule {}
