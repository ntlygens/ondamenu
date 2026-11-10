import {AfterViewInit, Component, ElementRef, OnDestroy, OnInit} from '@angular/core';
import { Location } from '@angular/common';
import { Router, ActivatedRoute, RouterOutlet } from '@angular/router';
import { GuiService } from '../core-func/srvcs/gui.service';
import {take, takeUntil} from 'rxjs/operators';
import {Subject} from 'rxjs';

@Component({
    standalone: true,
    imports: [RouterOutlet],
    selector: 'amm-merchant',
    template: `
        <div id="ntroCntnr" [class.mobileDash]="isMobileDash" [class.desktopDash]="!isMobileDash">
            <router-outlet #merchantRO='outlet' name="merchantRO"></router-outlet>
        </div>
      `,
    styles: [`
        .desktopDash {
            width: 1920px;
            height: 1080px;
        }

        .mobileDash {
            width: 100%;
            max-width: 420px;
        }
      `]
})
export class MerchantComponent implements AfterViewInit, OnDestroy, OnInit {
    elem: any;
    isMobileDash: boolean;

    private destroy$ = new Subject<any>();
    private static getScreenSize(mql: MediaQueryList) {
        return mql.matches;
    }

    constructor(
        private gs: GuiService,
        private router: Router,
        private route: ActivatedRoute,
        private elemRef: ElementRef,
        private loc: Location
    ) {
        this.elem = this.elemRef.nativeElement;
        const mql: MediaQueryList = window.matchMedia('(max-width: 765px)');
        this.isMobileDash = MerchantComponent.getScreenSize(mql);
        // console.log('isMobileDash: ', this.isMobileDash);
        this.gs.setMediaDevice(this.isMobileDash);
        this.gs.setStartPg(false);
        this.gs.setVisibility(false);
        /*this.gs.isMobileDevice().then(
            (res) => {
                this.isMobileDash = res;
                console.log('is it Mobile: ', res);
            },
            (err) => {
                console.log('isMobileDevice_M_Error: ' + err);
            }
        );*/
    }

    ngOnInit() {}

    ngAfterViewInit() {}

    ngOnDestroy(): void {
        this.destroy$.next(null);
        this.destroy$.complete();
    }

    goback() { this.loc.back(); }

    goforward() { this.loc.forward(); }

}
