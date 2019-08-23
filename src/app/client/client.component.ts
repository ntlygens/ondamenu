import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';

@Component({
  selector: 'amm-client',
  templateUrl: './client.component.html',
  styleUrls: ['./client.component.scss']
})
export class ClientComponent implements OnInit {

  constructor(
      private loc: Location
  ) { }

  ngOnInit() {
  }

  goBack() {
      this.loc.back();
  }


}
