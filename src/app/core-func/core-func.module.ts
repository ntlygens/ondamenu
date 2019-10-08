import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgMatModule } from '../ng-mat/ng-mat.module';

import { NydohComponent } from './doh/nydoh/nydoh.component';
import { ListItemComponent } from './comps/list-item.component';
import { ListComponent } from './comps/list.component';
import { AdvertComponent } from './comps/advert.component';
import { MenuComponent } from '../menu/menu.component';
import { CategoryBtnComponent } from './comps/category-btn.component';
import { MenuItemComponent } from './comps/menu-item.component';
import { CategoryListComponent } from './comps/category-list.component';
import { FoodOrderComponent } from './comps/food-order.component';
// import { FoodCartComponent } from './comps/food-cart.component';
import { FoodPaymentComponent } from './comps/food-payment.component';
import { CloverUserPrice, CloverDbPrice } from './price-change.pipe';
import {ScrollingModule} from '@angular/cdk/scrolling';
import { FoodCartUiComponent } from './comps/food-cart-ui.component';
// import { PlateItemComponent } from './comps/plate-item.component';
// import { CartItemComponent } from './comps/cart-item.component';


@NgModule({
    declarations: [
        NydohComponent,
        ListItemComponent,
        ListComponent,
        AdvertComponent,
        MenuComponent,
        CategoryBtnComponent,
        MenuItemComponent,
        CategoryListComponent,
        FoodOrderComponent,
        // FoodCartComponent,
        FoodPaymentComponent,
        CloverUserPrice,
        CloverDbPrice,
        FoodCartUiComponent,
        // PlateItemComponent,
        // CartItemComponent
    ],
    exports: [
        NydohComponent,
        ListItemComponent,
        ListComponent,
        AdvertComponent,
        MenuComponent,
        FoodOrderComponent,
        CloverUserPrice,
        FoodCartUiComponent,
        // CartItemComponent,
    ],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        ScrollingModule,
        NgMatModule
    ]
})
export class CoreFuncModule { }
