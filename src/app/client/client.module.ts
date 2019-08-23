import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ClientRoutingModule } from './client-routing.module';
import { ClientComponent } from './client.component';
import { ClientContainerComponent } from './client-container.component';


@NgModule({
  declarations: [ClientComponent, ClientContainerComponent],
  imports: [
    CommonModule,
    ClientRoutingModule
  ]
})
export class ClientModule { }
