import {
    AfterViewInit,
    // ChangeDetectionStrategy,
    Component, ComponentFactoryResolver, ComponentRef,
    ElementRef,
    EventEmitter,
    Input,
    OnChanges,
    OnDestroy,
    OnInit,
    Output,
    Renderer2,
    ViewChild,
    ViewContainerRef,
    // ApplicationRef, Injector, EmbeddedViewRef, ChangeDetectorRef
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog'
import { MatDialogConfig as MatDialogConfig } from '@angular/material/dialog';
import { CartService } from '../srvcs/cart.service';
// import { PlateItemData } from '../../amm.enum';
import {PlateItemComponent} from './plate-item.component';

import { UserLoginModalComponent } from '../modal/user-login-modal/user-login-modal.component';
// import { ModalComponent } from '../modal/modal.component';

// import {HttpParams} from '@angular/common/http';
// import {of} from 'rxjs';
// import {Arguments} from '@angular/cli/models/interface';
// import { CloverDbPrice } from '../amm-data.pipe';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
    selector: 'amm-food-cart',
    template: `
        <div class="cartItemHldr">Shopping Cart</div>
        <ng-template #cart></ng-template>
        <div id="tabulator" class="btn-group justify-content-start btn-group-vertical" role="group" aria-label="" style="width: inherit;">
            <div id="orderAmt" class="btn btn-sm cartSumTotal btn-default">{{amtOrderTotal | cloverUserPrice}}</div>
            <button type="submit" id="submit" value="Submit" (click)="createOrder($event);" class="btn btn-sm btn btn-success">submit</button>
        </div>
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
    `],
    // changeDetection: ChangeDetectionStrategy.OnPush
})

export class FoodCartComponent implements OnInit, AfterViewInit, OnChanges, OnDestroy {
    // @ViewChild('cartItem', {read: ViewContainerRef, static: true}) cartItem: ViewContainerRef;
    @ViewChild('cart', {read: ViewContainerRef, static: false}) cart: ViewContainerRef;

    @Input() amtItems4Plate: number;
    @Input() amtItemsNCart: number;
    @Input() amtItemsNotNPlate: number;
    @Input() amtItemsNot4Plate: number;
    @Input() amtPlatesNCart: number;
    @Input() amtOrderTotal: number;

    @Output() cOrderID: EventEmitter<string> = new EventEmitter<string>();
    @Output() cOrderAmt: EventEmitter<number> = new EventEmitter<number>();
    @Output() closeOnSubmit = new EventEmitter();
    @Output() pushEvent = new EventEmitter();
    @Output() rmvItemCounter: EventEmitter<string> = new EventEmitter<string>();

    elem: any; mID: any; fID: any; fAmt: any; item: any; itemTitle: any;
    forPlate: number; notForPlate: number; notNPlate: number; inCart: number;
    plateAmt: number; cartAmtTotal: number;

    nonDinnerItemsInCart: any; dinnerItemsInCart: any; desertItemsInCart: any;
    drinkItemsInCart: any; breakfastItemsInCart: any;
    foodPlates: any; foodPlateItemPrice: any; crntFoodPlate: any; lineItems4Bulk: any;
    orderTotal: number; userOrderID: any; amtSubmitted4Payment: number;

    pretotal: any = []; plateData: any = []; dinnerItemsNotInPlate: Array<any> = [];
    plateOrder: any = []; prodsInCart: any = [];

    orderSent: boolean; isOrderIdVisible = false; isPlateVisible = false;
    plateSize: string; deleteBtnListener: () => void;

    something: any = [];

