import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { StorageService } from '../srvcs/storage.service';

@Component({
    selector: 'amm-header-logo',
    template: `
        <div class="headerlogo logoImg" (click)="goHome()"></div>
      `,
    styles: [`
        .headerlogo {
            position: relative;
            left: 8px;
            box-shadow: 0px 1px 4px #444;
        }

        .logoImg {
            content: url("../../../assets/backgrounds/mobile/floatingLogo.png");
        }
    `]
})
export class HeaderLogoComponent implements OnInit {

    constructor(
        private ss: StorageService,
        private router: Router,
        private route: ActivatedRoute
    ) { }

    ngOnInit() {
    }

    goHome() {
        this.ss.setStartPg(true);
        this.router.navigate([''], {});
    }

}
