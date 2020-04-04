import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'amm-advert',
  template: `
    <div class="placeholder">
      {{crntPg}} --- {{name}}
    </div>
  `,
  styles: []
})

export class AdvertComponent implements OnInit {
    @Input() crntPg = 'this Page';
    @Input() name = 'temp name';


  constructor() { }

  ngOnInit() {
  }

}
