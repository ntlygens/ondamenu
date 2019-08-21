import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'amm-intro',
  template: `
      <div id='ntroCntnr' class=''>
          <router-outlet name='mainRO' id='mainRO'></router-outlet>
      </div>
  `,
  styles: [``]
})
export class IntroComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
