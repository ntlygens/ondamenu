import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AmmRouteInterface } from './amm.enum';
import { ListComponent } from './core-func/comps/list.component';
import { MenuComponent } from './menu/menu.component';
import { PromoCampaignComponent } from './campaign/promo-campaign.component';
import { FoodPaymentComponent } from './core-func/comps/food-payment.component';
import { GuiService } from './core-func/srvcs/gui.service';
import { TermsComponent } from './legal/terms.component';
import { PolicyComponent } from './legal/policy.component';

const MAINROUTES: AmmRouteInterface[] = [
    {
        path: '',
        loadChildren: () => import('./intro/intro.module').then(
            module => module.IntroModule
        ),
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
        loadChildren: () => import('./merchant/merchant.module').then(
            module => module.MerchantModule
        ),
        data: {
            state: 'MerchantMode',
            animation: 'isLeft',
            mobile: GuiService.prototype.isMobileDevice()
        },
        outlets: [ 'mainAppRO' ]
    },
    {
        path: 'campaign',
        loadChildren: () => import('./campaign/campaign.module').then(
            module => module.CampaignModule
        ),
        data: {
            state: 'CampaignMode',
            animation: 'isLeft'
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
    exports: [RouterModule],
    imports: [RouterModule.forRoot(MAINROUTES,
        {enableTracing: false})]
})
export class AmmRoutingModule { }
