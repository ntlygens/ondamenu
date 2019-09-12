import { Component, OnInit } from '@angular/core';
import { MerchantDOHRating } from '../../../amm.enum';
import { DohService } from '../../srvcs/doh.service';


@Component({
    selector: 'amm-nydoh',
    template: `
          <div id="dohCntnr" class="flex-column">
              <h1>nydoh</h1>
              <div class="rounded rate">
                  <h2 *ngIf="mDohData">{{mDohData.rating}}</h2>
                  <h2 *ngIf="!mDohData">a</h2>
              </div>
          </div>
      `,
    styles: [`
        :host {
            text-transform: uppercase;
        }
        .rate { background: #7ed321c2 }
        h1 { font-size: 0.65rem; margin-bottom: 3px }

      `]
})
export class NydohComponent implements OnInit {
    mDohData: MerchantDOHRating;

    constructor(
        private DohSvc: DohService,

    ) { }

    ngOnInit() {


    }
    getMerchantDOHData() {
        this.DohSvc.getMrchDOHData('merchantinfihere').then(
            (res: MerchantDOHRating) => {
                this.mDohData = res;

            },
            (err) => {
                console.log('getMerchantDOHData_Error: ', err);
            }
        );
    }

}
