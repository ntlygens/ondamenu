import {Component, OnInit, QueryList} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MerchantInfoData } from '../../amm.enum';
import { LoginService } from '../srvcs/login.service';
import {HttpParams} from '@angular/common/http';

@Component({
    selector: 'amm-list',
    template: `
        <amm-advert [crntPg]="crntPage" ></amm-advert>
        <mat-list>
            <mat-list-item
                *ngFor="let merchant of merchants;
                    let idx = index; let even = even; let odd = odd;
                    first as isFirst; last as isLast"
            >
                <amm-list-item
                    [ngClass]='{ "first" : isFirst, "last" : isLast }'
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
                    [itemSrvcStat]='merchant.status'
                    [itemFoodType]='merchant.food'
                    [itemDelivery]='merchant.delivery'
                    (click)='getMerchantMenu(merchants[idx])'
                ></amm-list-item>

            </mat-list-item>
        </mat-list>
    `,
    styles: [`
        :host {
            width: 100%;
            max-width: 420px;
        }

        .last {
            margin-bottom: 15%;
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
        private router: Router,
        private route: ActivatedRoute
    ) {
        this.getMerchantsList();
    }

    ngOnInit() {
    }

    getMerchantsList() {
        this.ls.getAllMerchants().then(
            (res: MerchantInfoData[]) => {
                this.merchants = res;
                console.log('load eg: ', JSON.stringify(this.merchants[0]));
            },
            (err) => {
                console.log('userMrchntList_Error: ', err);
            }
        );
    }

    getMerchantMenu(merchant: MerchantInfoData) {
        const mprms = {
            cid: merchant.client_id,
            cnm: merchant.username,
            img: merchant.logo,
            phn: merchant.phone,
            slg: merchant.slogan,
            cfd: merchant.food,
            cpt: merchant.concept,
            del: merchant.delivery
        };

        this.router.navigate( [ '/c/'], {queryParams: mprms} );
        console.log('cID: ', merchant.client_id, ' cName: ', merchant.username);
    }

}
