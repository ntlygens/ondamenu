import {
    Injectable,
    Inject,
    Injector,
    EmbeddedViewRef,
    ApplicationRef,
    TemplateRef,
    ComponentFactoryResolver,
    ViewContainerRef,
    ComponentFactory, ComponentRef
} from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Subject, BehaviorSubject, Observable } from 'rxjs';
import { CartItemData } from '../../amm.enum';
import { CartItemComponent } from '../comps/cart-item.component';

@Injectable({
    providedIn: 'root'
})
export class CartService {
    readonly cartViewContainer$;
    readonly newCartItemData$: any;
    readonly getCartItems4PlateCount$: any;
    readonly getCartItemsNot4PlateCount$: any;
    readonly getCartItemsNotNPlateCount$: any;
    readonly orderID$: any;
    readonly orderAmt$: any;
    itemCount$: number; nonItemCount$: number; nonPltdItemCount$: number;

    private setCartItem$: Subject<CartItemData> = new BehaviorSubject<CartItemData>(null);
    private setCartItems4PlateCount$: Subject<any> = new BehaviorSubject<any>(0);
    private setCartItemsNot4PlateCount$: Subject<any> = new BehaviorSubject<any>(0);
    private setCartItemsNotNPlateCount$: Subject<any> = new BehaviorSubject<any>(0);
    private setCartViewContainerRef$: Subject<TemplateRef<any>> = new BehaviorSubject<TemplateRef<any>>(null);
    private setOrderID$: Subject<string> = new BehaviorSubject<string>(null);
    private setOrderAmt$: Subject<number> = new BehaviorSubject<number>(null);

    private dQueryURL = 'https://smashradio1fm.com/php/';

    private static createJSONPostHeader(headers: HttpHeaders) {
        headers.append('Content-Type', 'application/json');
    }

    constructor(
        private http: HttpClient
    ) {
        this.newCartItemData$ = this.setCartItem$.asObservable();
        this.getCartItems4PlateCount$ = this.setCartItems4PlateCount$.asObservable();
        this.getCartItemsNot4PlateCount$ = this.setCartItemsNot4PlateCount$.asObservable();
        this.getCartItemsNotNPlateCount$ = this.setCartItemsNotNPlateCount$.asObservable();
        this.cartViewContainer$ = this.setCartViewContainerRef$.asObservable();

        this.orderID$ = this.setOrderID$.asObservable();
        this.orderAmt$ = this.setOrderAmt$.asObservable();
    }

    setCartItemData(data) {
        // this.setCartItem$.complete();
        this.setCartItem$.next(data);
        // console.log('dataname: ', data.cnm);
        // if ( data.cnm === 'DINNER') { this.setCartItems4PlateCount(); } else { this.setCartItemsNot4PlateCount(); }
        // console.log('amt from srvc: ', this.getCartItems4PlateCount$);
        // console.log('amtInPLT: ', document.querySelectorAll('amm-cart-item[title^="DINNER"]:not([data-name*="plated"])') );
    }

    setOrderId(orderid) {
        this.setOrderID$.next(orderid);
    }

    setOrderAmt(orderamt) {
        this.setOrderAmt$.next(orderamt);
    }


    getOrderId(mID: string): Observable<any> {
        /// USE BELOW FOR DEVELOPMENT ///
        // this.dURL = this.API_PAY_url + this.API_orders + this.openState + '&' + this.API_tempAccess;
        // console.log('url: ', this.dURL);
        const nuParamGetOrderID = new HttpParams()
            .set('getOrderID', mID );

        // let headers = new HttpHeaders();
        // this.createJSONPostHeader(headers);

        return this.http.get(this.dQueryURL, { params: nuParamGetOrderID});
        /// ------------------------ ///

        // let headers = new HttpHeaders();
        // headers.append('state', 'open ');

        /// USE BELOW FOR PRODUCTION ///
        // this.dURL = this.API_base+this.API_orders+this.openState;
        // this.dURL = this.queryUrl + this.API_orders + this.openState;
        // return this.http.get(this.queryUrl);
        /// ------------------------ ///
    }

    getAllOrders(mID: string) {
        const nuParamGetAllOrders = new HttpParams()
            .set('getAllOrders', mID );

        // let headers = new HttpHeaders();
        // this.createJSONPostHeader(headers);

        return this.http.get(this.dQueryURL, { params: nuParamGetAllOrders});
    }

    addItems2Order(items) {
        // console.log('items: ' + JSON.stringify(items));
        // this.dURL = this.API_PAY_url + this.API_orders + '/' + orderid + this.API_bulk_lineItems + '?' + this.API_tempAccess + this.authService.oauthToken;
        /*let body = {
          'items': items,
          'orderid': orderid

        };*/

        let nuParamsAddItems2Order = new HttpParams();
        // .set('items', items);
        // .set('orderid', orderid);
        nuParamsAddItems2Order = items;

        const headers = new HttpHeaders();
        CartService.createJSONPostHeader(headers);

        // console.log('bdy \n' + JSON.stringify(items));
        // console.log('foodOrder2Send: ', nuParamsAddItems2Order );
        return this.http.post(`${this.dQueryURL}`, [nuParamsAddItems2Order], { headers });
    }

    /*setCartItems4PlateCount() {
        this.getCartItems4PlateCount$.subscribe(res => { this.itemCount$ = res; });
        this.setCartItems4PlateCount$.next(this.itemCount$ + 1);

        const data = document.getElementsByClassName('shoppingCart')[0].querySelectorAll('.dinner-item');
        console.log('amt: ', data.length);
        // return this.itemCount$;
    }

    setCartItemsNot4PlateCount() {
        this.getCartItemsNot4PlateCount$.subscribe(res => { this.nonItemCount$ = res; });
        this.setCartItemsNot4PlateCount$.next(this.nonItemCount$ + 1);
        // return this.itemCount$;
    }

    setCartItemsNotNPlateCount() {
        this.getCartItemsNotNPlateCount$.subscribe(res => { this.nonPltdItemCount$ = res; });
        this.setCartItemsNotNPlateCount$.next(this.nonPltdItemCount$ + 1);
        // return this.itemCount$;
    }*/

    setElemAttributes( elem, attrs ): void {
        for (const key in attrs) {
            if (!elem.getAttribute(key)) {
                elem.setAttribute(key, attrs[key]);
            } else if ( elem.getAttribute(key) === 'class') {
                elem.addClassName([key]);
            }
        }
    }

    // ==== WORKING RIGHT ==== //
    /*addDynamicComponent(): any {
        console.log('--strted--');
        // this.compRef.destroy();
        this.newCartItemData$.subscribe( (res: CartItemData) => {
            const factory = this.resolver.resolveComponentFactory(CartItemComponent);
            // if ( this.compRef ) { this.compRef.destroy(); }
            this.compRef = factory.create(this.injector);
            this.compRef.instance.cartItem = res;

            this.appRef.attachView(this.compRef.hostView);

            const domElem = (this.compRef.hostView as EmbeddedViewRef<any>)
                .rootNodes[0] as HTMLElement;
            const cart = document.getElementsByClassName('shoppingCart')[0];
            cart.appendChild(domElem);

            console.log('vcf# ', this.appRef.viewCount);
        });

    }*/
    // ----------------------- //

}
