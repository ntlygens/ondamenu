import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgMatModule } from '../ng-mat/ng-mat.module';

import { MerchantRoutingModule } from './merchant-routing.module';
import { MerchantComponent } from './merchant.component';
import { MerchantProfileComponent } from './merchant-profile/merchant-profile.component';
import { MerchantShoppingComponent } from './merchant-shopping/merchant-shopping.component';
import { MerchantMerchandiseComponent } from './merchant-merchandise/merchant-merchandise.component';
import { MerchantSplashComponent } from './merchant-splash.component';


@NgModule({
    declarations: [
        MerchantComponent,
        MerchantProfileComponent,
        MerchantShoppingComponent,
        MerchantMerchandiseComponent,
        MerchantSplashComponent
    ],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        NgMatModule,
        MerchantRoutingModule
    ]
})
export class MerchantModule { }
