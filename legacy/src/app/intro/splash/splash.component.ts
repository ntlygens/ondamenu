import { Component, ElementRef, OnInit } from '@angular/core';
import { ActivatedRoute, Router} from '@angular/router';
import { GuiService } from '../../core-func/srvcs/gui.service';

@Component({
    selector: 'amm-splash',
    template: `
          <div id='ntroCntnr' class="introBackground">
              <div id='CTA_div'>
                  <button color='warn' (click)='startUserXp(); $event.preventDefault()' routerLinkActive='true' mat-flat-button type='button'>Get Started</button>
                  <br>
                  <button color='secondary' (click)='startMrchntXp();' routerLinkActive='true' mat-flat-button type='button'>Merchant</button>
              </div>
          </div>

      `,
    styles: [`
        .imgSize {
          width: 100%;
          height: auto;
        }
      `]
})
export class SplashComponent implements OnInit {

    lclURL: any;
    rmtURL: any;
    elem: any;
    // redirect1 = 'https://smashradio1fm.com/biota/signin';
    lclReddir = 'http://localhost:4200/signin';
    redirect3 = 'http://192.168.1.151:4200/signin';
    rmtReddir = 'http://ondamenu.com/signin';



    constructor(
        private gs: GuiService,
        private route: ActivatedRoute,
        private router: Router,
        private elemRef: ElementRef

    ) {
        this.rmtURL = 'https://clover.com:443/oauth/authorize?client_id=Y805R8C741M54&redirect_uri=' + this.rmtReddir; // Local Mobile/Phone Testing
        this.lclURL = 'https://sandbox.dev.clover.com/oauth/authorize?client_id=0Y7P6V3S3EV6W&redirect_uri=' + this.lclReddir; // local Computer Testing
        // this.lclURL = 'https://clover.com:443/oauth/authorize?client_id=Y805R8C741M54&redirect_uri=https://smashradio1fm.com/biota/signin';
        // this.rmtURL = 'https://api.clover.com/auth/authorize?client_id=Y805R8C741M54';

        this.elem = this.elemRef.nativeElement;

    }

    ngOnInit() {
        const params = (new URL(document.location.href)).searchParams;
        const searchParams = new URLSearchParams(params);
        if ( searchParams.has('code')) {
            const dcode = searchParams.get('code');

            if ( dcode === (null || '')) {
                // console.log('code has no data');
                this.startMrchntXp();
            }

            // console.log('accessed from posSys dashboard');
            this.router.navigate(['./signin'], {relativeTo: this.route, queryParamsHandling: 'preserve'});
        }
    }

    startUserXp() {
        this.gs.setStartPg(false);
        this.router.navigate(['u'], {relativeTo: this.route});
    }

    startMrchntXp() {
        // console.log('accessed from web');
        this.gs.setStartPg(false);
        window.open(`${this.rmtURL}`, '_self');
    }

}
