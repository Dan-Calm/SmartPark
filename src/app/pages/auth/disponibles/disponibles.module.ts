import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DisponiblesPageRoutingModule } from './disponibles-routing.module';

import { DisponiblesPage } from './disponibles.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DisponiblesPageRoutingModule
  ],
  declarations: [DisponiblesPage]
})
export class DisponiblesPageModule {}
