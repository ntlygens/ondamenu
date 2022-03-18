import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CampaignComponent } from './campaign.component';
import { PromoCampaignComponent } from './promo-campaign.component';
import { MarketingCampaignComponent } from './marketing-campaign.component';

export const routes: Routes = [
    {
        path: '',
        component: CampaignComponent,
        children: [
            {
                path: '',
                component: PromoCampaignComponent,
                outlet: 'campaignRO'
            }
        ]
    },
    {
        path: 'm',
        component: CampaignComponent,
        children: [
            {
                path: '',
                component: MarketingCampaignComponent,
                outlet: 'campaignRO'
            }
        ]
    }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CampaignRoutingModule { }
