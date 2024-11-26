import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MyUploadsPage } from './my-uploads.page';

const routes: Routes = [
  {
    path: '',
    component: MyUploadsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MyUploadsPageRoutingModule {}
