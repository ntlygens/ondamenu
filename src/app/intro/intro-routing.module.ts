import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { IntroComponent } from './intro.component';
import { SignUpComponent } from './sign-up/sign-up.component';
import { ResetPassComponent } from './reset-pass/reset-pass.component';
import { SignInComponent } from './sign-in/sign-in.component';
import { SplashComponent } from './splash/splash.component';

export const routes: Routes = [
    {
        path: '',
        component: IntroComponent,
        children: [
            {
                path: '',
                component: SplashComponent,
                outlet: 'mainRO'
            },
        ]
    },
    {
        path: 'signin',
        component: IntroComponent,
        children: [
            {
                path: '',
                component: SignInComponent,
                outlet: 'mainRO'
            },
        ]
    },
    {
        path: 'signup',
        component: IntroComponent,
        children: [
            {
                path: '',
                component: SignUpComponent,
                outlet: 'mainRO'
            }
        ],

    },
    {
        path: 'reset',
        component: IntroComponent,
        children: [
            {
                path: '',
                component: ResetPassComponent,
                outlet: 'mainRO'
            }
        ],

    },



];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class IntroRoutingModule { }

