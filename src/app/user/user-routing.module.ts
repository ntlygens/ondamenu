import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AmmRouteInterface } from '../amm.enum';

import { UserComponent } from './user.component';
import { UserMrchntListComponent } from './user-mrchnt-list.component';
// import { UserMrchntListItemComponent } from './user-mrchnt-list-item.component';

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
    /*{
        path: '',
        loadChildren: '../menu/menu.module#ClientModule',
        data: {
            state: 'userere',
            animation: 'isLeft'
        }
        // TODO: temp - replace with menu component below
        // loadChildren: '../menu/menu.module#ClientModule'
    },*/
];

@NgModule({
    imports: [RouterModule.forChild(USERROUTES)],
    exports: [RouterModule]
})
export class UserRoutingModule { }
