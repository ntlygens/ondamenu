import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'amm-advert',
  template: `
    <div class='imgStngs'>
        <img *ngIf='!promoImage' class="rounded logo" src="assets/core-assets/escovich.png" alt="promo image"/>
        <img class="rounded logo" src="{{promoImage}}" alt="promo image r"/>
    </div>
    <div class="placeholder">
        {{crntPg}} --- {{name}}
    </div>
  `,
  styles: [`
      .imgStngs {
          position: relative;

          border-radius: 0.3rem;
          overflow: hidden;
          object-fit: contain;
          background-size: contain;
          margin-top: 10%;

          padding: 2%;
      }

      .logo {
          height: auto;
          width: 100%;
      }
  `]
})

export class AdvertComponent implements OnInit {
    @Input() crntPg = 'this Page';
    @Input() promoImage = 'assets/core-assets/placeholder2.jpg';
    @Input() name = 'temp name';

    crntPage = 'the crnt page';
    constructor() { }

    ngOnInit() {
    }

}
