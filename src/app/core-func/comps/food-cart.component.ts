import { Component, OnInit, Input, Output, ElementRef, AfterViewInit, OnDestroy, OnChanges, EventEmitter, Renderer2 } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material';
import { MenuService } from '../srvcs/menu.service';

@Component({
    selector: 'amm-food-cart',
    template: `
        <p>
          food-cart works!
        </p>
      `,
    styles: []
})

export class FoodCartComponent implements OnInit, AfterViewInit, OnChanges, OnDestroy {
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
        private ms: MenuService,
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
    }


    /// ======== APP FUNCTIONS ======== ///

    sendOrder() {
        // console.log('isDOrderSubmited: ', this.orderSent);
        return this.orderSent;
    }



    /// ======== LIFE CYCLE HOOKS ======== ///

    ngOnInit() {
    }

    ngAfterViewInit(): void {
    }

    ngOnChanges(changes): void {
    }

    ngOnDestroy(): void {
    }

}
