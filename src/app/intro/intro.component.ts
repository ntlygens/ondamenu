import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-intro',
  template: `
      <div id='ntroCntnr' class=''>
          <router-outlet name='mainRO' id='mainRO'></router-outlet>
      </div>
  `,
  styles: [`
    /*.darkBackground {
      background-color: #12131b;
      min-height: 1080px;

    }*/
  `]
})
export class IntroComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
