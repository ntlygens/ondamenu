import {
    AfterViewInit,
    ChangeDetectionStrategy,
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
    ApplicationRef, Injector, EmbeddedViewRef, ChangeDetectorRef
} from '@angular/core';
import {MatDialog} from '@angular/material';
import {CartService} from '../srvcs/cart.service';
import { PlateItemData } from '../../amm.enum';
import {PlateItemComponent} from './plate-item.component';
import {HttpParams} from '@angular/common/http';
import {of} from 'rxjs';
import {Arguments} from '@angular/cli/models/interface';

@Component({
    selector: 'amm-food-cart',
    template: `
        <div class="cartItemHldr">Shopping Cart</div>
        <ng-template #cart></ng-template>
        <div class="checkout">total</div>
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
    changeDetection: ChangeDetectionStrategy.Default
})

export class FoodCartComponent implements OnInit, AfterViewInit, OnChanges, OnDestroy {
    // @ViewChild('cartItem', {read: ViewContainerRef, static: true}) cartItem: ViewContainerRef;
    @ViewChild('cart', {read: ViewContainerRef, static: false}) cart: ViewContainerRef;

    @Input() amtItems4Plate: number;
    @Input() amtItemsNCart: number;
    @Input() amtItemsNotNPlate: number;
    @Input() amtItemsNot4Plate: number;

    @Output() cOrderID: EventEmitter<string> = new EventEmitter<string>();
    @Output() cOrderAmt: EventEmitter<number> = new EventEmitter<number>();
    @Output() closeOnSubmit = new EventEmitter();
    @Output() pushEvent = new EventEmitter();
    @Output() rmvItemCounter: EventEmitter<string> = new EventEmitter<string>();

    elem: any; mID: any; fID: any; fAmt: any; item: any; itemTitle: any;
    forPlate: number; notForPlate: number; notNPlate: number; inCart: number; userOrderID: any;

    nonDinnerItemsInCart: any; dinnerItemsInCart: any; desertItemsInCart: any;
    drinkItemsInCart: any; breakfastItemsInCart: any;
    foodPlate: any; foodPlateItemPrice: any; crntFoodPlate: any; lineItems4Bulk: any;
    orderTotal = 0.00; cartTotal: number; amtSubmitted4Payment: number;

    pretotal: any = []; plateData: any = []; dinnerItemsNotInPlate: Array<any> = [];
    plateOrder: any = []; prodsInCart: any = [];

    orderSent: boolean; isOrderIdVisible = false; isPlateVisible = false;
    plateSize: string; deleteBtnListener: () => void;

    something: any = [];

    private compRef: ComponentRef<PlateItemComponent>;
    private static insertAfter(referenceNode, newNode) {
        referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
    }
    private static getItemsInCart(elem: HTMLElement, arg: string): number {
        // const splitArgs = (arg.toString()).split(',');
        // const argArr: Array<any> = [];
        // for ( const arg of splitArgs) {
        let argArr: number;
        switch ( arg ) {

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
            case 'ALL':
                const allCartItems: any = elem.querySelectorAll('amm-cart-item');
                argArr = allCartItems.length;
                /*argArr.push({
                    [arg]: allCartItems.length
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

        // }

        console.log('argArr: ', argArr);
        return argArr;

    }

    constructor(
        private cs: CartService,
        private elemRef: ElementRef,
        private renderer: Renderer2,
        private dialog: MatDialog,
        private resolver: ComponentFactoryResolver,
        private appRef: ApplicationRef,
        private cdrRef: ChangeDetectorRef,
        private injector: Injector
    ) {
        const params = (new URL(document.location.href)).searchParams;
        const searchParams = new URLSearchParams(params);

        if ( searchParams.has( 'clid')) {
            this.mID = searchParams.get('clid');
        }

        this.elem = this.elemRef.nativeElement;
        this.orderSent = false;

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




    getOrderTotal() {
        // console.log('some');
        this.foodPlateItemPrice = this.elem.querySelector('.price');
        // console.log('p: '+this.foodPlateItemPrice);
        if (this.foodPlateItemPrice) {
            this.foodPlateItemPrice.classList.remove('price');
            this.foodPlateItemPrice.classList.add('priceAdded');
            // this.orderTotal += Number(this.foodPlateItemPrice.innerHTML);
            this.orderTotal += Number(this.foodPlateItemPrice.innerHTML * 100);
        } else {
            return;
        }

    }

    checkForExistingPlates() {
        // const num = 0;
        this.foodPlate = this.elem.querySelectorAll('div[data-name^="food-plate_"]');
        if (this.foodPlate.length > 0) {
            console.log('amt Plates: ' + this.foodPlate.length);
            return this.foodPlate.length;
        } else {
            return 0;
        }

    }

    newPlateQuery(size) {
        // if(this.orderItemsForPlate < 8) {
        if ( window.confirm('Add to Existing Plate?') ) {
            this.changePlateSize(size);
            console.log('You\'ve changed to ' + size + ' plate');
        } else {
            // this.changePlateSize('sm');
            console.log('You have confirmed to start a new plate');
        }
        // } else {
        //   this.changePlateSize('sm');
        //   console.log('You cannot add any more items to this plate. You MUST start a new plate');
        // }
    }

    createPlate(data): void {
        console.log('this is plate number ' + data.plateNum);
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

        this.crntFoodPlate = this.elem.getElementsByTagName('amm-plate-item')[data.plateNum - 1];
        // this.dinnerItemsNotInPlate = this.elem.getElementsByTagName('amm-cart-item');

        console.log('fp: ', this.crntFoodPlate );
        console.log('not 1st plated ' + this.dinnerItemsNotInPlate.length);

        for (const plate of this.dinnerItemsNotInPlate) {
            console.log('j: ', plate.getAttribute('aria-label'));
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
            x.setAttribute('data-name', 'plated');
            if (x.children[1].classList.contains('price')) {
                x.children[1].classList.remove('price');
                x.children[1].classList.add('priceAdded');
            }

        });
        this.getOrderTotal();
    }

    changePlateSize(size) {
        const amtPlates: number = this.checkForExistingPlates();
        const plateNum: number = (amtPlates + 1);
        console.log('prev-plates = ', amtPlates, ' crnt-plates = ', plateNum);

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
                // console.log('not plated ' + this.dinnerItemsNotInPlate.length);
                break;
            case 'md':
                this.crntFoodPlate = this.elem.getElementsByTagName('amm-plate-item')[amtPlates];
                this.crntFoodPlate.querySelector('#platePrice').innerHTML = '10.00';
                this.crntFoodPlate.querySelector('#platePrice').className = 'price';
                this.crntFoodPlate.querySelector('#plateSize').innerHTML = 'medium';
                this.orderTotal -= 7;
                console.log('const: ', this.dinnerItemsNotInPlate.length);
                this.dinnerItemsNotInPlate.forEach((x, i) => {
                    this.crntFoodPlate.appendChild(x);
                    // console.log('plates: '+this.foodPlate.childList);
                });

                const platedItemsMD = this.crntFoodPlate.querySelectorAll('div[aria-label="food-item"]');
                platedItemsMD.forEach( (x, i) => {
                    x.setAttribute('name', 'plated');
                    if (x.children[1].classList.contains('price')) {
                        x.children[1].classList.remove('price');
                        x.children[1].classList.add('priceAdded');
                    }
                });

                this.getOrderTotal();
                break;
            /*case 'lg':
                this.crntFoodPlate = this.elem.querySelector('[data-title="food-plate_' + amtPlates + '"]');
                this.crntFoodPlate.querySelector('#platePrice').innerHTML = '13.00';
                this.crntFoodPlate.querySelector('#platePrice').className = 'price';
                this.crntFoodPlate.querySelector('#plateSize').innerHTML = 'large';
                this.orderTotal -= 10;
                this.dinnerItemsNotInPlate.forEach((x, i) => {
                    this.crntFoodPlate.appendChild(x);
                    // console.log('plates: '+this.foodPlate.childList);
                });

                const platedItems_lg = this.crntFoodPlate.querySelectorAll('[aria-label="food-item"]');
                platedItems_lg.forEach( (x, i) => {
                    x.setAttribute('name', 'plated');
                    if (x.children[1].classList.contains('price')) {
                        x.children[1].classList.remove('price');
                        x.children[1].classList.add('priceAdded');
                    }
                });

                this.getOrderTotal();
                break;*/
        }
    }

    sendOrder() {
        // console.log('isDOrderSubmited: ', this.orderSent);
        return this.orderSent;
    }

    removeItem(e): any {
        const item = e.target;
        const itemTitle = e.target.title;
        const itemParent = e.target.parentElement;
        console.log('removing item.... ', itemTitle );  // , ' with classList: ', e.target.classList);
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
        const platedItemName = itemParent.getAttribute('name');
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
            const orderPlate = platedParent.querySelectorAll('div[data-title="plated"]');
            orderPlate.forEach( (x) => {
                x.removeAttribute('name');
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
        console.log('amt to minus: ', item2Sub, ' from ', this.orderTotal, ' total');

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
        // this.cs.setCartContainerRef(this.cart);

    }

    ngOnChanges(changes): void {
        console.log( 'hit: ', this.amtItems4Plate);
        this.forPlate = this.amtItems4Plate;
        this.notForPlate = this.amtItemsNot4Plate;
        this.notNPlate = this.amtItemsNotNPlate;
        this.inCart = this.amtItemsNCart;

        this.prodsInCart = this.elem.querySelectorAll('button.close');
        this.dinnerItemsNotInPlate = this.elem.querySelectorAll('amm-cart-item[title^="DINNER"]:not([data-name*="plated"])');

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
                // this.removeItem(event);
            }
            //     // console.log('u clicked on ', prod.title);
            //
            //
            // });

            // this.dinnerItemsNotInPlate.push(prod);
            console.log('prod: ', prod);
            // console.log( 'items: ', this.getCartItems() );
        }
        // this.dinnerItemsNotInPlate = this.elem.querySelectorAll('amm-cart-item[title^="DINNER"]:not([data-name*="plated"])');


        console.log(
            ' dinner items ', this.forPlate, ' \n',
            ' dinner items NIP ', this.notNPlate, ' \n',
            ' other items ', this.notForPlate, ' \n',
            ' total itams in cart ', this.inCart
        );

        // this.pushEvent.emit(null);

        switch (true) {
            /*case (this.notForPlate > 0):
                  // if ( this.notForPlate.length > 0)) {
                  this.changePlateSize('none');
                      console.log('got em');
                  // }
                  break;
      */
            case (this.forPlate === 3):
                if (this.dinnerItemsNotInPlate.length === 3) {
                    this.changePlateSize('sm');
                }
                break;

            case (this.forPlate === 5):
                // if (this.notForPlate > 0) {
                // this.changePlateSize('none');
                // } else {
                this.newPlateQuery('md');
                // }
                break;

            case (this.forPlate === 6):
                if (this.dinnerItemsNotInPlate.length === 3) {
                    this.changePlateSize('sm');
                }
                break;

            /*case (this.forPlate === 7):
                if (this.dinnerItemsNotInPlate.length === 2) {
                    this.newPlateQuery('lg');
                }
                break;

            case (this.forPlate === 8):
                if (this.dinnerItemsNotInPlate.length === 2) {
                    this.newPlateQuery('md');
                } else if (this.dinnerItemsNotInPlate.length === 3) {
                    this.changePlateSize('sm');
                }
                break;

            case (this.forPlate === 9):
                if (this.dinnerItemsNotInPlate.length === 3) {
                    this.changePlateSize('sm');
                }
                break;

            case (this.forPlate === 10):
                if (this.dinnerItemsNotInPlate.length === 2) {
                    this.newPlateQuery('md');
                } else if (this.dinnerItemsNotInPlate.length === 3) {
                    this.changePlateSize('sm');
                }
                break;

            case (this.forPlate === 11):
                if (this.dinnerItemsNotInPlate.length === 3) {
                    this.changePlateSize('sm');
                }
                break;

            default:
                this.changePlateSize('none');
                break;*/
        }
        // console.log('fd change: ', this.cart.element.nativeElement.children.count);
    }

    ngAfterViewInit(): void {
        // this.allItemsInCart = this.elem.querySelectorAll('div[aria-label="food-item"]');


        // this.dinnerItemsNotInPlate = this.elem.querySelectorAll('.dinner-item');
        // this.prodsInCart = this.elem.querySelectorAll('button.close');
        // this.dinnerItemsNotInPlate = this.elem.querySelectorAll('amm-cart-item[title^="DINNER"]:not([data-name*="plated"])');
        // this.dinnerItemsNotInPlate = this.elem.getElementsByClassName('dinner-item');
        // this.amtFoodItems = this.nonDinnerItemsInCart.length;
        // this.getCartItems();
    }

    ngOnDestroy(): void {
    }

}
