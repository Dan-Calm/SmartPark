import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { EntradaPatentePageRoutingModule } from './entrada-patente-routing.module';

import { EntradaPatentePage } from './entrada-patente.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    EntradaPatentePageRoutingModule
  ],
  declarations: [EntradaPatentePage]
})
export class EntradaPatentePageModule {}
