import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'amm-root',
    templateUrl: './amm.component.html',
    styleUrls: ['./amm.component.scss']
})
export class AmmComponent implements OnInit {
    isMobile: boolean;

    constructor() {}

    ngOnInit(): void {

    }

    // title = 'ondamenu';
}
