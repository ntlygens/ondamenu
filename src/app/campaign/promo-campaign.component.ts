import {Component, ElementRef, OnInit} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MerchantInfoData } from '../amm.enum';
import { LoginService } from '../core-func/srvcs/login.service';
import { StorageService } from '../core-func/srvcs/storage.service';
import { GuiService } from '../core-func/srvcs/gui.service';

@Component({
    selector: 'amm-promo-campaign',
    template: `
        <mat-list>
            <mat-list-item>
                <amm-list-item
                    [itemGrade]='campaign.grade'
                    [itemID]='campaign.client_id'
                    [itemImage]='campaign.logo'
                    [itemTitle]='campaign.username'
                    [itemSlogan]='campaign.slogan'
                    [itemPhone]='campaign.phone'
                    [itemBio]="campaign.bio"
                    [itemLocSt]='campaign.address'
                    [itemLocState]='campaign.state'
                    [itemLocZip]='campaign.zip'
                    [itemSrvcType]='campaign.concept'
                    [itemSrvcStat]='campaign.loc_status'
                    [itemFoodType]='campaign.food'
                    [itemDelivery]='campaign.delivery'
                    (click)='getMerchantMenu(campaign)'
                ></amm-list-item>

            </mat-list-item>
        </mat-list>
        <amm-advert [crntPg]="crntPage" [promoImage]="campaign.promo" (click)='getMerchantMenu(campaign)'></amm-advert>
    `,
    styles: [`
        :host {
            position: relative;
            top: 70px;
            width: 100%;
            max-width: 420px;
        }
        :host .dohSrvcs {
            margin-top: 60px !important;
        }

        @media screen and (min-width: 768px) {
            .mat-list .mat-list-item {
                margin: 1% auto;
            }
        }

        .last {
            margin-bottom: 35%;
        }

        .mat-list .mat-list-item {
            min-height: 60px;
            height: auto;
        }

    `]
})
export class PromoCampaignComponent implements OnInit {
    campaign: MerchantInfoData;
    crntPage = 'the promo page';
    dCLID: any;
    constructor(
        private ls: LoginService,
        private ss: StorageService,
        private gs: GuiService,
        private router: Router,
        private route: ActivatedRoute,
        private elemRef: ElementRef,
    ) {
        this.elemRef.nativeElement.setAttribute('id',  'merchantCampaign_' + `${this.dCLID}`);
        this.gs.setStartPg(false);
        console.log('elem: ', route.snapshot.queryParams.clid);
        this.dCLID = this.route.snapshot.queryParams.clid;
    }

    ngOnInit() {
        this.getPromoCampaign(`${this.dCLID}`);
    }

    getPromoCampaign(arg) {
        this.ls.getMerchantPromoCampaign(`${arg}`).then(
            (res: MerchantInfoData) => {
                this.campaign = res;
                // console.log('load eg: ', JSON.stringify(this.campaigns[0]));
                // this.getMerchantMenu();
            },
            (err) => {
                // console.log('userMrchntList_Error: ', err);
            }
        );
    }

    getMerchantMenu(campaign: MerchantInfoData) {
        this.ss.setBannerData({
            client_id: campaign.client_id,
            grade: campaign.grade,
            username: campaign.username,
            logo: campaign.logo,
            phone: campaign.phone,
            slogan: campaign.slogan,
            food: campaign.food,
            concept: campaign.concept,
            delivery: campaign.delivery
        });

        this.router.navigate( [ '/c/'], {queryParams: {clid: campaign.client_id}} );
        // console.log('cID: ', campaign.client_id, ' cName: ', campaign.username);
    }

}
