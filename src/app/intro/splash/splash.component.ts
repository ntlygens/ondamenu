import { Component, ElementRef, OnInit } from '@angular/core';
import { ActivatedRoute, Router} from '@angular/router';

@Component({
  selector: 'app-splash',
  template: `
      <div id='ntroCntnr' class="introBackground">
          <!--<img class='logo_icon fixedCenter' src='../biota/assets/leaf_icon.jpg' alt='background_image' />-->
          <div id='CTA_div'>
              <!--<article>Welcome to Biota <br> </article>-->
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

  mURL: any;
  mURL2: any;
  elem: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private elemRef: ElementRef

  ) {
    this.mURL = 'https://clover.com:443/oauth/authorize?client_id=Y805R8C741M54&redirect_uri=http://localhost:4200/signin';
    // this.mURL = 'https://clover.com:443/oauth/authorize?client_id=Y805R8C741M54&redirect_uri=https://smashradio1fm.com/biota/signin';
    this.mURL2 = 'https://api.clover.com/auth/authorize?client_id=Y805R8C741M54';
    this.elem = this.elemRef.nativeElement;

  }

  ngOnInit() {
    const params = (new URL(document.location.href)).searchParams;
    // console.log('params: ', params);
    // console.log('url: ', urlSnap);
    const searchParams = new URLSearchParams(params);
    if ( searchParams.has('code')) {
      const dcode = searchParams.get('code');

      if ( dcode === (null || '')) {
        console.log('code has no data');
        this.startMrchntXp();
      }

      console.log('accessed from posSys dashboard');
      this.router.navigate(['/signin'], {relativeTo: this.route, queryParamsHandling: 'preserve'});
    }
  }

  startUserXp() {
    this.router.navigate(['u/b'], {relativeTo: this.route});
  }

  startMrchntXp() {
    // this.router.navigate([`/${this.mURL}`, {externalUrl: this.elem.href}], {skipLocationChange: false});
    // this.router.navigate(['signin'], {relativeTo: this.route});
    console.log('accessed from web');
    window.open(`${this.mURL}`, '_self');
  }

}
