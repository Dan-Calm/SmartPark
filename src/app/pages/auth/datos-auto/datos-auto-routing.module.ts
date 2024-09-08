import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DatosAutoPage } from './datos-auto.page';

const routes: Routes = [
  {
    path: '',
    component: DatosAutoPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DatosAutoPageRoutingModule {}
