import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { EntradaPatentePage } from './entrada-patente.page';

const routes: Routes = [
  {
    path: '',
    component: EntradaPatentePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EntradaPatentePageRoutingModule {}
