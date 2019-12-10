import {Component, ElementRef, Input, OnInit} from '@angular/core';
import { PlateItemData } from '../../amm.enum';
import { CartService } from '../srvcs/cart.service';
import { CloverUserPrice } from '../amm-data.pipe';

@Component({
    selector: 'amm-plate-item',
    template: `
        <div id="plateHdr" class="d-flex justify-content-between" #plateHdr>
            <div id="platePrice" class="price">{{plateItem.platePrice | cloverUserPrice}}</div>
            <div id="plateSize" class="size">{{plateItem.plateSize}}</div>
        </div>


      `,
    styles: [`
        :host {
            background: #efefef;
            padding: 0.5rem;
        }
    `]
})
export class PlateItemComponent implements OnInit {
    @Input() plateItem: PlateItemData;
    private elem: any;
    constructor(
        private elemRef: ElementRef,
        private cs: CartService
    ) {
        this.elem = this.elemRef.nativeElement;
        this.cs.setElemAttributes(this.elem, {
            class: 'd-flex flex-column revenue'
        });
    }

    ngOnInit() {
        this.cs.setElemAttributes(this.elem, {
            'data-name': 'food-plate_' + this.plateItem.plateNum,
            'data-price': this.plateItem.platePrice
        } );
    }

}
