import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DatosAutoPageRoutingModule } from './datos-auto-routing.module';

import { DatosAutoPage } from './datos-auto.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DatosAutoPageRoutingModule
  ],
  declarations: [DatosAutoPage]
})
export class DatosAutoPageModule {}
