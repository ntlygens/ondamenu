import { Component, OnInit, Input, Output, EventEmitter, AfterViewInit, ElementRef } from '@angular/core';

@Component({
    selector: 'amm-menu-item',
    template: `
                    <div *ngIf="isEven" class="menuItem d-flex">
                        <div class="miDesc">
                            <h6>{{miName}}</h6>
                            <p>{{miDesc}}</p>
                        </div>
                        <div class="miPrice col-sm">
                            <div class="rounded">{{miPrice * count | cloverUserPrice}}</div>
                            <div class='cta_btns flex-column'>
                                <div *ngIf='miIncr' [ngClass]='itemCounter ? "itemCounter" : "off"'>
                                    <button mat-raised-button class='btn btn-info btn-sm' [disabled]='this.count < 2' (click)="this.count = (this.count - 1)">
                                        <mat-icon>expand_more</mat-icon>
                                    </button>
                                    {{count}}
                                    <button mat-raised-button class='btn btn-outline-info btn-sm' [disabled]='this.count > 9' (click)="this.count = (this.count + 1)">
                                        <mat-icon>expand_less</mat-icon>
                                    </button>
                                </div>

                                <amm-food-order [title]="miID" [isIncremental]='miIncr' [itemCount]='this.count' id="orderBtn" #orderBtn (toggleIncr)='toggleCounter()' (rmvBtn_emitter)='send4Removal($event)' [prodname]="miName" [prodid]="miID" [prodprice]="miPrice"></amm-food-order>
                            </div>
                        </div>
                        <div class="miPic rounded" [ngStyle]="{'background-image': 'url(' + this.miPic + ')'}"></div>
                    </div>

                    <div *ngIf="!isEven" class="menuItem d-flex">
                        <div class="miPic rounded" [ngStyle]="{'background-image': 'url(' + this.miPic + ')'}"></div>
                        <div class="miPrice col-sm">
                            <div class="rounded">{{miPrice * count | cloverUserPrice}}</div>
                            <div class='cta_btns flex-column'>
                                <div *ngIf='miIncr' [ngClass]='itemCounter ? "itemCounter" : "off"'>
                                    <button mat-raised-button class='btn btn-info btn-sm' [disabled]='this.count < 2' (click)="this.count = (this.count - 1)">
                                        <mat-icon>expand_more</mat-icon>
                                    </button>
                                    {{count}}
                                    <button mat-raised-button class='btn btn-outline-info btn-sm' [disabled]='this.count > 9' (click)="this.count = (this.count + 1)">
                                        <mat-icon>expand_less</mat-icon>
                                    </button>
                                </div>

                                <amm-food-order [title]="miID" [isIncremental]='miIncr' [itemCount]='this.count' id="orderBtn" #orderBtn (toggleIncr)='toggleCounter()' (rmvBtn_emitter)='send4Removal($event)' [prodname]="miName" [prodid]="miID" [prodprice]="miPrice"></amm-food-order>
                            </div>
                        </div>
                        <div class="miDesc">
                            <h6>{{miName}}</h6>
                            <p>{{miDesc}}</p>
                        </div>
                    </div>

                  `,
    styles: [`
                    :host {

                    }

                    :host.last .menuItem {
                        margin-bottom: 60px;
                    }

                    :host.odd .menuItem {
                        background: linear-gradient(to bottom left, rgba(255,255,255,0.95), rgba(255,255,255,0.125));
                    }

                    :host.odd .miPic {
                        -webkit-box-shadow: 1px 2px 3px 0px #333; -moz-box-shadow: 1px 2px 3px 0px #333; box-shadow: 1px 2px 3px 0px #333;
                    }

                    :host.odd .miDesc {
                        text-align: left;
                        padding-right: 4px;
                    }

                    /*:host.odd .miPrice .rounded {
                        box-shadow: 0px 1px 4px 0px #454545;
                    }*/

                    /* // ------------- // */
                    :host.even .menuItem {
                        background: linear-gradient(to bottom right, rgba(255,255,255,0.95), rgba(255,255,255,0.125));
                    }

                    :host.even .miPic {
                        -webkit-box-shadow: -1px 2px 3px 0px #333; -moz-box-shadow: -1px 2px 3px 0px #333; box-shadow: -1px 2px 3px 0px #333;
                    }

                    :host.even .miDesc {
                        text-align: right;
                    }

                    /*:host.even .miPrice .rounded {
                        box-shadow: 0px 1px 4px 0px #454545;
                    }*/

                    :host.even .miDesc, :host.even .miPrice, :host.even .miPic {

                    }

                    /* -------------------- */
                    .first {
                        /*margin-top: 60px;*/
                    }

                    .menuItem {
                       /*overflow-y: auto;*/
                        height: 90px;
                        padding: 0.45rem;
                        margin-bottom: 0.125rem;
                    }

                    .miDesc {
                        padding-left: 0;
                        width: auto;
                        min-width: 160px;
                        max-width: 175px;
                    }
                    .miDesc h6 {
                        font-size: 0.85rem;
                        color: #333;
                        text-transform: capitalize;
                        margin-bottom: 0.2345rem;
                        white-space: nowrap;
                        font-weight: bold;
                        /* border-bottom: #ea6a5e thin solid; */
                        text-decoration-line: underline;
                        text-decoration-color: #ea6a5e;
                        text-decoration-style: wavy;
                        line-height: inherit;
                    }
                    .miDesc p {
                        font-size: 13px;
                        line-height: normal;
                        font-weight: lighter;
                        margin-bottom: 0;
                    }

                    .miPrice {
                        text-align: center;
                        padding: 0.125rem 0.865rem;
                        color: #666;
                        margin-top: -3px;
                    }

                    .miPrice .rounded {
                        font-size: 14px;
                        padding: 0.125rem 0rem;
                        border: #0e499a thin solid;
                        background: #f9fbff;
                        box-shadow: 0px 1px 4px 0px #454545;
                        /*border: #BB3523 thin solid;*/
                    }

                    .miPic {
                        background-position: center center;
                        background-size: cover;
                        background-color: aliceblue;
                        background-repeat: no-repeat;
                        width: auto;
                        min-width: 140px;
                        max-width: 150px;
                    }

                    .itemCounter { margin-top: 4px }

                    .itemCounter .btn {
                        min-width: 24px;
                        padding: 0;
                        line-height: 21px;
                    }


                    /* ----------------- */


                  `]
})
export class MenuItemComponent implements OnInit, AfterViewInit {
    private isOrdered: boolean;
    private elem: ElementRef;
    itemCounter: boolean;
    count = 1;

