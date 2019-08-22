import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'amm-user',
    template: `
          <div id='ntroCntnr' class=''>
              <router-outlet name='userRO' id='userRO'></router-outlet>
          </div>
      `,
    styles: []
})
export class UserComponent implements OnInit {

    constructor() { }

    ngOnInit() {
    }


}