    private compRef: ComponentRef<PlateItemComponent>;
    private static insertAfter(referenceNode, newNode) {
        referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
    }
    private static getCartTotal(elem: HTMLElement, arg: string): number {
        const prices: Array<number> = [];
        let subTotal: number; let total: number; const origCartAmt = 0;
        // const cartItems = elem.querySelectorAll(arg);
        const cartItems = elem.querySelectorAll(arg);
        if ( cartItems ) {
            /// cartItem.setAttribute('aria-label', 'checked');
            // const allItems: any = cartItem.closest('.shoppingCart').querySelectorAll('[aria-label="checked"]');
            cartItems.forEach( (x, i) => {
               // console.log('xx:', i, ', ', x.getAttribute('data-price'));
               prices.push(Number(x.getAttribute('data-price')));
            });
            if ( prices.length === 0 ) {
                total = 0;
            } else {
                subTotal = prices.reduce((a, b) => a + b);
                total = subTotal + origCartAmt;
            }


            // const itemPrice: number = Number(cartItem.getAttribute('data-price'));
            // const subTotal: number = Number(cartItem.parentElement.querySelector('.cartSumTotal').getAttribute('data-total'));
            // const cartSubTotal: number = (itemPrice + subTotal);

            // console.log('ele: ', subTotal, ' tle: ', total);
            return total;
        }
    }
    private static getItemsInCart(elem: HTMLElement, arg: string): number {
        let argArr: number;
        switch ( arg ) {
            case 'ALL':
                const allCartItems: any = elem.querySelectorAll('amm-cart-item');
                argArr = allCartItems.length;
                /*argArr.push({
                    [arg]: allCartItems.length
                });*/
                break;
            case 'NONDINNER':
                const nonDnrItems: any = elem.querySelectorAll('amm-cart-item:not([title^="DINNER"])');
                argArr = nonDnrItems.length;
                /*argArr.push({
                    [arg]: nonDnrItems.length
                });*/
                break;
            case 'NOTPLATED':
                const notPltdItems: any = elem.querySelectorAll('amm-cart-item[title^="DINNER"]:not([data-name*="plated"])');
                argArr = notPltdItems.length;
                /*argArr.push({
                    [arg]: notPltdItems.length
                });*/
                break;
            case 'PLATES':
                const amtPlates: any = elem.querySelectorAll('amm-plate-item');
                argArr = amtPlates.length;
                /*argArr.push({
                    [arg]: notPltdItems.length
                });*/
                break;
            default:
                const cartItem: any = elem.querySelectorAll(`[title^="${arg}"]`);
                argArr = cartItem.length;
                /*argArr.push({
                    [arg]: cartItem.length
                });*/
                break;
        }
        // ** console.log('argArr: ', argArr);
        return argArr;
    }


    constructor(
        private cs: CartService,
        private elemRef: ElementRef,
        private renderer: Renderer2,
        private dialog: MatDialog,
        private resolver: ComponentFactoryResolver,
        private router: Router,
        private route: ActivatedRoute,
        // private appRef: ApplicationRef,
        // private cdRef: ChangeDetectorRef,
        // private injector: Injector
    ) {
        /*const params = (new URL(document.location.href)).searchParams;
        const searchParams = new URLSearchParams(params);

        if ( searchParams.has( 'clid')) {
            this.mID = searchParams.get('clid');
        }*/

        this.elem = this.elemRef.nativeElement;
        this.orderSent = false;
        this.cartAmtTotal = this.getOrderTotal();

        // this.dinnerItemsNotInPlate = this.elem.querySelectorAll('.dinner-item');
        // this.prodsInCart = this.elem.querySelectorAll('button.close');
        // (this.prodsInCart).forEach( (prod) => {
        //     // if (this.deleteBtn_Listener) { this.deleteBtn_Listener(); prod.setAttribute('data-listen', false); }
        //     if (prod.deleteBtn_Listener) { prod.deleteBtn_Listener(); }
        //     // console.log('prodincart: ', this.prodsInCart.length);
        //     if (prod.getAttribute('data-listen') !== true) {
        //         prod.setAttribute('data-listen', true);
        //         prod.deleteBtn_Listener = this.renderer.listen(prod, 'click', () => {
        //             this.removeItem(event);
        //
        //         });
        //         // this.removeItem(event);
        //     }
        //     // console.log('u clicked on ', prod.title);
        //
        //
        // });

        // this.elem.setAttribute('[@cartAnimations]', 'state');
    }


    /// ======== APP FUNCTIONS ======== ///

    getAllCartItems(): number {
        return FoodCartComponent.getItemsInCart(this.elem, 'ALL');
    }

    getBreakfastItems(): number {
        return FoodCartComponent.getItemsInCart(this.elem, 'BREAKFAST');
    }

    getLunchItems(): number {
        return FoodCartComponent.getItemsInCart(this.elem, 'LUNCH');
    }

    getDinnerItems(): number {
        return FoodCartComponent.getItemsInCart(this.elem, 'DINNER');
    }

    getNonDinnerItems(): number {
        return FoodCartComponent.getItemsInCart(this.elem, 'NONDINNER');
    }

    getNotPlatedItems(): number {
        return FoodCartComponent.getItemsInCart(this.elem, 'NOTPLATED');
    }

    getDesertItems(): number {
        return FoodCartComponent.getItemsInCart(this.elem, 'DESERT');
    }

    getDrinkItems(): number {
        return FoodCartComponent.getItemsInCart(this.elem, 'DRINK');
    }

    getAmtPlates(): number {
        return FoodCartComponent.getItemsInCart(this.elem, 'PLATES');
    }

    getOrderTotal(): number {
        // const itemCost
        return FoodCartComponent.getCartTotal(this.elem, '.revenue');

        /*pricedItems.forEach( (x, i) => {
            console.log('pi_ ', x.innerHTML);
            // this.pretotal.push(x.innerHTML);
        });*/
        // this.cartTotal = this.pretotal.reduce((a, b) => a + b, 0);
        // console.log('ordertotal: ', this.orderTotal);
        // console.log('carttotal: ' + Number(this.cartTotal));


    }



