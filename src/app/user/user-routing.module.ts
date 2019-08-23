import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AmmRouteInterface } from '../amm.enum';

import { UserComponent } from './user.component';
import { UserMrchntListComponent } from './user-mrchnt-list.component';
import { UserMrchntListItemComponent } from './user-mrchnt-list-item.component';

const USERROUTES: AmmRouteInterface[] = [
    {
        path: '',
        component: UserComponent,
        data: {
            state: 'user112',
            animation: 'isRight'
        },
        children: [
            {
                path: '',
                component: UserMrchntListComponent,
                outlet: 'userRO'
            },
        ]
    },
    {
        path: ':id',
        loadChildren: '../client/client.module#ClientModule',
        data: {
            state: 'userere',
            animation: 'isLeft'
        }
        // TODO: temp - replace with client component below
        // loadChildren: '../client/client.module#ClientModule'
    },
];

@NgModule({
    imports: [RouterModule.forChild(USERROUTES)],
    exports: [RouterModule]
})
export class UserRoutingModule { }
