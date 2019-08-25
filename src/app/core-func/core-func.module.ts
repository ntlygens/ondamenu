import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgMatModule } from '../ng-mat/ng-mat.module';

import { NydohComponent } from './doh/nydoh/nydoh.component';
import { ListItemComponent } from './comps/list-item.component';
import { ListComponent } from './comps/list.component';
import { AdvertComponent } from './comps/advert.component';
import { MenuComponent } from './menu/menu.component';


@NgModule({
    declarations: [NydohComponent, ListItemComponent, ListComponent, AdvertComponent, MenuComponent],
    exports: [
        NydohComponent,
        ListItemComponent,
        ListComponent,
        AdvertComponent,
        MenuComponent,
    ],
    imports: [
        CommonModule,
        NgMatModule
    ]
})
export class CoreFuncModule { }
