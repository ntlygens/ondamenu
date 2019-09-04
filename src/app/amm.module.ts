import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { AmmRoutingModule } from './amm-routing.module';

import { CoreFuncModule } from './core-func/core-func.module';
import { NgMatModule } from './ng-mat/ng-mat.module';

import { IntroModule } from './intro/intro.module';

import { AmmComponent } from './amm.component';
import { HeaderBarComponent } from './core-func/comps/header-bar.component';
import { HeaderLogoComponent } from './core-func/comps/header-logo.component';
import { FooterBarComponent } from './core-func/comps/footer-bar.component';

@NgModule({
    declarations: [
        AmmComponent,
        HeaderBarComponent,
        HeaderLogoComponent,
        FooterBarComponent
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        RouterModule,
        HttpClientModule,

        AmmRoutingModule,
        CoreFuncModule,
        NgMatModule,
        IntroModule,

    ],
    providers: [],
    bootstrap: [AmmComponent]
})
export class AmmModule { }
