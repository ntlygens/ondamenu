import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AmmRouteInterface } from './amm.enum';


const MAINROUTES: AmmRouteInterface[] = [
    { path: '', loadChildren: './intro/intro.module#IntroModule'},
    { path: 'u', loadChildren: './user/user.module#UserModule'},
    /*{ path: 'u', loadChildren: './user/user.module#UserModule'},*/
    { path: '**', redirectTo: '', pathMatch: 'full'}

];

@NgModule({
    imports: [RouterModule.forRoot(MAINROUTES, {enableTracing: false})],
    exports: [RouterModule]
})
export class AmmRoutingModule { }
