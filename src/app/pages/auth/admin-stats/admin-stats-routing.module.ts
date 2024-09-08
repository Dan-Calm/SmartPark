import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AdminStatsPage } from './admin-stats.page';

const routes: Routes = [
  {
    path: '',
    component: AdminStatsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminStatsPageRoutingModule {}
