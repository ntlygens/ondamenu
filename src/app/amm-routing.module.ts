import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AmmRouteInterface } from './amm.enum';
import { ListComponent } from './core-func/comps/list.component';
import { MenuComponent } from './menu/menu.component';
import { FoodPaymentComponent } from './core-func/comps/food-payment.component';
import { GuiService } from './core-func/srvcs/gui.service';
import {TermsComponent} from './legal/terms.component';
import {PolicyComponent} from './legal/policy.component';

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
    {
        path: 'p',
        component: FoodPaymentComponent,
        data: {
            state: 'PaymentMode',
            animation: 'isLeft'
        },
        outlets: [ 'mainAppRO' ]
    },
    {
        path: 'm',
        loadChildren: './merchant/merchant.module#MerchantModule',
        data: {
            state: 'MerchantMode',
            animation: 'isLeft',
            mobile: GuiService.prototype.isMobileDevice()
        },
        outlets: [ 'mainAppRO' ]
    },
    {
        path: 'eula',
        component: TermsComponent,
        data: {
            state: 'EULA',
            animation: 'isLeft'
        },
        outlets: [ 'mainAppRO' ]
    },
    {
        path: 'privacy',
        component: PolicyComponent,
        data: {
            state: 'Privacy',
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
