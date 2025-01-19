import { Component, OnInit, Input } from '@angular/core';
import { lift } from '../animations/animations.component';

@Component({
    selector: 'amm-list-item',
    template: `
        <div class="dohSrvcs" [@mnmzeDohAnimations]="itemUIToggle">
            <amm-nydoh
                [merchantGrade]="itemGrade"
                [merchantID]="itemID"
            ></amm-nydoh>
        </div>
        <div class='imgStngs' [@mnmzeImgAnimations]="itemUIToggle">
            <img *ngIf='!itemImage' class="rounded logo" src="assets/core-assets/escovich.png" />
            <img class="rounded logo" src="{{itemImage}}" />
        </div>
        <!--<div id='baseURL' class='iteminfo gradient d-flex' >-->
        <div id='baseURL' class='iteminfo gradient d-flex' [@mnmzeAnimations]="itemUIToggle">
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
    styles: [`
        @media screen and (max-width: 375px) {
            /*.iteminfo {
                !*width: 363px;*!
            }
            .statuses {
                padding-top: 7%;
            }
            .dohSrvcs {
                position: absolute;
                text-align: center;
                margin-top: 10px;
                right: 7%;
            }*/
            :host {
                display: block;
                width: 100%;
                height: 200px;
                margin-bottom: 9px;
            }
        }

        @media screen and (min-width: 376px) and (max-width: 765px) {
            :host {
                display: block;
                width: 100%;
                height: 200px;
                margin-bottom: 9px;
            }
            /*.iteminfo {
                !*width: 400px;*!
            }
            .statuses {
                padding-top: 6%;
            }
            .dohSrvcs {
                position: absolute;
                text-align: center;
                margin-top: 10px;
                right: 7%;
                z-index: 4;
                top: 0px;
            }

            .dohmini {
                top: 82px;
                right: 130px;
            }
            .imgStngsmini {
                top: -148px;
            }

            .iteminfomini {
                top: -218px;
            }*/

        }

        @media screen and (min-width: 768px) {
            :host {
                display: block;
                width: 60%;
                height: 210px;
                /* margin-bottom: 9px;*/
            }
        }

        /* HOST CSS STYLES */
        /* =============== */

        :host .gradient {
            background-image: linear-gradient(to top, rgba(255,255,255,1), rgba(255,255,255,0.85));
        }

        :host .itemData {
            color: #BB3523;
            font-style: italic;
        }

        /*:host.odd .odd, :host.even .even {
            display: block;
            height: 100%;

        }*/
        /*// ---------- //*/

        p {
            margin: 0;
        }

        button {
            z-index: 3;
        }

        .imgPnl {
            display: none;
        }

        .card-prep {
            text-transform: capitalize;
        }

        .statuses {
            display: inline-flex;
            position: relative;
            font-size: 14px;
        }

        .status {
            width: fit-content;
            color: #333;
            font-style: oblique;
            padding: 3px 8px;
            -webkit-border-radius: 3px;
            -moz-border-radius: 3px;
            border-radius: 3px;
            text-transform: capitalize;
        }

        .open {
            background: #7ED321;;
            color: #0E499A;
        }

        .closed {
            background: #ddd;
            color: #333;
            text-decoration: line-through;
            text-decoration-style: wavy;
            text-decoration-color: #ea6a5e;
        }

        .delivery {
            background: #0E499A;
            color: #fff;

        }

        .no-delivery {
            background: #ddd;
            color: #333;
            text-decoration: line-through;
            text-decoration-style: wavy;
            text-decoration-color: #ea6a5e;
        }


        /*// ------------- //*/

        .iteminfo {
            padding: 10px;
            margin: auto;
            justify-content: space-between;
            /*z-index: 3;*/
            position: relative;
            top: -68px;
            /* box-shadow: 0px -1px 4px 0px; */
            border-top: 2px solid #fff;
            border-bottom-right-radius: 5px;
            border-bottom-left-radius: 5px;
        }

        .imgStngs {
            height: 200px;
            position: relative;

            border-radius: 0.3rem;
            overflow: hidden;
            object-fit: contain;
            background-size: contain;
            top: 0;
        }

        .logo {
            height: auto;
            width: 100%;
        }

        .cardTxt {
            position: relative;
            color: slategrey;
            /*margin: 0 3%;
            line-height: 21px;*/
        }


        /*// ---------- //*/

        .card-name {
            margin-bottom: 0px;
            color: #2c2d38;
            text-transform: capitalize;
        }

        .card-slogan {
            font-variant: all-small-caps;
            margin-bottom: 0;
        }

        .card-phone {
            color: #333;
        }

        .display-4 {
            color: #E04946;
        }

        h4 {
            color: slategray;
        }

        .btn::after {
            content: '...';
        }

        .fullImg {
            height: 275px;
        }


    `],
    animations: [ lift ]
})
export class ListItemComponent implements OnInit {
    @Input() itemID = 'defaultID';
    @Input() itemGrade;
    @Input() itemImage = 'assets/core-assets/placeholder1.jpg';
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
    @Input() itemDelivery = 'false';
    @Input() itemUIToggle = 'normal';

    constructor() { }

    ngOnInit() {
        // console.log('my camis = ', this.camis);
    }

}
