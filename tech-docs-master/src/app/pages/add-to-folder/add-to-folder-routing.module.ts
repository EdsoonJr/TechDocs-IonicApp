import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AddToFolderPage } from './add-to-folder.page';

const routes: Routes = [
  {
    path: '',
    component: AddToFolderPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AddToFolderPageRoutingModule {}
