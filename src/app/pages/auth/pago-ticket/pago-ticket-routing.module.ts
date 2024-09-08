import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PagoTicketPage } from './pago-ticket.page';

const routes: Routes = [
  {
    path: '',
    component: PagoTicketPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PagoTicketPageRoutingModule {}
