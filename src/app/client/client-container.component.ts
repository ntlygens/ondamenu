import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'amm-client-container',
    template: `
          <div id="ntroCntnr">
              <div class="mytest fixedCenter">
                  <p>client works!</p>
              </div>
          </div>
          <router-outlet #clientRO name="clientRO" id="clientRO"></router-outlet>
      `,
    styles: [`
        .mytest {
            background: #1b579f;
            width: 400px;
            height: 500px;

        }
    `]
})
export class ClientContainerComponent implements OnInit {

    constructor() { }

    ngOnInit() {
    }

}
