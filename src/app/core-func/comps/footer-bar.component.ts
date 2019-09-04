import {Component, ElementRef, OnInit, HostListener} from '@angular/core';
import { lift } from '../animations/animations.component';

@Component({
    selector: 'amm-footer-bar',
    template: `
        <div class="footerbar w-100 d-flex" [@footerAnimations]="state">
            <div class="uProfile" [ngStyle]="{backgroundImage: 'url(../../../assets/backgrounds/mobile/baseline_account_circle_black_18dp@2x.png)'}"></div>
            <div class="uSearch" [ngStyle]="{backgroundImage: 'url(../../../assets/backgrounds/mobile/baseline_search_black_24dp.png)'}"></div>
            <div class="uFilter" [ngStyle]="{backgroundImage: 'url(../../../assets/backgrounds/mobile/baseline_tune_black_24dp.png)'}"></div>
            <div class="uCart" [ngStyle]="{backgroundImage: 'url(../../../assets/backgrounds/mobile/baseline_shopping_cart_black_24dp.png)'}"></div>
            <!--<div class="uCart" [ngStyle]="{backgroundImage: 'url(../../../assets/backgrounds/mobile/baseline_shopping_cart_black_24dp.png)'}" (click)="cartRef.viewCart(); toggleCartButton($event);"></div>-->
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
    `],
    animations: [ lift ]
})
export class FooterBarComponent implements OnInit {
    state = 'hide';
    constructor(
        private el: ElementRef
    ) {}

    @HostListener('window:scroll', ['$event'])
        onWindowScroll(e) {
            if ( window.pageYOffset > 100 ) {
                this.state = 'show';
                console.log('show');
            } else {
                this.state = 'hide';
                console.log('hide');
            }
    }
    ngOnInit() {
    }

}
