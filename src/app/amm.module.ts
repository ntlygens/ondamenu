import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { AmmRoutingModule } from './amm-routing.module';

import { CoreFuncModule } from './core-func/core-func.module';
import { NgMatModule } from './ng-mat/ng-mat.module';
// import { ScrollingModule } from '@angular/cdk/scrolling';
import { PortalModule } from '@angular/cdk/portal';

import { IntroModule } from './intro/intro.module';
import { MerchantModule } from './merchant/merchant.module';

import { AmmComponent } from './amm.component';
import { HeaderBarComponent } from './core-func/comps/header-bar.component';
import { HeaderLogoComponent } from './core-func/comps/header-logo.component';
import { FooterBarComponent } from './core-func/comps/footer-bar.component';
import { ProfileComponent } from './core-func/comps/profile.component';
import { FoodCartComponent } from './core-func/comps/food-cart.component';
import { CartItemComponent } from './core-func/comps/cart-item.component';
import { CartService } from './core-func/srvcs/cart.service';
import { PlateItemComponent } from './core-func/comps/plate-item.component';
import { FoodPaymentComponent } from './core-func/comps/food-payment.component';
import { TermsComponent } from './legal/terms.component';
import { PolicyComponent } from './legal/policy.component';

@NgModule({
    declarations: [
        AmmComponent,
        HeaderBarComponent,
        HeaderLogoComponent,
        FooterBarComponent,
        ProfileComponent,
        FoodCartComponent,
        CartItemComponent,
        PlateItemComponent,
        FoodPaymentComponent,
        TermsComponent,
        PolicyComponent,
    ],
    imports: [
        CommonModule,
        BrowserModule,
        BrowserAnimationsModule,
        RouterModule,
        HttpClientModule,
        TranslateModule.forRoot({
            loader: {
                provide: TranslateLoader,
                useFactory: HttpLoaderFactory,
                deps: [HttpClient]
            }
        }),
        FormsModule,
        ReactiveFormsModule,
        AmmRoutingModule,
        CoreFuncModule,
        NgMatModule,
        // ScrollingModule,
        PortalModule,
        IntroModule,
        MerchantModule

    ],
    providers: [
        CartService
    ],
    entryComponents: [
        ProfileComponent,
        FoodCartComponent,
        CartItemComponent,
        PlateItemComponent,
        FoodPaymentComponent,
    ],
    bootstrap: [AmmComponent]
})
export class AmmModule { }

export function HttpLoaderFactory(http: HttpClient) {
    return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

