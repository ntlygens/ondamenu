import { Component, OnInit } from '@angular/core';
import { GuiService } from '../core-func/srvcs/gui.service';

@Component({
  selector: 'amm-campaign',
  template: `
      <div id='ntroCntnr' class=''>
          <router-outlet name='campaignRO' id='campaignRO'></router-outlet>
      </div>
  `,
  styles: [``]
})
export class CampaignComponent implements OnInit {

  constructor(
      private gs: GuiService
  ) {
      this.gs.setVisibility(false);
  }

  ngOnInit(): void {
  }

}
