import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ClientContainerComponent } from './client-container.component';
import { ClientComponent } from './client.component';
import { AmmRouteInterface } from '../amm.enum';


const CLIENTROUTES: AmmRouteInterface[] = [
    {
        path: '',
        component: ClientContainerComponent,
        children: [
            {
                path: '',
                component: ClientComponent,
                outlet: 'clientRO'
            }
        ]
    }
];

@NgModule({
  imports: [RouterModule.forChild(CLIENTROUTES)],
  exports: [RouterModule]
})
export class ClientRoutingModule { }
