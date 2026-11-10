import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'amm-marketing-campaign',
  template: `
      <div id='ntroCntnr' class="introBackground">
          <div id='CTA_div'>
              <button color='warn' (click)='$event.preventDefault();' routerLinkActive='true' mat-flat-button type='button'>Get Started</button>
              <br>
              <button color='secondary' routerLinkActive='true' mat-flat-button type='button'>Merchant</button>
          </div>
      </div>
  `,
  styles: [``]
})
export class MarketingCampaignComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
