import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PagoTicketPageRoutingModule } from './pago-ticket-routing.module';

import { PagoTicketPage } from './pago-ticket.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PagoTicketPageRoutingModule
  ],
  declarations: [PagoTicketPage]
})
export class PagoTicketPageModule {}
