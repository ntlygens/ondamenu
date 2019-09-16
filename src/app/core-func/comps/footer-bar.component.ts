import { Component, ElementRef, OnInit, AfterViewInit, HostListener } from '@angular/core';
import { MatBottomSheet, MatBottomSheetConfig } from '@angular/material';
import { Portal, ComponentPortal } from '@angular/cdk/portal';
import { ProfileComponent } from './profile.component';
import { FoodCartComponent } from './food-cart.component';
import { lift } from '../animations/animations.component';

@Component({
    selector: 'amm-footer-bar',
    template: `
        <div class="footerbar w-100 d-flex" [@footerAnimations]="state">
            <div class="uProfile" [ngStyle]="{backgroundImage: 'url(../../../assets/backgrounds/mobile/baseline_account_circle_black_18dp@2x.png)'}" (click)="openProfile();"></div>
            <div class="uSearch" [ngStyle]="{backgroundImage: 'url(../../../assets/backgrounds/mobile/baseline_search_black_24dp.png)'}" (click)="openSearch();"></div>
            <div class="uFilter" [ngStyle]="{backgroundImage: 'url(../../../assets/backgrounds/mobile/baseline_tune_black_24dp.png)'}" (click)="openFilter();"></div>
            <div class="uCart" [ngStyle]="{backgroundImage: 'url(../../../assets/backgrounds/mobile/baseline_shopping_cart_black_24dp.png)'}" (click)="openCart();"></div>
            <!--<div class="uCart" [ngStyle]="{backgroundImage: 'url(../../../assets/backgrounds/mobile/baseline_shopping_cart_black_24dp.png)'}" (click)="cartRef.viewCart(); toggleCartButton($event);"></div>-->
        </div>
        <ng-template [cdkPortalOutlet]="portal"></ng-template>
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

        .bottomSheetBackdrop {
            /*user-select: none;
            pointer-events: none;
            z-index: 80;*/
        }
    `],
    providers: [
        MatBottomSheetConfig
    ],
    animations: [ lift ]
})
export class FooterBarComponent implements OnInit, AfterViewInit {
    state = 'hide';
    portal: Portal<any>;
    cartSelectedPortal: Portal<any>;
    profileSelectedPortal: Portal<any>;
    profileComponentPortal: ComponentPortal<ProfileComponent>;
    cartComponentPortal: ComponentPortal<FoodCartComponent>;

    constructor(
        private el: ElementRef,
        private btmSht: MatBottomSheet,
        private profileCnfg: MatBottomSheetConfig<ProfileComponent>,
        private searchCnfg: MatBottomSheetConfig<ProfileComponent>,
        private filterCnfg: MatBottomSheetConfig<ProfileComponent>,
        private cartCnfg: MatBottomSheetConfig<FoodCartComponent>,
    ) {
        // this.openCart(Event);
        // console.log('event');
    }

    @HostListener('window:scroll', ['$event'])
        onWindowScroll(e) {
            if ( window.pageYOffset > 100 ) {
                this.state = 'show';
                this.openCart();
                // console.log('show');
            } /*else {
                this.state = 'hide';
                // console.log('hide');
            }*/
    }

    openProfile() {
        this.portal = this.profileSelectedPortal;
        this.profileSelectedPortal = this.profileComponentPortal;
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

    /*openCart() {
        this.cartCnfg = {
            hasBackdrop: true,
            disableClose: false,
            backdropClass: 'bottomSheetBackdrop',

        };

        // this.bottomSheet.open(BottomSheetComponent, this.bottomSheetConfig );
        this.btmSht.open(FoodCartComponent, this.cartCnfg );
    }*/

    openCart() {
        this.portal = this.cartSelectedPortal;
        this.cartSelectedPortal = this.cartComponentPortal;
    }


    /* // ==================== // */
    ngOnInit() {
        this.profileComponentPortal = new ComponentPortal(ProfileComponent);
        this.cartComponentPortal = new ComponentPortal(FoodCartComponent);
    }

    ngAfterViewInit(): void {
        // this.portal = this.cartSelectedPortal;
        // this.cartSelectedPortal = this.cartComponentPortal;
    }

}
