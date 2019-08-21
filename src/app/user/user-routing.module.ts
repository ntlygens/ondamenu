import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { UserComponent } from './user.component';
import { UserMrchntListComponent } from './user-mrchnt-list.component';
import { UserMrchntListItemComponent } from './user-mrchnt-list-item.component';

const routes: Routes = [
    {
        path: '',
        component: UserComponent,
        data: { state: 'uSlctMrchntPg1' },
        children: [
            {
                path: '',
                component: UserMrchntListComponent,
                data: { state: 'uSlctMrchntPg2' },
                outlet: 'userRO'
            },
        ]
    },
    {
        path: ':id',
        component: UserComponent,
        data: { state: 'uSlctMenuPg1' },
        children: [
          {
            path: '',
            component: UserMrchntListItemComponent,
              data: { state: 'uSlctMenuPg2' },
              outlet: 'userRO'
          }
        ]
        // TODO: temp - replace with client component below
        // loadChildren: '../client/client.module#ClientModule'
    },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserRoutingModule { }
