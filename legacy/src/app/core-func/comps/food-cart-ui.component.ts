import { Component, OnInit, AfterViewInit, Input, Renderer2, ElementRef, OnChanges } from '@angular/core';
import { CartService } from '../srvcs/cart.service';

@Component({
    selector: 'amm-food-cart-ui',
    template: `
        <div  class="progress">
          <div class="progress-bar bg-success food-cart-progress" role="progressbar" style="min-width: 2em;" [style.width]="(dinnerSelection/10)*100 + '%'" [attr.aria-valuenow]="(dinnerSelection/10)*100" aria-valuemin="0" aria-valuemax="100"></div>
        </div>
      `,
    styles: [`
        :host {
            display: flex;
            justify-content: flex-end;
            position: fixed;
            bottom: 48px;
            width: 100%;
            z-index: 5;
        }
        .food-cart-progress {
            height:10px;
            font-variant: small-caps;
            line-height: 9.875px;
        }
        .progress {
            padding: 0.25rem 1.125rem 0;
            background-color: transparent;
        }


      `],
})
export class FoodCartUiComponent implements AfterViewInit, OnChanges {
    @Input() dinnerSelection: number;
    @Input() cartSelection: number;
    @Input() dinnerNotSelected: number;

    private elem: any;

    constructor(
        private elemRef: ElementRef,
        private renderer: Renderer2,
        private cs: CartService
    ) {
        this.elem = this.elemRef.nativeElement;

    }

    ngAfterViewInit() {
        this.cs.setElemAttributes(this.elem, {
            id: 'cartUI'
        });
    }

    ngOnChanges() {
        // console.log('items: '+this.dinnerSelection);
        switch (true) {
            case (this.dinnerSelection < 3):
                this.elem.querySelector('.food-cart-progress').textContent = '';
                break;
            case (this.dinnerSelection === 3):
                this.elem.querySelector('.food-cart-progress').textContent = 'small';
                break;
            case (this.dinnerSelection === 5):
                this.elem.querySelector('.food-cart-progress').textContent = 'medium';
                break;
            case (this.dinnerSelection === 7):
                this.elem.querySelector('.food-cart-progress').textContent = 'large';
                break;
            default:
                this.elem.querySelector('.food-cart-progress').textContent = '';
        }
    }

    getSelection() {
        return this.dinnerSelection;
    }

    getCart() {
        return this.cartSelection;
    }

    getNotPlated() {
        return this.dinnerNotSelected;
    }
}
