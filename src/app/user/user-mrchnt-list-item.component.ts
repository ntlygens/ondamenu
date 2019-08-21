import { Component, OnInit, Input } from '@angular/core';

@Component({
    selector: 'amm-user-mrchnt-list-item',
    template: `
        <div id='baseURL' class='iteminfo gradient d-flex mb-2'>
            <div class='imgPnl even flex-column'>
                <div class='imgStngs'>
                    <img *ngIf='!itemImage' class="rounded logo" src="../../biota/assets/leaf_icon.jpg" />
                    <img class="rounded logo" src="{{itemImage}}" />
                </div>
                <!--<div class='resType'>
                    <p>Egyptian Cuisine</p>
                </div>-->
            </div>

            <section class='cardTxt'>
                <h5 matLine class="card-name">{{itemTitle}}</h5>
                <h5 *ngIf='!itemSlogan' matLine class='card-slogan'>slogan here</h5>
                <h5 matLine class='card-slogan'>{{itemSlogan}}</h5>
                <div class='itemData'>
                    <p *ngIf='!itemPrep' matLine>Vegetarian | Eat In</p>
                    <p matLine class='card-prep'>{{itemPrep}}</p>
                    <!--<p *ngIf='!itemLocZip' matLine>222 St, NY 22222</p>
                    <p matLine class='card-loc'>{{itemLocSt}} {{itemLocState}} {{itemLocZip}}</p>-->
                    <!--<p class="card-text"><small class="text-muted">address</small></p>-->
                </div>
                <div class='statuses'>
                    <p [ngClass]='itemSrvcStat ? "open status" : "closed status"'>open</p>
                    <p [ngClass]='itemDelivery ? "delivery status" : "no-delivery status"'>delivery</p>
                </div>
            </section>
            <div class='imgPnl odd flex-column'>
                <div class='imgStngs'>
                    <img *ngIf='!itemImage' class="rounded logo" src="../../biota/assets/leaf_icon.jpg" />
                    <img class="rounded logo" src="{{itemImage}}" />
                </div>
                <!--<div class='resType'>
                    <p>Polynesian</p>
                </div>-->
            </div>
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
    @Input() itemLocSt = '1 west 435st';
    @Input() itemLocState = 'ME';
    @Input() itemLocZip = '45665';
    @Input() itemDesc = 'Image description goes here';
    @Input() itemFoodType = 'american';
    @Input() itemPrep = [];
    @Input() itemSrvcType = 'eatin';
    @Input() itemSrvcStat = 'closed';
    @Input() itemDelivery = 0;

    constructor() { }

    ngOnInit() {
    }

}

