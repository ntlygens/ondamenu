import { Component, OnInit } from '@angular/core';
import { RouterOutlet, ActivatedRoute, Router } from '@angular/router';
import { transition, trigger, useAnimation } from '@angular/animations';
import { routeAnimations } from './core-func/animations/animations.component';

@Component({
    selector: 'amm-root',
    templateUrl: './amm.component.html',
    styleUrls: ['./amm.component.scss'],
    animations: [
    trigger('routeAnimations', [
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
    ])
  ]
})
export class AmmComponent implements OnInit {
    isMobile: boolean;

    constructor(
        private route: ActivatedRoute,
        private router: Router
    ) {}

    ngOnInit(): void {
        // this.rState = this.router;
    }

    prepareRoute(outlet: RouterOutlet) {
        console.log('roo: ', outlet.activatedRouteData.animation);
        return outlet && outlet.activatedRouteData && outlet.activatedRouteData.animation;
    }

    // title = 'ondamenu';
}
