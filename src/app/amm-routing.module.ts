import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AmmRouteInterface } from './amm.enum';


const MAINROUTES: AmmRouteInterface[] = [
    {
        path: '',
        loadChildren: './intro/intro.module#IntroModule',
        data: {
            state: 'appIntro',
            animation: 'isLeft'
        }
    },
    {
        path: 'u',
        loadChildren: './user/user.module#UserModule',
        data: {
            state: 'UserMode',
            animation: 'isRight'
        }
    },
    {
        path: 'c',
        loadChildren: './client/client.module#ClientModule',
        data: {
            state: 'ClientMode',
            animation: 'isRight'
        }
    },
    { path: '**', redirectTo: '', pathMatch: 'full'}

];

@NgModule({
    imports: [RouterModule.forRoot(MAINROUTES, {enableTracing: false})],
    exports: [RouterModule]
})
export class AmmRoutingModule { }