    @Input() miName: string;
    @Input() miDesc: string;
    @Input() miPrice: number;
    @Input() miPic: string;
    @Input() miID: string;
    @Input() miType: any;
    @Input() miIncr: boolean;
    @Input() isEven: any;
    @Output() emitRemoveClick2: EventEmitter<any> =  new EventEmitter<any>();

    bckgrnd: string;

    constructor(
        private elemRef: ElementRef
    ) {
        this.elem = this.elemRef.nativeElement;
        // this.bckgrnd = `../../../${this.miPic}`;
        // console.log('isIncremental: ', this.miIncr);
        // console.log('is even: ', this.isEven);
    }

    ngOnInit() {
        // console.log('mypic: ', this.miPic);
        if (this.miName.length > 17) {
            this.miName = this.miName.substring(0, 17) + '...';
        }
        if (this.miDesc.length > 80) {
            this.miDesc = this.miDesc.substring(0, 80) + '...';
        }
    }

    ngAfterViewInit(): void {
        this.isOrdered = false;
        this.itemCounter = false;
        // this.bckgrnd = `../../../${this.miPic}`;
        // console.log('bckgrnd: ', this.bckgrnd);
    }

    addItem(msg: boolean): void {
        // console.log('thist ' + msg);
        this.itemCounter = true;
    }

    toggleCounter(): void {
        // this.itemCounter = !this.itemCounter;
        // console.log('eeee: ', e.target.id);
        this.itemCounter = !this.itemCounter;
        // console.log('itemcounter: = ', this.itemCounter);

    }

    removeItemCounter(msg: any): void {
        this.itemCounter = false;
    }

    send4Removal(e): any {
        this.emitRemoveClick2.emit(event);
        // console.log('passed on, ', e);
    }

}
