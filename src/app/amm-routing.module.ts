import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AmmRouteInterface } from './amm.enum';
import { ListComponent } from './core-func/comps/list.component';
import { MenuComponent } from './menu/menu.component';

const MAINROUTES: AmmRouteInterface[] = [
    {
        path: '',
        loadChildren: './intro/intro.module#IntroModule',
        data: {
            state: 'appIntro',
            animation: 'isLeft'
        },
        outlets: [ 'mainAppRO' ]
    },
    {
        path: 'u',
        component: ListComponent,
        data: {
            state: 'UserMode',
            animation: 'isRight'
        },
        outlets: [ 'mainAppRO' ]

    },
    {
        path: 'c',
        component: MenuComponent,
        data: {
            state: 'ClientMode',
            animation: 'isLeft'
        },
        outlets: [ 'mainAppRO' ]
    },
    { path: '**', redirectTo: '', pathMatch: 'full'}

];

@NgModule({
    imports: [RouterModule.forRoot(MAINROUTES, {enableTracing: false})],
    exports: [RouterModule]
})
export class AmmRoutingModule { }