    /* // selection OR ordering methods // */

    generateOrderPackage(orderid) {
        // this.myOrderItems = this.nonDinnerItemsInCart;
        // console.log(this.myOrderItems.length);
        // this.allItemsInCart = this.elem.querySelectorAll('div[aria-label="food-item"]');
        const foodPlates = this.elem.querySelectorAll('amm-plate-item[data-name^="food-plate"]');
        this.nonDinnerItemsInCart = this.elem.querySelectorAll('amm-cart-item:not([title*="DINNER"])');

        if (foodPlates.length > 0) {
            foodPlates.forEach( (x) => {
                const plateTitle = x.querySelector('#plateSize').innerHTML;
                const plateCost = x.querySelector('#platePrice').innerHTML * 100;
                // console.log('plateTitle = ', plateTitle);
                let plateSizeID: string;
                switch (plateTitle) {
                    case 'small':
                        plateSizeID = 'F3XC2THF9BQ4C';
                        break;
                    case 'meduim':
                        plateSizeID = 'EZTKBJ49KH8P0';
                        break;
                    case 'large':
                        plateSizeID = 'YJ4QNB4CP21DT';
                        break;
                }
                // const plateSizes = x.children[0].children[0].innerHTML;
                // const plateCost = x.children[0].children[1].innerHTML * 100;

                const itemsInPlate = x.querySelectorAll('amm-cart-item');
                itemsInPlate.forEach( (y, j) => {
                    const itemTitle = y.querySelector('.title').innerHTML;
                    const itemCost = Math.round(y.querySelector('.amt').innerHTML * 100);
                    const itemID = y.querySelector('.close').getAttribute('title');

                    // TODO: Get modifierGroup id: from merchant db
                    // TODO: Use only mGroupID for Dinner or equivalent

                    this.plateData[j] = {modifier: { name: itemTitle, price: itemCost, modifierGroup: { id: 'TN6XPNQWH0XK4' }, id: itemID }, quantitySold: '1' };

                    // this.plateOrder.push({[plateSizes]: this.plateData[j] });
                });
                /// USE THIS /// == this.plateOrder.push({'orderid': `${orderid}`, 'mID': `${this.mID}`, 'items': [ {'item': {'id': this.plateSizeID}, 'name': plateSizes.toUpperCase() + ' DINNER', 'price': plateCost, 'printed': true, 'modifications': this.plateData }]});
                this.plateOrder.push( {item: {id: plateSizeID}, name: plateTitle.toUpperCase() + ' DINNER', price: plateCost, printed: true, modifications: this.plateData } );
                //////// ** this.plateOrder.push( {item: {id: plateSizeID}, name: plateTitle.toUpperCase() + ' DINNER', price: (plateCost * 100), printed: true } );
                // ### ---- console.log('ll '+itemsInPlate.length);
                // console.log('plateSizeId: ', plateSizeID);

                // this.plateData[i] = x.children[0].children[0].innerHTML;
                // this.plateOrder.push(this.plateData[i]);
            });
            // console.log('plateD: ' + JSON.stringify(this.plateOrder));
        }
        // console.log('amt of plates: ' + foodPlates.length);

        this.nonDinnerItemsInCart.forEach( (x) => {
            const itemTitle = x.querySelector('.title').innerHTML;
            const itemCost = Math.round(x.querySelector('.amt').innerHTML * 100);
            const itemID = x.querySelector('.close').getAttribute('title');

            this.plateOrder.push( {item: {id: itemID }, name: itemTitle, price: itemCost});
            // console.log('mi - '+JSON.stringify(this.myOrderItems));
            // ### ---- console.log(itemTitle + ' cost = ' + itemCost);
        });

        /*this.allItemsInCart.forEach( (x) => {
            let itemTitle = x.querySelector('button.title').innerHTML;
            let itemCost = Math.round(x.querySelector('button.amt').innerHTML * 100);
            let itemID = x.querySelector('button.close').getAttribute('title');

            this.myOrderItems.push({"name": itemTitle, "price": itemCost, "item": {"id": itemID } });
            // console.log('mi - '+JSON.stringify(this.myOrderItems));
            console.log(itemTitle + ' cost = ' + itemCost);

        });*/
        // ### ---- console.log('full order: ' + JSON.stringify(this.plateOrder));
        // console.log('mi - '+JSON.stringify(this.myOrderItems));
        // const fullOrder = {orderid, mID: this.mID, items: this.plateOrder };
        // console.log('fullOrder: ', fullOrder);
        return {orderid, mID: this.mID, items: this.plateOrder };
    }

