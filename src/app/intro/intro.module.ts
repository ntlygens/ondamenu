import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CoreFuncModule } from '../core-func/core-func.module';
import { NgMatModule } from '../ng-mat/ng-mat.module';


import { IntroRoutingModule } from './intro-routing.module';
import { SplashComponent } from './splash/splash.component';
import { SignInComponent } from './sign-in/sign-in.component';
import { IntroComponent } from './intro.component';
import { SignUpComponent } from './sign-up/sign-up.component';
import { ResetPassComponent } from './reset-pass/reset-pass.component';

@NgModule({
    imports: [
        CommonModule,
        IntroRoutingModule,
        FormsModule,
        ReactiveFormsModule,
        CoreFuncModule,
        NgMatModule
    ],
    declarations: [IntroComponent, SplashComponent, SignInComponent, SignUpComponent, ResetPassComponent],
    exports: [ IntroComponent ]
})
export class IntroModule { }

