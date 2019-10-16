import {
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    HostListener,
    OnDestroy,
    OnInit,
    ViewChild
} from '@angular/core';
import {MatBottomSheet, MatBottomSheetConfig} from '@angular/material';
import {ComponentPortal, Portal} from '@angular/cdk/portal';
import {ProfileComponent} from './profile.component';
import {FoodCartComponent} from './food-cart.component';
import {lift} from '../animations/animations.component';
import {CartService} from '../srvcs/cart.service';
import {takeUntil} from 'rxjs/operators';
import {Subject} from 'rxjs';

@Component({
    selector: 'amm-footer-bar',
    template: `
        <div class="footerbar w-100 d-flex" [@footerAnimations]="ftrState">
            <div class="uProfile" [ngStyle]="{backgroundImage: 'url(../../../assets/backgrounds/mobile/baseline_account_circle_black_18dp@2x.png)'}" (click)="openProfile();"></div>
            <div class="uSearch" [ngStyle]="{backgroundImage: 'url(../../../assets/backgrounds/mobile/baseline_search_black_24dp.png)'}" (click)="openSearch();"></div>
            <div class="uFilter" [ngStyle]="{backgroundImage: 'url(../../../assets/backgrounds/mobile/baseline_tune_black_24dp.png)'}" (click)="openFilter();"></div>
            <div class="uCart" [ngStyle]="{backgroundImage: 'url(../../../assets/backgrounds/mobile/baseline_shopping_cart_black_24dp.png)'}" (click)="openCart();"></div>
            <!--<div class="uCart" [ngStyle]="{backgroundImage: 'url(../../../assets/backgrounds/mobile/baseline_shopping_cart_black_24dp.png)'}" (click)="cartRef.viewCart(); toggleCartButton($event);"></div>-->
        </div>
        <div>
            <ng-template [cdkPortalOutlet]="portal"></ng-template>
            <amm-food-cart
                #shoppingCart class="shoppingCart w-100"
                [@cartAnimations]="crtState"
                [amtItems4Plate]="shoppingCart.getDinnerItems()"
                [amtItemsNot4Plate]="shoppingCart.getNonDinnerItems()"
                [amtItemsNCart]="shoppingCart.getAllCartItems()"
                [amtItemsNotNPlate]="shoppingCart.getNotPlatedItems()"
                [amtPlatesNCart]="shoppingCart.getAmtPlates()"
            ></amm-food-cart>
            <amm-food-cart-ui #cartUI [dinnerSelection]="shoppingCart.getDinnerItems()" [cartSelection]="shoppingCart.getAllCartItems()" [dinnerNotSelected]=""></amm-food-cart-ui>
        </div>
      `,
    styles: [`
        .footerbar {
            max-height: 60px;
            min-height: 50px;
            padding: 0.5rem;
            text-align: center;
            background-color: #BB3523f5;
            justify-content: space-around;
            position: fixed;
            bottom: 0px;
            z-index: 90;
            box-shadow: #444 0 -1px 4px 0;

        }
        .footerbar h5 {
            position: relative;
            top: 1.25rem;
            margin: auto;
            color: #fff;
        }

        .uProfile, .uSearch, .uFilter, .uCart {
            width: 30px;
            height: 30px;
            background: center center no-repeat;
            background-size: cover;

        }

        .shoppingCart, .profileComp {
            position: fixed;
            background: #ea6a5e;
            height: 100%;
        }

        .bottomSheetBackdrop {
            user-select: none;
            pointer-events: none;
            z-index: 180;
        }
    `],
    providers: [
        MatBottomSheetConfig
    ],
    animations: [ lift ],
    changeDetection: ChangeDetectionStrategy.Default
})
export class FooterBarComponent implements OnInit, AfterViewInit, OnDestroy {
    @ViewChild('shoppingCart', {static: false}) shoppingCart;
    private destroy$ = new Subject<any>();
    amt4Plate: number; amtNot4Plate: number; amtNCart: number; amtNotNPlate: number;
    ftrState = 'hide';
    crtState = 'close';
    prflState = 'close';
    srchState = 'close';
    portal: Portal<any>;
    cartSelectedPortal: Portal<any>;
    profileSelectedPortal: Portal<any>;
    profileComponentPortal: ComponentPortal<ProfileComponent>;
    cartComponentPortal: ComponentPortal<FoodCartComponent>;

    constructor(
        private cs: CartService,
        private el: ElementRef,
        private btmSht: MatBottomSheet,
        private cdRef: ChangeDetectorRef,
        private profileCnfg: MatBottomSheetConfig<ProfileComponent>,
        private searchCnfg: MatBottomSheetConfig<ProfileComponent>,
        private filterCnfg: MatBottomSheetConfig<ProfileComponent>,
        private cartCnfg: MatBottomSheetConfig<FoodCartComponent>,
    ) {}

    /*@HostListener('window:scroll', ['$event'])
        onWindowScroll(e) {
            if (true === window.pageYOffset > 20) {
                this.ftrState = 'show';
            }
    }*/

    openProfile() {
        this.profileCnfg = {
            hasBackdrop: true,
            disableClose: false,
            backdropClass: 'bottomSheetBackdrop'
        };

        if ( this.btmSht._openedBottomSheetRef) {
            this.btmSht.dismiss();
        } else {
            this.btmSht.open(ProfileComponent, this.profileCnfg );
            console.log( 'btmSht opened');
        }
    }

    openSearch() {
        this.searchCnfg = {
            hasBackdrop: true,
            disableClose: false,
            backdropClass: 'bottomSheetBackdrop'
        };

        // this.bottomSheet.open(BottomSheetComponent, this.bottomSheetConfig );
        // this.btmSht.open(comp, this.searchCnfg );
    }

    openFilter() {
        this.filterCnfg = {
            hasBackdrop: true,
            disableClose: false,
            backdropClass: 'bottomSheetBackdrop'
        };

        // this.bottomSheet.open(BottomSheetComponent, this.bottomSheetConfig );
        // this.btmSht.open(comp, this.filterCnfg );
    }

    openCart() {
        // this.portal = this.cartSelectedPortal;
        // this.cartSelectedPortal = this.cartComponentPortal;
        if ( this.crtState === 'close') {
            this.crtState = 'open';
        } else {
            this.crtState = 'close';
        }

    }

    toggleFooter() {
        if ( this.ftrState === 'hide') {
            this.ftrState = 'show';
        } else if ( this.ftrState === 'show' ) {
            this.ftrState = 'hide';
        }
    }


    /* // ==================== // */
    ngOnInit() {
        // this.profileComponentPortal = new ComponentPortal(ProfileComponent);
        // this.cartComponentPortal = new ComponentPortal(FoodCartComponent);
    }

    ngAfterViewInit(): void {
        // this.portal = this.cartSelectedPortal;
        // this.cartSelectedPortal = this.cartComponentPortal;
        /*this.cs.getCartItems4PlateCount$.pipe(takeUntil(this.destroy$)).subscribe(
            (res) => {
                this.amt4Plate = res;
            }
        );
        this.cs.getCartItemsNot4PlateCount$.pipe(takeUntil(this.destroy$)).subscribe(
            (res) => {
                this.amtNot4Plate = res;
            }
        );
        this.cs.getCartItemsNotNPlateCount$.pipe(takeUntil(this.destroy$)).subscribe(
            (res) => {
                this.amtNotNPlate = res;
            }
        );
        */
        // this.amt4Plate = this.shoppingCart.getDinnerItems();
        // this.amtNCart = this.shoppingCart.getAllCartItems();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

}
