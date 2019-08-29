import {Component, OnInit, Input, Output, EventEmitter, AfterViewInit} from '@angular/core';

@Component({
    selector: 'amm-menu-item',
    template: `
                <div *ngIf="isEven" class="menuItem d-flex">
                    <div class="miDesc">
                        <h6>{{miName}}</h6>
                        <p>{{miDesc}}</p>
                    </div>
                    <div class="miPrice col-sm">
                        <div class="rounded">{{miPrice}}</div>
                    </div>
                    <div class="miPic rounded" [ngStyle]="{'background-image': 'url(../../../' + this.miPic + ')'}"></div>
                </div>
                <div *ngIf="!isEven" class="menuItem d-flex">
                    <div class="miPic rounded" [ngStyle]="{'background-image': 'url(../../../' + this.miPic + ')'}"></div>
                    <div class="miPrice col-sm">
                        <div class="rounded">{{miPrice}}</div>
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

                :host.even .menuItem {
                    background: linear-gradient(to bottom right, rgba(255,255,255,0.95), rgba(255,255,255,0.125));
                }

                :host.even .miPic {
                    -webkit-box-shadow: -1px 2px 3px 0px #333; -moz-box-shadow: -1px 2px 3px 0px #333; box-shadow: -1px 2px 3px 0px #333;
                }

                :host.even .miDesc {
                    text-align: right;
                }

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
                    color: #BB3523;
                    text-transform: capitalize;
                    margin-bottom: 0.345rem;
                    white-space: nowrap;
                }
                .miDesc p {
                    font-size: 13px;
                    line-height: normal;
                    font-weight: lighter;
                    margin-bottom: 0;
                }

                .miPrice {
                    text-align: center;
                    padding: 0.125rem 0.65rem;
                    color: #EA6A5E;
                }

                .miPrice div {
                    font-size: 14px;
                    padding: 0.125rem 0rem;
                    border: #EA6A5E thin solid;
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
                /* ----------------- */


              `]
})
export class MenuItemComponent implements OnInit, AfterViewInit {
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

    constructor() {
        // this.bckgrnd = `../../../${this.miPic}`;
        // console.log('bckgrnd: ', this.bckgrnd);
        console.log('is even: ', this.isEven);
    }

    ngOnInit() {
        console.log('mypic: ', this.miPic);
        if (this.miName.length > 17) {
            this.miName = this.miName.substring(0, 17) + '...';
        }
        if (this.miDesc.length > 80) {
            this.miDesc = this.miDesc.substring(0, 80) + '...';
        }
    }

    ngAfterViewInit(): void {
        // this.bckgrnd = `../../../${this.miPic}`;
        // console.log('bckgrnd: ', this.bckgrnd);
    }

    send4Removal(e): any {
        this.emitRemoveClick2.emit(event);
        console.log('passed on, ', e);
    }

}
