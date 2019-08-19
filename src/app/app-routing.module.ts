import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {AppRouteInterface} from './app.enum';


const MAINROUTES: AppRouteInterface[] = [
  { path: '', loadChildren: './intro/intro.module#IntroModule'},
  // { path: '**', redirectTo: ''  },

];

@NgModule({
  imports: [RouterModule.forRoot(MAINROUTES, {enableTracing: false})],
  exports: [RouterModule]
})
export class AppRoutingModule { }
