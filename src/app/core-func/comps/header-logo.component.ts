import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { GuiService } from '../srvcs/gui.service';

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
            content: url("assets/backgrounds/mobile/floatingLogo.png");
        }
    `]
})
export class HeaderLogoComponent implements OnInit {

    constructor(
        private gs: GuiService,
        private router: Router,
        private route: ActivatedRoute
    ) { }

    ngOnInit() {
    }

    goHome() {
        this.gs.setStartPg(true);
        this.router.navigate([''], {});
    }

}
