import {Injectable, Inject, ReflectiveInjector, ComponentFactoryResolver, ViewContainerRef} from '@angular/core';
import { Subject, BehaviorSubject } from 'rxjs';
import { CartItemData } from '../../amm.enum';

import { CartItemComponent } from '../comps/cart-item.component';

@Injectable({
    providedIn: 'root'
})
export class CartService {
    resolver;
    cartViewItem$: any;
    readonly cartViewContainer$;
    readonly newCartItem$: any;
    private setCartItem$: Subject<CartItemData> = new BehaviorSubject<CartItemData>(null);
    private setCartViewContainerRef$: Subject<ViewContainerRef> = new BehaviorSubject<ViewContainerRef>(null);

    constructor(
        @Inject(ComponentFactoryResolver) resolver,
        // @Inject(injecto) pi
    ) {
        this.newCartItem$ = this.setCartItem$.asObservable();
        this.cartViewContainer$ = this.setCartViewContainerRef$.asObservable();
        this.resolver = resolver;
    }

    setCartItemData(data) {
        this.setCartItem$.next(data);
    }

    setCartContainerRef(viewContainerRef) {
        // this.setCartViewContainerRef$.next(viewContainerRef);
        // viewContainerRef.clear();
        this.cartViewItem$ = viewContainerRef;
        // this.addDynamicComponent(data, );
        console.log('cont: ', this.cartViewItem$);
    }

    addDynamicComponent(itemData) {
        // this.cartViewItem$.clear();
        console.log('nowIt: ', itemData.pid);
        const factory = this.resolver.resolveComponentFactory(CartItemComponent);
        const componentRef = factory.create(this.cartViewItem$.parentInjector);
        componentRef.instance.cartItem = itemData;
        this.cartViewItem$.insert(componentRef.hostView);
        // this.cartViewContainer.instance.cartItem = itemData;
    }
}
