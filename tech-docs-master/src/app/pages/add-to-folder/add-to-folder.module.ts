import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AddToFolderPageRoutingModule } from './add-to-folder-routing.module';

import { AddToFolderPage } from './add-to-folder.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AddToFolderPageRoutingModule
  ],
  declarations: [AddToFolderPage]
})
export class AddToFolderPageModule {}
