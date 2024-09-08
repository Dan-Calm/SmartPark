import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AdminStatsPageRoutingModule } from './admin-stats-routing.module';

import { AdminStatsPage } from './admin-stats.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AdminStatsPageRoutingModule
  ],
  declarations: [AdminStatsPage]
})
export class AdminStatsPageModule {}
