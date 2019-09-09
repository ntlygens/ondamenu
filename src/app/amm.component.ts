import { Component, OnDestroy, OnInit, HostListener } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { slider } from './core-func/animations/animations.component';
import { StorageService } from './core-func/srvcs/storage.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
    selector: 'amm-root',
    templateUrl: './amm.component.html',
    styleUrls: ['./amm.component.scss'],
    animations: [ slider ]
})
export class AmmComponent implements OnInit, OnDestroy {
    private destroy$ = new Subject<any>();
    isStartPg: boolean;
    state = 'show';

    constructor(
        private ss: StorageService,
    ) {}

    @HostListener('window:scroll', ['$event'])
        onWindowScroll(e) {
            const bnr = document.getElementById('miBnr');
            const mnu = document.getElementById('clientMenu');

            if (bnr) {
                if (window.pageYOffset > 148) {
                    bnr.classList.add('sticky-bar');
                    mnu.classList.add('sticky-btns');
                } else {
                    bnr.classList.remove('sticky-bar');
                    mnu.classList.remove('sticky-btns');
                }
            }

        }

    ngOnInit(): void {
        this.ss.isStartPg$.pipe(takeUntil(this.destroy$)).subscribe(
            (res) => {
                this.isStartPg = res;
                console.log('issplash res: ', this.isStartPg);
            }
        );
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    prepareRoute(outlet: RouterOutlet) {
        // console.log('router state: ', outlet.activatedRouteData.state);
        return outlet && outlet.activatedRouteData && outlet.activatedRouteData.animation;
    }

}
