import { Component, OnInit, Input } from '@angular/core';

@Component({
    selector: 'amm-user-mrchnt-list-item',
    template: `
        <div class="dohSrvcs">
            <amm-nydoh></amm-nydoh>
        </div>
        <div class='imgPnl even flex-column'>
            <div class='imgStngs'>
                <img *ngIf='!itemImage' class="rounded logo" src="../../assets/core-assets/escovich.png" />
                <img class="rounded logo" src="{{itemImage}}" />
            </div>
            <!--<div class='resType'>
                <p>Egyptian Cuisine</p>
            </div>-->
        </div>
        <div class='imgPnl odd flex-column'>
            <div class='imgStngs'>
                <img *ngIf='!itemImage' class="rounded logo" src="../../assets/core-assets/escovich.png" />
                <img class="rounded logo" src="{{itemImage}}" />
            </div>
            <!--<div class='resType'>
                <p>Polynesian</p>
            </div>-->
        </div>
        <div id='baseURL' class='iteminfo gradient d-flex'>
            <section class='cardTxt d-flex w-100 justify-content-between'>
                <div class="">
                    <h5 matLine class="card-name">{{itemTitle}}</h5>
                    <!--<h5 *ngIf='!itemSlogan' matLine class='card-slogan'>slogan here</h5>
                    <h5 matLine class='card-slogan'>{{itemSlogan}}</h5>-->
                    <div class='itemData'>
                        <p *ngIf='!itemFoodType' matLine>Vegetarian | Eat In</p>
                        <p *ngIf='itemFoodType' matLine class='card-prep'>{{itemFoodType}} | {{itemSrvcType}}</p>
                        <!--<p *ngIf='!itemLocZip' matLine>222 St, NY 22222</p>
                        <p matLine class='card-loc'>{{itemLocSt}} {{itemLocState}} {{itemLocZip}}</p>-->
                        <!--<p class="card-text"><small class="text-muted">address</small></p>-->
                    </div>
                </div>
                <div class='statuses'>
                    <p [ngClass]='!itemSrvcStat ? "open status" : "closed status"'>open</p>
                    <p [ngClass]='itemDelivery ? "delivery status" : "no-delivery status"'>delivery</p>
                </div>
            </section>
        </div>

      `,
    styleUrls: [ './user-mrchnt-list-item.scss']
})
export class UserMrchntListItemComponent implements OnInit {
    @Input() itemID = 'defaultID';
    @Input() itemImage = 'biota/assets/imgs/placeholder2.jpg';
    @Input() itemTitle = 'Item Title';
    @Input() itemSlogan = 'Item Slogan';
    @Input() itemPhone = '000-000-0000';
    @Input() itemBio = 'Image description goes here';
    @Input() itemLocSt = '1 west 435st';
    @Input() itemLocState = 'ME';
    @Input() itemLocZip = '45665';
    @Input() itemFoodType = 'american';
    @Input() itemSrvcType = 'eatin';
    @Input() itemSrvcStat = 'closed';
    @Input() itemDelivery = 0;

    constructor() { }

    ngOnInit() {
    }

}

