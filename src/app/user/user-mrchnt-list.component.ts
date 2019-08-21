import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MerchantInfoData } from '../amm.enum';
import { LoginService } from '../core-func/srvcs/login.service';

@Component({
    selector: 'amm-user-mrchnt-list',
    template: `
        <div>this works</div>
        <!--<mat-list>
            <mat-list-item
                *ngFor="let merchant of merchants | slice:0:6;
                let idx = index; let even = even; let odd = odd;
                first as isFirst; last as isLast"
            >
                <amm-user-mrchnt-list-item
                    [ngClass]='{ "first" : isFirst, "last" : isLast, "even" : even, "odd" : odd }'
                    [itemID]='merchant.client_id'
                    [itemImage]='merchant.logo'
                    [itemTitle]='merchant.username'
                    [itemSlogan]='merchant.slogan'
                    [itemPhone]='merchant.phone'
                    [itemLocSt]='merchant.address'
                    [itemLocState]='merchant.state'
                    [itemLocZip]='merchant.zip'
                    [itemPrep]='merchant.prep'
                    [itemSrvcType]='merchant.type'
                    [itemSrvcStat]='merchant.status'
                    [itemDelivery]='merchant.delivery'
                    (click)='getMerchantMenu(merchant.client_id, merchant.username)'
                ></amm-user-mrchnt-list-item>

            </mat-list-item>
        </mat-list>-->
    `,
    styles: [`
        /*:host {
            width: 100%;
            max-width: 420px;
        }

        .ammHeader {
            justify-content: space-between;
        }

        .logo {
            height: 100%;
            width: 100%;
        }

        .example-card {
            width: 400px;
            max-width: 100%;
        }
        .example-card:hover {
            background-color: aqua;
        }

        .example-card:active {
            background-color: blue;
        }

        .example-header-image {
            background-image: url('../../biota/assets/imgs/default_user.jpg');
            background-size: cover;
        }

        .mat-list {
            padding: 0.75rem;
        }

        .mat-list .mat-list-item {
            min-height: 90px;
            height: auto;
        }

        .first {
            margin-top: 100px;
        }

        .last {
            margin-bottom: 15%;
        }

        .imgStngs {
            width: 125px;
            height: 75px;
            border: #8c8c8c 1px solid;
            margin-top: -6%;
            margin-left: -5%;
            border-radius: 13px !important;
            overflow: hidden;
            object-fit: contain;
            background-size: contain;
        }*/
    `]
})
export class UserMrchntListComponent implements OnInit {
    merchants: MerchantInfoData;
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
        this.ls.getAllMerchants().subscribe(
            (res: MerchantInfoData) => {
                this.merchants = res;
                console.log('load eg: ', JSON.stringify(this.merchants[0].address));
            },
            (err) => {
                console.log('userMrchntList_Error: ', err);
            },
            () => {
                console.log('get Merchant List Complete');
            }
        );
    }

    getMerchantMenu(clientid: string, clientname: string) {
        this.router.navigate( [ clientname], {relativeTo: this.route, queryParams: {clid: clientid}} );
        console.log('cID: ', clientid, ' cName: ', clientname);
    }

}
