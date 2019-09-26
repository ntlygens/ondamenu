import {
    Component,
    OnInit,
    Input,
    Output,
    OnDestroy,
    ElementRef,
    EventEmitter,
    Renderer2,
    ComponentFactoryResolver,
    ApplicationRef, Injector, ComponentRef, EmbeddedViewRef, AfterViewInit
} from '@angular/core';
import { CartService } from '../srvcs/cart.service';
import { CartItemData } from '../../amm.enum';
import {takeUntil} from 'rxjs/operators';
import {Subject} from 'rxjs';
import {CartItemComponent} from './cart-item.component';

declare var $: any;

@Component({
    selector: 'amm-food-order',
    template: `
        <button
            *ngIf='isIncremental'
            mat-raised-button id="add2Order"
            class="btn btn-outline-secondary btn-sm fOdrBtn"

            [title]="prodid"
            name='incr'
            (click)="addItem2Order($event);"
        >
            Order
        </button>

        <button
            mat-raised-button id="add2Cart"
            class="btn btn-outline-warning btn-sm fAddBtn"
            [ngClass]="isIncremental ? ( isAdded ? 'visible' : 'hidden' ) : (isAdded ? 'hidden' : 'visible colorWarn')"
            [title]="prodid"
            name='noincr'
            (click)="addItem($event);"
        >
            Add
        </button>

        <button mat-raised-button id="inCart" class="btn btn-success btn-sm fSldBtn" [ngClass]="isInCart ? 'visible' : 'hidden' " >InCart</button>

    `,
    styles: [`
        :host { margin-left: 0px; }
        .visible { display: block !important }
        .hidden { display: none !important }
        .notify { color:orangered; font-size: 75%; font-variant: small-caps }
        .colorWarn { background: #8fd450}
    `],
    providers: []
})
export class FoodOrderComponent implements OnInit, AfterViewInit, OnDestroy {
    @Input() prodid: string;
    @Input() prodname: string;
    @Input() prodprice: number;
    @Input() isIncremental: boolean;
    @Input() itemCount: number;
    @Output() cartEmitter: EventEmitter<string> = new EventEmitter<string>();
    @Output() toggleIncr: EventEmitter<any> = new EventEmitter<any>();
    @Output() rmvBtnEmitter: EventEmitter<any> = new EventEmitter<any>();
    private destroy$ = new Subject<any>();
    private compRef: ComponentRef<CartItemComponent>;
    isOrdered: boolean;
    isAdded: boolean;
    isInCart: boolean;
    message: string;
    elem: any;
    sTimer: any;
    eTimer: any;
    notification: HTMLBodyElement;
    public shpCart: any = [];

    foodCart: any;
    menuCat: any;
    btnIsMain: any;
    menuCatName: any;

    randNum: number;
    amtClick: number;
    amtInCart: any;
    eventListener: any;

    that: any = this;
    orderbutton: any;

    deleteItemBtn: any;



    // static methods //
    public static insertAfter(referenceNode, newNode) {
        referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
    }

    public static emitRemove_click(e): any {
        console.log('worksss -- ', e.target.title);
    }

    /*public static removeFromCart(e): any {
      // this.rmvBtnEmitter.emit(event);
      console.log('e = ', e.target.title);
    }*/



    constructor(
        private elemRef: ElementRef,
        private renderer: Renderer2,
        private cs: CartService,
        private resolver: ComponentFactoryResolver,
        private appRef: ApplicationRef,
        private injector: Injector
    ) {
        this.isOrdered = false;
        this.isAdded = false;
        this.isInCart = false;
        this.randNum = Math.floor(Math.random() * 90 + 10);
        this.elem = this.elemRef.nativeElement;

    }

    //
    // TODO: put foodcart component into sidnav comp in nav drawer in over mode **
    // TODO: put foodcategory component into sidnav comp in nav content in over mode **
    //


    removeFromCart(e): any {
        this.rmvBtnEmitter.emit(event);
        // console.log('e = ', e.target.title);
        console.log('e = eeee ');
    }

