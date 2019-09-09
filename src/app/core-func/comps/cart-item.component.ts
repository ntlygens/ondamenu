import {Component, OnInit, Output, EventEmitter, AfterViewInit, ElementRef, OnDestroy, Input} from '@angular/core';
import {takeUntil} from 'rxjs/operators';
import {CartItemData} from '../../amm.enum';
import {Subject} from 'rxjs';

@Component({
    selector: 'amm-cart-item',
    template: `
        <h6>
          {{cartItem.pid}}
        </h6>
        <p>
          {{cartItem.amt}}
        </p>
      `,
    styles: [`
        :host {
            position: relative;
            width: auto;
            justify-content: space-between;
        }
    `],
    animations: []
})
export class CartItemComponent implements OnInit, OnDestroy {
    @Input() cartItem: CartItemData;
    @Output() cartSelected: EventEmitter<any> = new EventEmitter<any>();
    private destroy$ = new Subject<any>();

    constructor(
    ) {
        // console.log('cartitem: ', this.cartItem.pid);
    }

    ngOnInit() {

    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

}
