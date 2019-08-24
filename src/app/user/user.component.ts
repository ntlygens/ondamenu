import { Component, OnInit } from '@angular/core';
import { RouterOutlet, ActivatedRoute, Router } from '@angular/router';
import { slider } from '../core-func/animations/animations.component';

@Component({
    selector: 'amm-user',
    template: `
              <div id='ntroCntnr' class=''>
                  <div #advertisingModulePlaceholder class="placeholder" ></div>
                  <div>
                      <router-outlet #userRO="outlet" name="userRO" id="userRO"></router-outlet>
                  </div>
                  <!--<div [@routeAnimations]="prepareUserRoute(userRO)">
                      <router-outlet #userRO="outlet" name='userRO' id="userRO"></router-outlet>
                  </div>-->
              </div>
          `,
    styles: [``],
    animations: [
        slider
    ]
})
export class UserComponent implements OnInit {

    constructor(
        private route: ActivatedRoute,
        private router: Router
    ) { }

    ngOnInit() {
    }

    /*prepareUserRoute(outlet: RouterOutlet) {
        console.log('uRO: ', outlet.activatedRouteData.state);
        return outlet && outlet.activatedRouteData && outlet.activatedRouteData.animation;
    }*/

}
