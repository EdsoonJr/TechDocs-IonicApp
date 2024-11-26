import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MyUploadsPageRoutingModule } from './my-uploads-routing.module';

import { MyUploadsPage } from './my-uploads.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MyUploadsPageRoutingModule
  ],
  declarations: [MyUploadsPage]
})
export class MyUploadsPageModule {}