    createOrder(evt) {
        const params = (new URL(document.location.href)).searchParams;
        const searchParams = new URLSearchParams(params);
        if ( searchParams.has( 'clid')) {
            this.mID = searchParams.get('clid');
        }
        // console.log('mID: ', this.mID);

        this.cs.getOrderId(`${this.mID}`).subscribe( res => {
                // let resBody = JSON.parse(res['_body']);
                // this.userOrderID = JSON.stringify(res);
                this.userOrderID = res;

                // console.log('ngOrderID: ' + this.userOrderID);
            },
            err => {
                // console.log('getOrderID_Error: ' + err);
            },
            () => {
                // console.log('success getting orderID - ' + this.userOrderID);


                // const dOrderAmt = this.elem.querySelector('#orderAmt');
                this.cs.setOrderId(this.userOrderID);
                this.cs.setOrderAmt(this.amtOrderTotal);
                // console.log('id: ', this.userOrderID, ' total: ', this.amtOrderTotal);
                /// ** this.cOrderID.emit(this.userOrderID);
                /// ** this.cOrderAmt.emit(this.cartTotal);
                // console.log('log ID: '+this.userOrderID);
                this.lineItems4Bulk = this.generateOrderPackage(this.userOrderID);
                /// === /// console.log('lineItems: == ', JSON.stringify(this.lineItems4Bulk));
                // console.log('l4b: ', this.lineItems4Bulk['items']);
                /*const pricedItems = this.lineItems4Bulk.items;

                pricedItems.forEach( (x) => {
                    this.pretotal.push(x.price);
                });

                this.cartTotal = this.pretotal.reduce((a, b) => a + b, 0);
                console.log('sum ' + Number(this.cartTotal));*/
                // this.amtSubmitted4Payment = this.cartTotal;
                // console.log('lineItems : ', this.lineItems4Bulk);

                // this.c_orderAmt.emit(dOrderAmt.innerHTML);
                // this.cOrderAmt.emit(this.amtSubmitted4Payment);
                // this.closeOnSubmit.emit(null);

                this.cs.addItems2Order(this.lineItems4Bulk).subscribe( res => {
                        /// ==== /// console.log('addItemsResponse: ' + JSON.stringify(res));
                        const numItemsInOrder = Object.keys(res);
                        // console.log('res length: = ', Object.keys(res).length);
                        /// === /// console.log('obj key name - ', numItemsInOrder[0]);
                        // @ts-ignore
                        if ( (numItemsInOrder[0] !== 'message') || (numItemsInOrder[0] === '0') ) {
                            // console.log('Worked: ', numItemsInOrder.length, ' items added to order; \n');
                        } else {
                            // console.log('Something went wrong. No Items added to order');
                        }
                    },
                    err => {
                        // console.log('addItems2Order_Error: ' + err);
                    },
                    () => {
                        this.clearCart();
                        evt.target.previousSibling.innerHTML = '0.00';
                        this.orderSent = true;

                        // TODO: add login before sendOrder.
                        // TODO: User must SignUp or SignIn before moving on to Payment
                        // == *** == this.openDialog(); == *** == //

                        this.pushEvent.emit(null);
                        this.openDialog();
                    });
            });

    }

    orderAmount(amt) {
        // console.log('test1 '+amt);
        this.fAmt = amt;
        return this.fAmt;
    }

    orderID(id) {
        // console.log('test2 '+id);
        this.fID = id;
        return this.fID;
    }

    openDialog(): void {
        const dialogConfig = new MatDialogConfig();
        dialogConfig.autoFocus = true;
        dialogConfig.hasBackdrop = true;
        dialogConfig.disableClose = true;
        dialogConfig.closeOnNavigation = false;
        dialogConfig.height = '500';
        dialogConfig.width = '300';
        dialogConfig.data = {
            name: 'OnDaMenu',
            email: 'example@youremail.com',
            uid: 'u_00000',
            upw: 'your_password'
        };
        const dialogRef = this.dialog.open(UserLoginModalComponent, dialogConfig);
        dialogRef.afterClosed().subscribe(result => {
            // console.log('The dialog referenced by: ', result.email, '\n' );
            // console.log('Who confirmed: ', result.upw, ' as their email. \n');
            // console.log('And uses: ', result.confirm_upw, ' as their passcode \n');
            // this.sendOrder();
            this.router.navigate(['p'], {relativeTo: this.route, queryParamsHandling: 'preserve'});

            // this.animal = result;
        });
    }

    sendOrder() {
        // console.log('isDOrderSubmited: ', this.orderSent);
        return this.orderSent;
    }

    clearCart() {
        const platesNCart = this.elem.querySelectorAll('amm-plate-item[data-name^="food-plate"]');
        const itemsNCart = this.elem.querySelectorAll('amm-cart-item:not([title*="DINNER"])');
        // const plates = this.elem.querySelectorAll('amm-plate-item[data-name^="food-plate"]');

        // const platesNCart = this.amtPlatesNCart;
        // const nonDItemsNCart = this.amtItemsNot4Plate;

        // console.log('Amt# non-Dinner items in cart = ', this.amtItemsNot4Plate, ';\n');
        // console.log('Amt# Dinner plates in cart = ', this.amtPlatesNCart, ';\n');


        // switch (true) {
        //     case this.amtPlatesNCart !== 0:
        platesNCart.forEach( (x) => {
            x.remove();
        });
        //         break;
        //     case this.amtItemsNot4Plate !== 0:
        itemsNCart.forEach( (x) => {
            x.remove();
        });
        //         break;
        //     default:
        //         return;
        //
        // }


        // console.log('Cart cleared');
        // this.viewCart();
    }


