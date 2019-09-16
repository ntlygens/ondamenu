import {
    Component,
    OnInit,
    Input,
    Output,
    ElementRef,
    AfterViewInit,
    OnDestroy,
    OnChanges,
    EventEmitter,
    Renderer2,
    ViewChild, ViewContainerRef, TemplateRef
} from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material';
import { CartService } from '../srvcs/cart.service';
import { lift } from '../animations/animations.component';

@Component({
    selector: 'amm-food-cart',
    template: `
        <div class="cartItemHldr"></div>
        <ng-template #cart></ng-template>
      `,
    styles: [`
        /*:host {
            position: fixed;
            width: 100%;
            background: #ea6a5e;
            border: #efefef thin solid;
            border-top-right-radius: 4px;
            border-top-left-radius: 4px;
            z-index: 1;
        }
        @media screen and (max-width: 375px) {
            :host {
                top: 600px;
            }
        }
        @media screen and (min-width: 376px) and (max-width: 765px) {
            :host {
                top: 720px;
            }
        }*/
    `]
})

export class FoodCartComponent implements OnInit, AfterViewInit, OnChanges, OnDestroy {
    // @ViewChild('cartItem', {read: ViewContainerRef, static: true}) cartItem: ViewContainerRef;
    @ViewChild('cart', {read: ViewContainerRef, static: false}) cart: ViewContainerRef;
    @Output() cOrderID: EventEmitter<string> = new EventEmitter<string>();
    @Output() cOrderAmt: EventEmitter<number> = new EventEmitter<number>();
    @Output() closeOnSubmit = new EventEmitter();
    @Output() rmvItemCounter: EventEmitter<string> = new EventEmitter<string>();

    elem: any; mID: any; fID: any; fAmt: any; item: any; itemTitle: any;
    forPlate: any; notForPlate: any; userOrderID: any;

    nonDinnerItemsInCart: any; dinnerItemsInCart: any; desertItemsInCart: any;
    drinkItemsInCart: any; breakfastItemsInCart: any; dinnerItemsNotInPlate: any;
    foodPlate: any; foodPlateItemPrice: any; crntFoodPlate: any; lineItems4Bulk: any;
    orderTotal = 0.00; cartTotal: number; amtSubmitted4Payment: number;

    pretotal: any = []; plateData: any = [];
    plateOrder: any = []; prodsInCart: any = [];

    orderSent: boolean; isOrderIdVisible = false; isPlateVisible = false;
    plateSize: string; deleteBtnListener: () => void;

    constructor(
        private cs: CartService,
        private elemRef: ElementRef,
        private renderer: Renderer2,
        private dialog: MatDialog
    ) {
        const params = (new URL(document.location.href)).searchParams;
        const searchParams = new URLSearchParams(params);

        if ( searchParams.has( 'clid')) {
            this.mID = searchParams.get('clid');
        }

        this.elem = this.elemRef.nativeElement;
        this.orderSent = false;

        // this.elem.setAttribute('[@cartAnimations]', 'state');
    }


    /// ======== APP FUNCTIONS ======== ///

    sendOrder() {
        // console.log('isDOrderSubmited: ', this.orderSent);
        return this.orderSent;
    }



    /// ======== LIFE CYCLE HOOKS ======== ///

    ngOnInit() {
        // this.cs.setCartContainerRef(this.cart);
    }

    ngAfterViewInit(): void {
    }

    ngOnChanges(changes): void {
        // console.log('fd change: ', this.cart.element.nativeElement.children.count);
    }

    ngOnDestroy(): void {
    }

}
