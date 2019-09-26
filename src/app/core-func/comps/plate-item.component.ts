import {Component, ElementRef, Input, OnInit} from '@angular/core';
import { PlateItemData } from '../../amm.enum';
import { CloverUserPrice } from '../price-change.pipe';

@Component({
    selector: 'amm-plate-item',
    template: `
        <div id="plateHdr" #plateHdr>
            <div id="platePrice" class="price">{{plateItem.platePrice | cloverUserPrice}}</div>
            <div id="plateSize" class="size">{{plateItem.plateSize}}</div>
        </div>


      `,
    styles: []
})
export class PlateItemComponent implements OnInit {
    @Input() plateItem: PlateItemData;
    private elem: any;
    constructor(
        private elemRef: ElementRef
    ) {
        this.elem = this.elemRef.nativeElement;
    }

    ngOnInit() {
        this.elem.setAttribute('data-title', 'food-plate_' + this.plateItem.plateNum );
    }

}
