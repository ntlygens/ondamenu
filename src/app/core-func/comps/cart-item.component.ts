import {Component, OnInit, Output, EventEmitter, AfterViewInit, ElementRef, OnDestroy, Input} from '@angular/core';
import {takeUntil} from 'rxjs/operators';
import {CartItemData} from '../../amm.enum';
import {Subject} from 'rxjs';
import { CartService } from '../srvcs/cart.service';

@Component({
    selector: 'amm-cart-item',
    template: `
        <div class="cartItem title">
          {{cartItem.prod_name}} x {{cartItem.amt}}
        </div>
        <div class="cartItem amt price">{{cartItem.price | cloverUserPrice}}</div>
        <button
            class="btn btn-sm btn-xs rmvBtn close btn-warning"
            id="deleteBtn"
            [title]="cartItem.pid"
        >remove</button>
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
    private elem: any;


    constructor(
        private elemRef: ElementRef,
        private cs: CartService
    ) {
        this.elem = this.elemRef.nativeElement;
        // console.log('cartitem: ', this.cartItem.pid);
    }

    ngOnInit() {
        this.cs.setElemAttributes(this.elem, {
            title: this.cartItem.cnm,
            role: 'group',
            'aria-label': 'food-item',
            class: 'd-flex revenue ' + this.cartItem.cnm.toLowerCase() + '-item',
            'data-price': this.cartItem.price,
        });

    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

}
