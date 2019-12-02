import {AfterViewInit, Component, ElementRef, OnDestroy, OnInit} from '@angular/core';
import { Location } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { GuiService } from '../core-func/srvcs/gui.service';
import {take, takeUntil} from 'rxjs/operators';
import {Subject} from 'rxjs';

@Component({
    selector: 'amm-merchant',
    template: `
        <p>
          merchant works!
        </p>
        <div id="ntroCntnr" [ngClass]="isMobileDash ? 'mobileDash' : 'desktopDash' ">
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
    constructor(
        private gs: GuiService,
        private router: Router,
        private route: ActivatedRoute,
        private elemRef: ElementRef,
        private loc: Location
    ) {
        this.elem = this.elemRef.nativeElement;
        this.gs.isMobileDevice().pipe(takeUntil(this.destroy$)).subscribe(
            (res) => {
                this.isMobileDash = res;
            }
        );
    }

    ngOnInit() {

    }

    ngAfterViewInit() {

    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    goback() { this.loc.back(); }

    goforward() { this.loc.forward(); }

}
