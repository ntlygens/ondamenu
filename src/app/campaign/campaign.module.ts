import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CoreFuncModule } from '../core-func/core-func.module';
import { NgMatModule } from '../ng-mat/ng-mat.module';

import { CampaignRoutingModule } from './campaign-routing.module';
import { PromoCampaignComponent } from './promo-campaign.component';
import { CampaignComponent } from './campaign.component';
import { MarketingCampaignComponent } from './marketing-campaign.component';

@NgModule({
    imports: [
        CommonModule,
        CoreFuncModule,
        CampaignRoutingModule,
        NgMatModule
    ],
    declarations: [
        PromoCampaignComponent,
        CampaignComponent,
        MarketingCampaignComponent
    ],
    exports: [ CampaignComponent ]
})
export class CampaignModule { }
