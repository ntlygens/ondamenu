import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
    selector: 'amm-header-logo',
    template: `
        <div class="headerlogo logoImg" (click)="goHome()"></div>
      `,
    styles: [`
        .headerlogo {
            position: relative;
            left: 8px;
            box-shadow: 0px 2px 4px #333;
        }
        .logoImg {
            content: url("../../assets/backgrounds/mobile/floatingLogo.png");
        }
    `]
})
export class HeaderLogoComponent implements OnInit {

    constructor(
        private router: Router,
        private route: ActivatedRoute
    ) { }

    ngOnInit() {
    }

    goHome() {
        this.router.navigate(['/'], {});
    }

}
