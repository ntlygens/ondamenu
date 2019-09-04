import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'amm-header-bar',
    template: `
        <div class="headerbar">
            <h5>RESTAURANTS</h5>
        </div>
      `,
    styles: [`
        .headerbar {
            max-height: 70px;
            min-height: 60px;
            min-width: 90px;
            text-align: center;

            background-color: #EA6A5E;
            box-shadow: 0px 1px 4px #444;

            border-top: #BB3523 10px solid;
            border-top-right-radius: 5px;
            border-bottom-right-radius: 5px;

        }
        .headerbar h5 {
            position: relative;
            top: 0.9rem;
            margin: auto;
            color: #fff;
        }
    `]
})
export class HeaderBarComponent implements OnInit {

    constructor() { }

    ngOnInit() {
    }

}
