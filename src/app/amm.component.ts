import { Component, AfterViewInit, OnDestroy, OnInit, HostListener, ViewChildren, ViewContainerRef, ViewChild, ElementRef, NgZone} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { RouterOutlet } from '@angular/router';
import { slider } from './core-func/animations/animations.component';
import { GuiService } from './core-func/srvcs/gui.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { CdkScrollable, ScrollDispatcher } from '@angular/cdk/overlay';

@Component({
    selector: 'amm-root',
    templateUrl: './amm.component.html',
    styleUrls: ['./amm.component.scss'],
    animations: [ slider ]
})
export class AmmComponent implements AfterViewInit, OnInit, OnDestroy {
    @ViewChildren('scrolllist') scrolllist: CdkScrollable;
    @ViewChild('footer', {static: true}) footer;

    private destroy$ = new Subject<any>();
    isStartPg: boolean;
    isMobile: boolean;
    state = 'show';
    visibility$: boolean;


    private static getScreenSize(mql: MediaQueryList) {
        return mql.matches;
    }


    constructor(
        private zone: NgZone,
        private gs: GuiService,
        public scroll: ScrollDispatcher,
        private translate: TranslateService
    ) {
        translate.setDefaultLang('en');
        // this.scrolllist.scrollable.elementScrolled();
        /// MOBILE SCREEN SIZE QUERY ///
        const mql: MediaQueryList = window.matchMedia('(max-width: 765px)');
        this.isMobile = AmmComponent.getScreenSize(mql);
        console.log('isMobile: ', this.isMobile);
        this.gs.setMediaDevice(this.isMobile);
        this.gs.isVisible$.pipe(takeUntil(this.destroy$)).subscribe( (res) => {
            // console.log('oamt: = ', res);
            this.visibility$ = res;
        });
        /// MOBILE SCREEN SIZE END ///

    }



    @HostListener('window:scroll', ['$event'])
        onWindowScroll(e) {
            // const bnr = document.getElementById('miBnr');
            // const mnu = document.getElementById('clientMenu');
            const scrld = window.pageYOffset;
            switch (true) {
                case scrld > 20:
                    this.footer.ftrState = 'show';
                    break;
                default:
                    this.footer.ftrState = 'show';
                    break;
            }

            // if (true === window.pageYOffset > 20) {
            //     this.footer.toggleFooter();
            // } else {
            //     this.footer.toggleFooter();
            // }

            /*if (bnr) {
                if (window.pageYOffset > 148) {
                    bnr.classList.add('sticky-bar');
                    mnu.classList.add('sticky-btns');
                } else {
                    bnr.classList.remove('sticky-bar');
                    mnu.classList.remove('sticky-btns');
                }
            }*/
        }

    ngOnInit(): void {
        this.gs.isStartPg$.pipe(takeUntil(this.destroy$)).subscribe(
            (res) => {
                this.isStartPg = res;
                console.log('issplash res: ', this.isStartPg);
            }
        );

    }

    ngAfterViewInit(): void {}

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    prepareRoute(outlet: RouterOutlet) {
        // console.log('router state: ', outlet.activatedRouteData.state);
        return outlet && outlet.activatedRouteData && outlet.activatedRouteData.animation;
    }

    setInst(e) {
        console.log('emitted: ', e);
    }

}