    /* // data injection and query methods // */
    checkForExistingPlates() {
        // const num = 0;
        this.foodPlates = this.elem.querySelectorAll('amm-plate-item[data-name^="food-plate_"]');
        if (this.foodPlates.length > 0) {
            // console.log('amt Plates: ' + this.foodPlates.length);
            return this.foodPlates.length;
        } else {
            return 0;
        }

    }

    changePlateSize(size) {
        const amtPlates: number = this.checkForExistingPlates();
        const plateNum: number = (amtPlates + 1);
        // console.log('amt-crnt-plates = ', amtPlates, ' next-plate-num = ', plateNum);

        this.dinnerItemsNotInPlate = this.elem.querySelectorAll('[title="DINNER"]:not([data-name])');
        // this.dinnerItemsNotInPlate = this.elem.querySelectorAll('[title*="DINNER"]');

        switch (size) {
            case 'none':
                this.isPlateVisible = false;
                this.getOrderTotal();
                // console.log('item added ' + size);
                break;
            case 'sm':
                this.createPlate({plateSize: 'small', plateNum, platePrice: 800});
                // this.getOrderTotal();
                // console.log('not plated ' + this.dinnerItemsNotInPlate.length);
                break;
            case 'md':
                this.crntFoodPlate = this.elem.querySelector(`amm-plate-item[data-name^="food-plate_${this.plateAmt}"]`);
                // this.crntFoodPlate = this.elem.getElementsByTagName('amm-plate-item')[amtPlates];
                // console.log('plateAmt: = ', this.plateAmt);
                this.crntFoodPlate.querySelector('#platePrice').innerHTML = '10.00';
                this.crntFoodPlate.querySelector('#platePrice').className = 'price';
                this.crntFoodPlate.querySelector('#plateSize').innerHTML = 'medium';
                this.orderTotal -= 7;
                // console.log('mdNIP: ', this.notNPlate);
                this.dinnerItemsNotInPlate.forEach((x) => {
                    this.crntFoodPlate.appendChild(x);
                    // console.log('plates: '+this.foodPlates.childList);
                });

                const platedItemsMD = this.crntFoodPlate.querySelectorAll('amm-cart-item[aria-label*="food-item"]');
                platedItemsMD.forEach( (x) => {
                    x.classList.remove('revenue');
                    x.setAttribute('data-name', 'plated');
                    if (x.children[1].classList.contains('price')) {
                        x.children[1].classList.remove('price');
                        x.children[1].classList.add('priceAdded');
                    }
                });

                this.getOrderTotal();
                break;
            case 'lg':
                this.crntFoodPlate = this.elem.getElementsByTagName('amm-plate-item')[amtPlates];
                this.crntFoodPlate.querySelector('#platePrice').innerHTML = '13.00';
                this.crntFoodPlate.querySelector('#platePrice').className = 'price';
                this.crntFoodPlate.querySelector('#plateSize').innerHTML = 'large';
                this.orderTotal -= 10;
                // console.log('mdNIP: ', this.notNPlate);
                this.dinnerItemsNotInPlate.forEach((x) => {
                    this.crntFoodPlate.appendChild(x);
                    // console.log('plates: '+this.foodPlates.childList);
                });

                const platedItemsLG = this.crntFoodPlate.querySelectorAll('amm-cart-item[aria-label*="food-item"]');
                platedItemsLG.forEach( (x) => {
                    x.classList.remove('revenue');
                    x.setAttribute('data-name', 'plated');
                    if (x.children[1].classList.contains('price')) {
                        x.children[1].classList.remove('price');
                        x.children[1].classList.add('priceAdded');
                    }
                });

                this.getOrderTotal();
                break;
        }
    }

    newPlateQuery(size) {
        // if(this.orderItemsForPlate < 8) {
        if ( window.confirm(`"OK": Upgrade to ${size.toUpperCase()} Plate? \n "CANCEL" Create New SM Plate?`) ) {
            // console.log('You\'ve changed to ' + size + ' plate');
            this.changePlateSize(size);
        } else {
            alert('You have confirmed to start a new SM plate');
            // console.log('You have confirmed to start a new plate');
            // this.changePlateSize('sm');
        }
        // } else {
        //   this.changePlateSize('sm');
        //   console.log('You cannot add any more items to this plate. You MUST start a new plate');
        // }
    }

