import {Component, ElementRef, OnInit} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MerchantInfoData } from '../../amm.enum';
import { LoginService } from '../srvcs/login.service';
import { StorageService } from '../srvcs/storage.service';
import { GuiService } from '../srvcs/gui.service';

@Component({
    selector: 'amm-list',
    template: `
<!--
        <amm-advert [crntPg]="crntPage" ></amm-advert>
-->
        <mat-list>
            <mat-list-item
                *ngFor="let merchant of merchants;
                    let idx = index; let even = even; let odd = odd;
                    first as isFirst; last as isLast"
            >
                <amm-list-item
                    [ngClass]='{ "first" : isFirst, "last" : isLast }'
                    [itemGrade]='merchant.grade'
                    [itemID]='merchant.client_id'
                    [itemImage]='merchant.logo'
                    [itemTitle]='merchant.username'
                    [itemSlogan]='merchant.slogan'
                    [itemPhone]='merchant.phone'
                    [itemBio]="merchant.bio"
                    [itemLocSt]='merchant.address'
                    [itemLocState]='merchant.state'
                    [itemLocZip]='merchant.zip'
                    [itemSrvcType]='merchant.concept'
                    [itemSrvcStat]='merchant.loc_status'
                    [itemFoodType]='merchant.food'
                    [itemDelivery]='merchant.delivery'
                    (click)='getMerchantMenu(merchants[idx])'
                ></amm-list-item>

            </mat-list-item>
        </mat-list>
    `,
    styles: [`
        :host {
            position: relative;
            top: 90px;
            width: 100%;
            max-width: 420px;
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
export class ListComponent implements OnInit {
    merchants: MerchantInfoData[] = [];
    crntPage = 'the crnt page';
    constructor(
        private ls: LoginService,
        private ss: StorageService,
        private gs: GuiService,
        private router: Router,
        private route: ActivatedRoute,
        private elemRef: ElementRef,
    ) {
        this.elemRef.nativeElement.setAttribute('id',  'merchantList');
        this.gs.setStartPg(false);
    }

    ngOnInit() {
        this.getMerchantsList();
    }

    getMerchantsList() {
        this.ls.getAllMerchants().then(
            (res: MerchantInfoData[]) => {
                this.merchants = res;
                // console.log('load eg: ', JSON.stringify(this.merchants[0]));
            },
            (err) => {
                // console.log('userMrchntList_Error: ', err);
            }
        );
    }

    getMerchantMenu(merchant: MerchantInfoData) {
        this.ss.setBannerData({
            client_id: merchant.client_id,
            grade: merchant.grade,
            username: merchant.username,
            logo: merchant.logo,
            phone: merchant.phone,
            slogan: merchant.slogan,
            food: merchant.food,
            concept: merchant.concept,
            delivery: merchant.delivery
        });

        this.router.navigate( [ '/c/'], {queryParams: {clid: merchant.client_id}} );
        // console.log('cID: ', merchant.client_id, ' cName: ', merchant.username);
    }

}
