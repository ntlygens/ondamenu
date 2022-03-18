import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'amm-campaign',
  template: `
      <div id='' class=''>
          <router-outlet name='campaignRO' id='campaignRO'></router-outlet>
      </div>
  `,
  styles: [``]
})
export class CampaignComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