    createPlate(data): void {
        // console.log('this is plate number ' + data.plateNum);
        // == option one == //
        /*const fragment = document.createDocumentFragment();
        const myPlate = document.createElement('div');
        const plateHdr = document.createElement('div');
        const priceLbl = document.createElement('span');
        const sizeLbl = document.createElement('span');
        myPlate.style.cssText += 'width: inherit; z-index: 3; background-color: #666; font-variant: small-caps; font-size: inherit; padding: 0.25rem 0.25rem; margin: 3px 0';
        myPlate.setAttribute('data-menu', 'DINNER-PLATE_' + num);
        myPlate.setAttribute('name', 'food-plate_' + num);
        // myPlate.className = 'd-flex justify-content-between';

        plateHdr.className = 'd-flex justify-content-between';

        priceLbl.id = 'platePrice';
        priceLbl.className = 'price';
        priceLbl.style.cssText += 'padding-bottom: 0.25rem';

        switch (true) {
            case plate === 'small':
                priceLbl.innerHTML = '7.00';
                break;
            case plate === 'medium':
                priceLbl.innerHTML = '10.00';
                break;
            case plate === 'large':
                priceLbl.innerHTML = '13.00';
                break;
        }

        sizeLbl.id = 'plateSize';
        sizeLbl.style.cssText += 'padding-bottom: 0.25rem';
        sizeLbl.innerHTML = plate;

        plateHdr.appendChild(sizeLbl);
        plateHdr.appendChild(priceLbl);
        myPlate.appendChild(plateHdr);
        fragment.appendChild(myPlate);

        this.elem.insertBefore(fragment, this.elem.querySelectorAll('div.btn-group')[0]);
        this.elem.insertBefore(fragment, this.elem.querySelector('div[aria-label="orderAmt"]'));

        this.elem.querySelector()
        const existingPlate = this.elem.querySelector('div[name^="food_plate"]');
        if(existingPlate) {
        console.log('plate exists');
        FoodCartComponent.insertAfter(this.elem.querySelector('.cartItemHldr'), fragment );
        } else {
        console.log('sending lERT');
        let item2Load = this.elem.querySelector('#tabulator');
        this.elem.insertBefore(fragment, this.elem.querySelectorAll('div.btn-group')[0]);
        }
        */

        // == option two == //
        const factory = this.resolver.resolveComponentFactory(PlateItemComponent);
        this.compRef = this.cart.createComponent(factory);
        this.compRef.instance.plateItem = data;


        // == option three == //
        /*const factory = this.resolver.resolveComponentFactory(PlateItemComponent);
        this.compRef = factory.create(this.injector);
        this.compRef.instance.plateItem = data;
        this.appRef.attachView(this.compRef.hostView);
        const domElement = (this.compRef.hostView as EmbeddedViewRef<any>)
            .rootNodes[0] as HTMLElement;

        const cart = document.querySelector('.shoppingCart');
        FoodCartComponent.insertAfter(cart.firstChild, domElement);*/

        // == add items next == //
        this.injectItemsN2Plate(data);

    }

    injectItemsN2Plate(data): void {
        /*const foodPlates = this.elem.getElementsByTagName('amm-plate-item');
        console.log('foodPlatesAmt: ', foodPlates.length);

        for ( let i = 0; i < foodPlates; i++) {
            console.log('fpi: ', foodPlates[i]);
            if ( foodPlates[i].getAttribute('data-title') === ('food-plate_' + data.plateNum) ) {
                this.crntFoodPlate = foodPlates[i];
            }
        }*/
        // console.log('pltNum: ', data.plateNum);

        // this.crntFoodPlate = this.elem.querySelector('amm-plate-item[data-name^="food-plate_' + (data.plateNum - 1) + '"]');
        this.crntFoodPlate = this.elem.getElementsByTagName('amm-plate-item')[data.plateNum - 1];
        // this.dinnerItemsNotInPlate = this.elem.getElementsByTagName('amm-cart-item');

        // console.log('fp: ', this.crntFoodPlate );
        // console.log('not 1st plated ' + this.notNPlate);

        for (const plate of this.dinnerItemsNotInPlate) {
            // console.log('j: ', plate.getAttribute('aria-label'));
            FoodCartComponent.insertAfter(this.crntFoodPlate.firstChild, plate);
        }

        /*if ( this.crntFoodPlate.count > 0 ) {
            console.log( 'itssssss: ', this.crntFoodPlate.children.count, ' num = ', data.plateNum);
        } else {
            console.log('nummm: ', data.plateNum);
        }*/

        // this.dinnerItemsNotInPlate.forEach((x) => {
        //     FoodCartComponent.insertAfter(this.crntFoodPlate.firstChild, x);
        //     // this.crntFoodPlate.appendChild(x);
        // });

        const platedItemsSM = this.crntFoodPlate.querySelectorAll('amm-cart-item');
        (platedItemsSM).forEach( (x) => {
            x.classList.remove('revenue');
            x.setAttribute('data-name', 'plated');
            if (x.children[1].classList.contains('price')) {
                x.children[1].classList.remove('price');
                x.children[1].classList.add('priceAdded');
            }

        });
        this.getOrderTotal();
    }

