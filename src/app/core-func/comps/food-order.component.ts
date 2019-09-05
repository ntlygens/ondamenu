import { Component, OnInit, Input, Output, ElementRef, EventEmitter, Renderer2 } from '@angular/core';
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
            [ngClass]="isIncremental ? ( isAdded ? 'visible' : 'hidden' ) : (isAdded ? 'hidden' : 'visible')"
            [title]="prodid"
            name='noincr'
            (click)="addItem($event);"
          >
            Add
          </button>

          <button mat-raised-button id="inCart" class="btn btn-success btn-sm fSldBtn" [ngClass]="isInCart ? 'visible' : 'hidden' " >InCart</button><!--<br /><span class="hidden notify">{{message}}</span>-->

      `,
    styles: [`
          :host { margin-left: 0px; }
          .visible { display: block !important }
          .hidden { display: none !important }
          .notify { color:orangered; font-size: 75%; font-variant: small-caps }
      `],
    providers: []
})
export class FoodOrderComponent implements OnInit {
    @Input() prodid = 'defaultProdID';
    @Input() isIncremental: boolean;
    @Input() itemCount: number;
    @Output() cartEmitter: EventEmitter<string> = new EventEmitter<string>();
    @Output() toggleIncr: EventEmitter<any> = new EventEmitter<any>();
    @Output() rmvBtnEmitter: EventEmitter<any> = new EventEmitter<any>();
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
    orderBtn: any;

    deleteItemBtn: any;



    // static methods //
    public static emitRemove_click(e): any {
        console.log('worksss -- ', e.target.title);
        // this.rmvBtnEmitter.emit(event);
        // this.removeFromCart();
        // let rmv: EventEmitter<any> = new EventEmitter<any>();
        //    rmv.emit(event);

        // that.renderer.listen(e.target, 'click', () => {
        //   // this.rmvBtn_Emitter.emit(event);
        //   console.log('wheato');
        // });


    }

    /*public static removeFromCart(e): any {
      // this.rmvBtnEmitter.emit(event);
      console.log('e = ', e.target.title);
    }*/



    constructor(private elemRef: ElementRef, private renderer: Renderer2) {
        this.isOrdered = false;
        this.isAdded = false;
        this.isInCart = false;
        this.randNum = Math.floor(Math.random() * 90 + 10);
        this.elem = this.elemRef.nativeElement;

        console.log('foodOrder Incr: ', this.isIncremental);

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
        // if ( this.orderBtn > 0 ) { this.toggleIncrBtn(e); }
        this.toggleIncrBtn(e);
        this.isAdded = !this.isAdded;
        // console.log('selected Item count: ', this.itemCount);
        this.foodCart = document.querySelector('.foodCart');
        // this.btnIsMains = document.querySelectorAll('button:disabled.allMenusBtn');
        // == this one == //
        this.btnIsMain = document.querySelector('button:disabled.allMenusBtn');
        this.menuCatName = document.querySelector('#DINNER');
        // console.log('item Cat: ', this.btnIsMain.textContent);
        console.log(e.target.title, ' added from :', this.btnIsMain.textContent, ': => ', this.itemCount, ' times.');

        if (!this.btnIsMain) {
            this.menuCat = '';
        } else {
            this.menuCat = this.btnIsMain.textContent;
        }

        const fragment = document.createDocumentFragment();

        const lineItem = e.target.title;
        // console.log('totle: ', lineItem);
        const itemTitle = this.elem.parentElement.parentElement.querySelectorAll('.itemTitle');
        // let itemTitle = this.elem.parentElement.parentElement.classList;
        // console.log('wylf: ', itemTitle);
        const itemPrice = this.elem.parentElement.parentElement.querySelector('.price').textContent;
        ///// let itemPrice = this.elem.parentElement.querySelector('.price').textContent;
        const notify = this.elem.querySelector('.notify');
        // console.log('evt: Item ID - '+e.target.title+' \nOrder ID: '+order_id+'\nNotification: '); ///+notify.innerHTML);

        const elmnt = this.elem;

        // TODO: Handle adding items in-app. Handle editing cart in-app.
        // TODO: Push item to array then iterate through array to send/add items to order.
        const cntnr = document.createElement('div');
        const label = document.createElement('button');
        const cost = document.createElement('button');
        const btn = document.createElement('button');
        cntnr.className = 'btn-group justify-content-between';
        cntnr.setAttribute('role', 'group');
        cntnr.setAttribute('aria-label', 'food-item');
        cntnr.setAttribute('title', this.menuCat);
        cntnr.style.cssText = 'width: inherit; margin-left: 0px; margin-bottom: 0.125rem;';
        label.className = 'cartItem title btn btn-sm btn-xs btn-secondary';
        label.textContent = itemTitle[0].textContent + '  x  ' + this.itemCount;
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
        // btn.onclick = FoodOrderComponent.emitRemove_click(e);
        // btn.onclick = this.rmvBtnEmitter.emit(e);
        // this.deleteItemBtn = this.renderer.listen(btn, 'click', this.removeFromCart(e));
        // this.deleteItemBtn = btn.addEventListener('click', this.removeFromCart(e));
        // btn.onclick = this.removeFromCart(event);
        // btn.onclick = function() { FoodOrderComponent };
        // btn.addEventListener('click', function() {
        //   console.log('event');
        //   // @ts-ignore
        //   FoodOrderComponent.removeFromCart(event);
        //   // FoodOrderComponent.emitRemove_click(e);
        // } );
        cntnr.appendChild(label);
        cntnr.appendChild(cost);
        cntnr.appendChild(btn);
        fragment.appendChild(cntnr);
        // fragment.getElementById('deleteBtn').onclick = this.removeFromCart(e);
        // fragment.getElementById('deleteBtn').addEventListener('click', function() {
        //   // @ts-ignore
        //   FoodOrderComponent.removeFromCart(e);
        // });
        // if (this.foodCart.querySelectorAll('div[name^="food-plate"]').length !== 3) {
        // this.isOrdered = true;
        // this.foodCart.insertBefore(fragment, this.foodCart.lastElementChild);
        // } else {
        // this.menuCatName.style.pointerEvents = 'none';
        this.foodCart.insertBefore(fragment, this.foodCart.lastElementChild);
        // }
    }


    // navigation hooks //
    ngOnInit() {
        /*if (this.isIncremental) {
          console.log('yepL: ', this.isIncremental);
        } else {
          console.log('nope: ', this.isIncremental);
        }*/
        this.orderBtn = this.elem.querySelectorAll('button #add2Order').length;

    }





}
