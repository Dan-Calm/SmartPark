import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AdminDisponiblesPageRoutingModule } from './admin-disponibles-routing.module';

import { AdminDisponiblesPage } from './admin-disponibles.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AdminDisponiblesPageRoutingModule
  ],
  declarations: [AdminDisponiblesPage]
})
export class AdminDisponiblesPageModule {}