    toggleIncrBtn(e): any {
        // this.cartEmitter.emit(`then it is: ${this.isIncremental}`);
        this.toggleIncr.emit(e);
        // this.isOrdered = !this.isOrdered;
        // this.isAdded = !this.isAdded;
    }

    addItem2Order(e) {
        e.target.parentNode.classList.toggle('hidden');
        this.toggleIncrBtn(e);
        this.isAdded = !this.isAdded;
    }




    // function calls //

    addItem(e): any {
        this.isInCart = !this.isInCart;
        this.toggleIncrBtn(e);
        this.isAdded = !this.isAdded;

        const lineItem = e.target;

        // == this one == //
        const navBtn = lineItem.closest('#menuRef');
        // const navBtn = document.querySelector('button:disabled:not(#touchNav)');
        const catNm = navBtn.getAttribute('ng-reflect-menu-nav');
        const catID = navBtn.getAttribute('ng-reflect-menu-i-d');
        const clID = navBtn.getAttribute('ng-reflect-client-i-d');
        // this.menuCatName = document.querySelector('#DINNER');

        console.log('(', this.prodid, ')/', this.prodname, ' added from ', catNm, ' => ', this.itemCount, 'x for ', (this.prodprice * this.itemCount), '\n');

        if (!catNm) {
            this.menuCat = '';
        } else {
            this.menuCat = catNm;
        }

        this.cs.setCartItemData ({
            pid: this.prodid,
            prod_name: this.prodname,
            amt: this.itemCount,
            price: (this.prodprice * this.itemCount),
            cnm: catNm,
            cid: catID,
            client_id: clID
        });
        this.addCartItemComp();

        // TODO: Handle adding items in-app. Handle editing cart in-app.
        // TODO: Push item to array then iterate through array to send/add items to order.
        /*const cntnr = document.createElement('div');
        const label = document.createElement('button');
        const cost = document.createElement('button');
        const btn = document.createElement('button');
        cntnr.className = 'btn-group justify-content-between';
        cntnr.setAttribute('role', 'group');
        cntnr.setAttribute('aria-label', 'food-item');
        cntnr.setAttribute('title', this.menuCat);
        cntnr.style.cssText = 'width: inherit; margin-left: 0px; margin-bottom: 0.125rem;';
        label.className = 'cartItem title btn btn-sm btn-xs btn-secondary';
        label.textContent = itemTitle.textContent + '  x  ' + this.itemCount;
        label.style.width = '50%';
        label.style.overflow = 'hidden';
        cost.className = 'cartItem amt price btn btn-sm btn-xs btn-secondary';
        cost.textContent = itemPrice;
        cost.style.width = '30%';
        btn.className = 'btn btn-sm btn-xs rmvBtn close btn-warning';
        btn.type = 'button';
        btn.id = 'deleteBtn';
        btn.title = lineItem;
        btn.style.color = 'white';
        btn.style.width = '20%';
        btn.style.background = 'darkorange';
        btn.innerHTML = 'x';

        cntnr.appendChild(label);
        cntnr.appendChild(cost);
        cntnr.appendChild(btn);
        fragment.appendChild(cntnr);

        this.foodCart.insertBefore(fragment, this.foodCart.lastElementChild);*/
    }

    addCartItemComp(): void {
        this.cs.newCartItemData$.subscribe(
            (res: CartItemData) => {
                const factory = this.resolver.resolveComponentFactory(CartItemComponent);
                if (this.compRef) { this.compRef.destroy(); }

                this.compRef = factory.create(this.injector);
                this.compRef.instance.cartItem = res;

                this.appRef.attachView(this.compRef.hostView);

                const domElem = (this.compRef.hostView as EmbeddedViewRef<any>)
                    .rootNodes[0] as HTMLElement;
                const cart = document.getElementsByClassName('shoppingCart')[0];
                FoodOrderComponent.insertAfter(cart.firstChild, domElem);
            }
        );

    }


    // navigation hooks //
    ngOnInit() {
        this.orderbutton = this.elem.querySelectorAll('button #add2Order').length;
        // console.log('foodOrder Incr: ', this.isIncremental);
    }

    ngAfterViewInit(): void {
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }


}
