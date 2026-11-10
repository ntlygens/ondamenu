import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MerchantComponent } from './merchant.component';
import { MerchantSplashComponent} from './merchant-splash.component';

import { MerchantProfileComponent } from './merchant-profile/merchant-profile.component';
import { MerchantMerchandiseComponent } from './merchant-merchandise/merchant-merchandise.component';
import { MerchantShoppingComponent } from './merchant-shopping/merchant-shopping.component';

const routes: Routes = [
    {
        path: '',
        component: MerchantComponent,
        data: {
            state: 'merchant'
        },
        children: [
            {
                path: '',
                component: MerchantSplashComponent,
                data: { state: 'merchantSplash' },
                outlet: 'merchantRO'
            },
        ]
    },
    {
        path: 'profile',
        component: MerchantComponent,
        data: {
            state: 'profile'
        },
        children: [
            {
                path: '',
                component: MerchantProfileComponent,
                outlet: 'merchantRO'

            },
        ],

    },
    {
        path: 'merchandise',
        component: MerchantComponent,
        data: {
            state: 'merchandise'
        },
        children: [
            {
                path: '',
                component: MerchantMerchandiseComponent,
                outlet: 'merchantRO'

            }
        ],

    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class MerchantRoutingModule { }