    removeItem(e): any {
        const item = e.target;
        const itemTitle = e.target.title;
        const itemParent = e.target.parentElement;
        // console.log('removing item.... ', itemTitle );  // , ' with classList: ', e.target.classList);
        // e.target.removeEventListener();
        if (this.deleteBtnListener) { this.deleteBtnListener(); }
        // this.removeListener(e.target);
        // let item2Rmv = document.querySelector('button.visible[title="' + item + '"]');
        const item2Rmv = document.querySelector('#add2Cart[title="' + itemTitle + '"]');
        const itemCntnt = item2Rmv.parentElement.childElementCount;
        // console.log('amttems2R: ', items2Rmv);

        // let itemIncr = item2Rmv.closest('.cta_btns').firstElementChild;
        // console.log('incr: ', itemIncr.classList);
        // let itemIncr = item2Rmv.closest('#orderBtn').previousElementSibling;

        const item2Sub: number = Number(e.target.previousElementSibling.textContent * 100);
        // let itemParent = e.target.parentElement;
        const platedItemName = itemParent.getAttribute('data-name');
        // console.log('items2Rmv: ', items2Rmv.length);
        // console.log('sub ' + item2Sub);

        if ( itemCntnt !== 3 ) {
            item2Rmv.classList.replace('hidden', 'visible');
            item2Rmv.nextElementSibling.classList.replace('visible', 'hidden');
        } else {

            item2Rmv.previousElementSibling.classList.replace('hidden', 'visible');
            item2Rmv.nextElementSibling.classList.replace('visible', 'hidden');
            // this.rmvItemCounter.emit(item);

        }

        if (platedItemName === 'plated') {
            const platedParent = itemParent.parentElement;
            // let platedParentName = platedParent.getAttribute('name');
            // console.log('pltItm: ', platedItemName, ' and pltItmPrnt: ', platedParentName);

            const platePrice = Number(platedParent.querySelector('.priceAdded').textContent * 100) ;
            // console.log(e.target.parentElement.parentElement.getAttribute('name'));
            const orderPlate = platedParent.querySelectorAll('[title^="DINNER"][data-name*="plated"]');
            orderPlate.forEach( (x) => {
                x.removeAttribute('data-name');
                x.children[1].classList.remove('priceAdded');
                x.children[1].classList.add('price');
                this.elem.insertBefore(x, this.elem.lastElementChild);
            });
            this.orderTotal -= platePrice;
            // e.target.parentElement.remove();
            itemParent.remove();
            platedParent.remove();
            // this.elem.querySelector('div[data-title="' + platedParentName + '"').remove();

        } else {
            // this.removeListener(e.target);

            itemParent.remove();
            this.orderTotal -= Number(item.previousElementSibling.textContent * 100);
            // console.log('Ototal: ', this.orderTotal);
        }
        // console.log('amt to minus: ', item2Sub, ' from ', this.orderTotal, ' total');

    }


    /*getItemsInCart(elem: HTMLElement, arg: string): number {
        // const splitArgs = (arg.toString()).split(',');
        // const argArr: Array<any> = [];
        // for ( const arg of splitArgs) {
        let argArr: number;
        switch ( arg ) {

            case 'NONDINNER':
                const nonDnrItems: any = elem.querySelectorAll('amm-cart-item:not([title^="DINNER"])');
                argArr = nonDnrItems.length;
                /!*argArr.push({
                    [arg]: nonDnrItems.length
                });*!/
                break;
            case 'NOTPLATED':
                const notPltdItems: any = elem.querySelectorAll('amm-cart-item:not([title^="DINNER"]:not([data-name*="plated"])');
                argArr = notPltdItems.length;
                /!*argArr.push({
                    [arg]: notPltdItems.length
                });*!/
                break;
            case 'ALL':
                const allCartItems: any = elem.querySelectorAll('amm-cart-item');
                argArr = allCartItems.length;
                /!*argArr.push({
                    [arg]: allCartItems.length
                });*!/
                break;
            default:
                const cartItem: any = elem.querySelectorAll(`[title^="${arg}"]`);
                argArr = cartItem.length;
                /!*argArr.push({
                    [arg]: cartItem.length
                });*!/
                break;
        }

        // }

        console.log('argArr: ', argArr);
        return argArr;

    }*/

    /// ======== LIFE CYCLE HOOKS ======== ///

    ngOnInit() {
        // this.orderTotal = 0;
        // this.cartTotal = 0;
    }

