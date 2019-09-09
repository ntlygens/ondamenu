import { Injectable, Inject, Injector, EmbeddedViewRef, ApplicationRef, ReflectiveInjector, ComponentFactoryResolver, ViewContainerRef} from '@angular/core';
import { Subject, BehaviorSubject } from 'rxjs';
import { CartItemData } from '../../amm.enum';

import { CartItemComponent } from '../comps/cart-item.component';
import {take, takeUntil} from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class CartService {
    readonly cartViewContainer$;
    readonly newCartItemData$: any;

    private setCartItem$: Subject<CartItemData> = new BehaviorSubject<CartItemData>(null);
    private setCartViewContainerRef$: Subject<ViewContainerRef> = new BehaviorSubject<ViewContainerRef>(null);

    compRef: any;
    constructor(
        // @Inject(ComponentFactoryResolver) resolver,
        private resolver: ComponentFactoryResolver,
        private appRef: ApplicationRef,
        private injector: Injector,
    ) {
        this.newCartItemData$ = this.setCartItem$.asObservable();
        this.cartViewContainer$ = this.setCartViewContainerRef$.asObservable();
        this.resolver = resolver;
    }

    setCartItemData(data) {
        this.setCartItem$.next(data);
    }

    setCartContainerRef(container: ViewContainerRef) {
        this.setCartViewContainerRef$.next(container);
        // viewContainerRef.clear();
        // this.cartViewItem$ = viewContainerRef;
        // this.addDynamicComponent(data, );
        // console.log('cont: ', this.cartViewItem$);
        // this.addDynamicComponent(this.cartViewContainer$);
    }

    // addDynamicComponent(viewContainer: ViewContainerRef) {
    addDynamicComponent(e) {
        this.newCartItemData$.subscribe( (res: CartItemData[]) => {
            const factory = this.resolver.resolveComponentFactory(CartItemComponent);
            this.compRef = factory.create(this.injector);
            this.appRef.attachView(this.compRef.hostView);
            this.compRef.instance.cartItem = res;

            const domElem = (this.compRef.hostView as EmbeddedViewRef<any>)
                .rootNodes[0] as HTMLElement;
            const cart = document.getElementsByClassName('cdk-overlay-container')[0];
            cart.appendChild(domElem);

        });

    }


    // ==== WORKING RIGHT ==== //
    /*addDynamicComponent(e) {
        this.newCartItemData$.subscribe( (res: CartItemData[]) => {
            const factory = this.resolver.resolveComponentFactory(CartItemComponent);
            this.compRef = factory.create(this.injector);
            this.appRef.attachView(this.compRef.hostView);
            this.compRef.instance.cartItem = res;

            const domElem = (this.compRef.hostView as EmbeddedViewRef<any>)
                .rootNodes[0] as HTMLElement;
            const cart = document.getElementsByClassName('cdk-overlay-container')[0];
            cart.appendChild(domElem);

        });

    }*/
    // ----------------------- //

}
