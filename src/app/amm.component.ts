import { Component, OnInit } from '@angular/core';
import { RouterOutlet, ActivatedRoute, Router } from '@angular/router';
import { transition, trigger, useAnimation } from '@angular/animations';
import { fader, slider } from './core-func/animations/animations.component';
import { StorageService } from './core-func/srvcs/storage.service';

@Component({
    selector: 'amm-root',
    templateUrl: './amm.component.html',
    styleUrls: ['./amm.component.scss'],
    animations: [
        // fader,
        slider,
    /*trigger('routeAnimations', [
      // transition('open => closed', [
      transition('* <=> *', [
        useAnimation(routeAnimations, {
          params: {
            transformIn: 'translateX(100%)',
            transformStatic: 'translateX(0%)',
            transformOut: 'translateX(-100%)',
            timingIn: '0.5s ease-in-out',
            timingOut: '1s ease-in-out'
          }
        })
      ])
    ])*/
  ]
})
export class AmmComponent implements OnInit {
    isSplash: boolean;

    constructor(
        private strgSrvc: StorageService,
        private route: ActivatedRoute,
        private router: Router
    ) {}

    ngOnInit(): void {
        // this.rState = this.router;
        this.strgSrvc.getPageRoute().subscribe(
            (res) => {
                this.isSplash = res.s;
                console.log('issplash res: ', this.isSplash);
            }
        );
    }

    prepareRoute(outlet: RouterOutlet) {
        console.log('roo: ', outlet.activatedRouteData.state);
        return outlet && outlet.activatedRouteData && outlet.activatedRouteData.animation;
    }

    // title = 'ondamenu';
}