    ngOnChanges(changes): void {
        this.forPlate = this.amtItems4Plate;
        this.notForPlate = this.amtItemsNot4Plate;
        this.notNPlate = this.amtItemsNotNPlate;
        this.inCart = this.amtItemsNCart;
        this.plateAmt = this.amtPlatesNCart;
        // this.orderTotal = this.amtOrderTotal;

        this.prodsInCart = this.elem.querySelectorAll('button.close');
        // this.dinnerItemsNotInPlate = this.elem.querySelectorAll('amm-cart-item[title^="DINNER"]:not([data-name*="plated"])');

        for ( const elem of this.prodsInCart ) {
            const prod = elem.parentElement.title;
            // if (this.deleteBtnListener) { this.deleteBtnListener(); elem.setAttribute('data-listen', false); }
            if (elem.deleteBtn_Listener) { elem.deleteBtn_Listener(); }
            // console.log('prodincart: ', this.prodsInCart.length);
            if (elem.getAttribute('data-listen') !== true) {
                elem.setAttribute('data-listen', true);
                elem.deleteBtn_Listener = this.renderer.listen(elem, 'click', () => {
                    this.removeItem(event);
                });
            }
            // console.log('prod: ', prod);
        }

        if (this.notForPlate > 0) {
            this.changePlateSize('none');
        }

        switch (true) {
            case (this.plateAmt < 1 ):
                if (this.notNPlate === 3) {
                    this.changePlateSize('sm');
                }
                break;
            case (this.plateAmt >= 1):
                /*if (this.forPlate < 5) {
                    this.changePlateSize('none');
                } else */
                if ( this.forPlate < 6 && this.notNPlate === 2) {
                    this.newPlateQuery('md');
                } else if ( (this.forPlate < 8 && this.forPlate > 5) && this.notNPlate === 2 ) {
                    this.newPlateQuery('lg');
                } else if (this.notNPlate === 3) {
                    this.changePlateSize('sm');
                }
                /* else if ( this.forPlate === 7 ) {
                    this.newPlateQuery('lg');
                } else if ( this.forPlate === 8 ) {
                    this.newPlateQuery('md');
                } else if ( this.forPlate === 10 ) {
                    this.newPlateQuery('md');
                }
                break;
            case (this.notNPlate === 3):
                if (this.forPlate === 3) {
                    this.changePlateSize('sm');
                } else if ( this.forPlate === 6 ) {
                    this.changePlateSize('sm');
                } else if ( this.forPlate === 8 ) {
                    this.changePlateSize('sm');
                } else if ( this.forPlate === 9 ) {
                    this.changePlateSize('sm');
                } else if ( this.forPlate === 10 ) {
                    this.changePlateSize('sm');
                } else if ( this.forPlate === 11 ) {
                    this.changePlateSize('sm');
                }*/
                break;
            /*case (this.forPlate === 6):
                if (this.notNPlate === 3) {
                    this.changePlateSize('sm');
                }
                break;*/

            /*case (this.notNPlate === 2):
                // if (this.notForPlate > 0) {
                if ( this.forPlate === 5 ) {
                    this.newPlateQuery('md');
                }*/
                //     this.changePlateSize('none');
                    // this.newPlateQuery('md');
                // } else {
                // this.newPlateQuery('md');
                // }
                // break;

            /*case (this.forPlate === 6):
                if (this.notNPlate === 3) {
                    this.changePlateSize('sm');
                }
                break;

            case (this.forPlate === 7):
                if (this.notNPlate === 2) {
                    this.newPlateQuery('lg');
                }
                break;

            case (this.forPlate === 8):
                if (this.notNPlate === 2) {
                    this.newPlateQuery('md');
                } else if (this.notNPlate === 3) {
                    this.changePlateSize('sm');
                }
                break;

            case (this.forPlate === 9):
                if (this.notNPlate === 3) {
                    this.changePlateSize('sm');
                }
                break;

            case (this.forPlate === 10):
                if (this.notNPlate === 2) {
                    this.newPlateQuery('md');
                } else if (this.notNPlate === 3) {
                    this.changePlateSize('sm');
                }
                break;

            case (this.forPlate === 11):
                if (this.notNPlate === 3) {
                    this.changePlateSize('sm');
                }
                break;*/

            default:
                // this.changePlateSize('none');
                break;
        }

        /*console.log(
            ' dinner items ', this.forPlate, ' \n',
            ' dinner items NIP ', this.notNPlate, ' \n',
            ' other items ', this.notForPlate, ' \n',
            ' total itams in cart ', this.inCart, ' \n',
            ' plates in cart ', this.plateAmt, ' \n',
            ' orderTotal ', this.amtOrderTotal, ' \n',
        );*/

    }

    ngAfterViewInit(): void {
        const preTotal: number = this.elem.getElementsByClassName('cartSumTotal')[0].innerHTML;
        // console.log('sumTotal: ', preTotal);

    }

    ngOnDestroy(): void {
    }

}
