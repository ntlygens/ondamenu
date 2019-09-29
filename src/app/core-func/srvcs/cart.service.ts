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
import { Subject, BehaviorSubject } from 'rxjs';
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
    itemCount$ = 0; nonItemCount$ = 0;

    private setCartItem$: Subject<CartItemData> = new BehaviorSubject<CartItemData>(null);
    private setCartItems4PlateCount$: Subject<any> = new BehaviorSubject<any>(0);
    private setCartItemsNot4PlateCount$: Subject<any> = new BehaviorSubject<any>(0);
    private setCartViewContainerRef$: Subject<TemplateRef<any>> = new BehaviorSubject<TemplateRef<any>>(null);

    constructor() {
        this.newCartItemData$ = this.setCartItem$.asObservable();
        this.getCartItems4PlateCount$ = this.setCartItems4PlateCount$.asObservable();
        this.getCartItemsNot4PlateCount$ = this.setCartItemsNot4PlateCount$.asObservable();
        this.cartViewContainer$ = this.setCartViewContainerRef$.asObservable();
    }

    setCartItemData(data) {
        // this.setCartItem$.complete();
        this.setCartItem$.next(data);
        // console.log('dataname: ', data.cnm);
        if ( data.cnm === 'DINNER') { this.setCartItems4PlateCount(); } else { this.setCartItemsNot4PlateCount(); }
        // console.log('amt from srvc: ', this.getCartItems4PlateCount$);
    }

    setCartItems4PlateCount() {
        this.getCartItems4PlateCount$.subscribe(res => { this.itemCount$ = res; });
        this.setCartItems4PlateCount$.next(this.itemCount$ + 1);
        // return this.itemCount$;
    }

    setCartItemsNot4PlateCount() {
        this.getCartItemsNot4PlateCount$.subscribe(res => { this.nonItemCount$ = res; });
        this.setCartItemsNot4PlateCount$.next(this.nonItemCount$ + 1);
        // return this.itemCount$;
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
