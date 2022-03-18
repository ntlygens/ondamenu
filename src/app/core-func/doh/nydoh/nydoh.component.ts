import { Component, OnInit, Input } from '@angular/core';
import { MerchantDOHRatingData } from '../../../amm.enum';
import { DohService } from '../../srvcs/doh.service';


@Component({
    selector: 'amm-nydoh',
    template: `
          <div id="dohCntnr" class="flex-column">
              <h1>nydoh</h1>
              <div class="rounded rate">
                  <h2 *ngIf="!mDohData.grade">"b"</h2>
                  <h2>{{mDohData.grade}}</h2>
              </div>
          </div>
      `,
    styles: [`
        :host {
            text-transform: uppercase;
        }
        .rate {
            background: #7ed321c2;
            width: 100%;
            height: fit-content;
        }
        .mini {
            width: fit-content;
            font-size: 1rem;
            padding: 0.325rem 0.45rem 0.245rem;
        }

        h2 { margin-bottom: 0 }

        h1 { font-size: 0.65rem; margin-bottom: 3px }

      `]
})
export class NydohComponent implements OnInit {
    @Input() merchantGrade: string;
    @Input() merchantID: string;

    mDohData: MerchantDOHRatingData;

    constructor(
        private DohSvc: DohService,

    ) { }

    ngOnInit() {
        // console.log('camis number: ', this.merchantCAMIS);
        this.getMerchantDOHData();

    }
    getMerchantDOHData() {
        this.DohSvc.getMrchDOHData(`${this.merchantID}`).then(
            (res: MerchantDOHRatingData) => {
                this.mDohData = res;

            },
            (err) => {
                console.log('getMerchantDOHData_Error: ', err);
            }
        );
    }

}
