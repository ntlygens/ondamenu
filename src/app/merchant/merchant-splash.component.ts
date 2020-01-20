import { AfterContentInit, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
// import { AppDataService } from '../app-data.service';
import { MerchantInterfaceTile } from './merchant.enum';
import { GuiService } from '../core-func/srvcs/gui.service';
import { MerchantService } from '../core-func/srvcs/merchant.service';
// import { AppLoginService } from '../app-login.service';
// import { LocalAuthService } from '../oauth/local_auth.service';

@Component({
    selector: 'amm-merchant-splash',
    template: `
        <div id='ntroCntnr'>
            <mat-grid-list [cols]='isMobileDash ? "2" : "6" ' [rowHeight]='isMobileDash ? "100" : "200px" ' [gutterSize]='isMobileDash ? "10px" : "20px" '>
                <mat-grid-tile
                    *ngFor="let tile of tiles"
                    [colspan]="tile.cols"
                    [rowspan]="tile.rows"
                    [style.background]="tile.color"
                    (click)="$event.preventDefault(); gotoLink(tile.href)"
                    [ngClass]="{'active-mat-grid-tile activeTile': tile.activeCell}"
                >
                    <img *ngIf='tile.img' class='splashImg' mat-card-image #btnicn [src]='tile.img' alt='temp img' />

                </mat-grid-tile>
            </mat-grid-list>

            <!--<img class='splashImg fixedCenter' src='../../assets/imgs/intro_splash_logo.png' alt='background_image' />
            <div id='CTA_div'>
              <article>Welcome Merchant to OTA <br> Market Place</article>
              <button color='warn' (click)='$event.preventDefault(); enterSite()' routerLinkActive='true' mat-flat-button type='button'>Get Started</button>
            </div>-->

        </div>
    `,
    styles: [`
        :host {
            width: inherit;
            height: inherit;
            position: absolute;
            top: 0;
            left: 0;
            z-index: 1;
        }

        .splashImg {
            width: 100%;
            height: 100%;
        }
        .mat-grid-list {
            width: inherit;
            height: inherit;
            margin: 60px 10px;
        }

        .active-mat-grid-tile {
            -webkit-border-radius: 7px;
            -moz-border-radius: 7px;
            border-radius: 7px;

            -webkit-box-shadow: -1px 3px 5px 1px #333;
            -moz-box-shadow: -1px 3px 5px 1px #333;
            box-shadow: -1px 3px 5px 1px #333;

        }

        .activeTile {
            pointer-events: auto;
            cursor: auto;
        }

        .mat-grid-logo-tile {
            position: relative;
            width: 25%;
            margin-left: 0;
            padding-left: 0;
            left: -110px;
            bottom: -55px;
            border-radius: 7px;
            box-shadow: 0px 3px 7px 0px #555;
            border: #AAA thin solid;
            height: 40%;
        }

        .off {
            display: none;
        }

    `],
})


export class MerchantSplashComponent implements OnInit, AfterContentInit {

    items = [] as any;
    isMobileDash: boolean;
    tiles: MerchantInterfaceTile[] = [];
    isClicked = false;
    status: any;
    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private gs: GuiService,
        private ms: MerchantService,
        // private las: LocalAuthService,
        // private dts: AppDataService,    // dts: dashboardtileservice
        // private als: AppLoginService
    ) {
        this.gs.isMobileDevice().subscribe(
            (res) => {
                // console.log('this is mobile mSplashComp: ', res);
                switch ( res ) {
                    case true:
                        this.isMobileDash = true;
                        this.loadMobileDashBoard();
                        break;
                    case false:
                        this.isMobileDash = false;
                        this.loadDesktopDashBoard();
                        break;
                    default:
                        this.loadDesktopDashBoard();
                        break;

                }
            },
            (err) => {
                // console.log('isMobileDevice_Error: ' + err);
            }
        );
    }

    ngOnInit() {
        // this.las.get_isMobile().subscribe(
        //   (res) => {
        //     console.log('this is mobile mSplashComp: ', res['mobile']);
        //     switch ( res['mobile'] ) {
        //       case true:
        //         this.loadMobileDashBoard();
        //         break;
        //       case false:
        //         this.loadDesktopDashBoard();
        //         break;
        //       default:
        //         this.loadDesktopDashBoard();
        //         break;
        //
        //     }
        //   };

        // this.dts.getDashCardData().then( (data) => {
        //   const allData: MerchantInterfaceTile[] = data.filter( cData => cData.cols !== 0);
        //
        //   // this.createDCards(allData);
        //   console.log ('data-text: ', allData[0]['text']);
        //
        //   this.tiles = allData;
        // });

    }

    loadMobileDashBoard() {
        this.ms.getMobileDashCardData().then( (data: Array<any>) => {
            const allData: MerchantInterfaceTile[] = data.filter( cData => cData.cols !== 0);

            // this.createDCards(allData);
            // console.log ('data-text: ', allData[0].text);

            this.tiles = allData;
        });
    }

    loadDesktopDashBoard() {
        /*this.dts.getDashCardData().then( (data) => {
            const allData: MerchantInterfaceTile[] = data.filter( cData => cData.cols !== 0);

            // this.createDCards(allData);
            console.log ('data-text: ', allData[0].text);

            this.tiles = allData;
        });*/
    }

    ngAfterContentInit() {
        // this.getIsMobile();
        this.getProfileStat();
        // this.las.get_isMobile().subscribe(
        //   (res) => {
        //     console.log('this is mobile mSplashComp: ', res['mobile']);
        //   }
        // );

        // this.dts.getDashCardData().then( (data) => {
        //   const allData: MerchantInterfaceTile[] = data.filter( cData => cData.cols !== 0);
        //
        //   // this.createDCards(allData);
        //   console.log ('data-text: ', allData[0]['text']);
        //
        //   this.tiles = allData;
        // });
    }

    gotoLink(url): void {
        this.isClicked = !this.isClicked;
        this.router.navigate([`${url}`], {
            queryParamsHandling: 'preserve',
            relativeTo: this.route
        });
    }

    getProfileStat(): any {
        /*this.als.getProfileStatus().subscribe( (res) => {
            // let dStatus = res['prflStat'];
            console.log('status: ', res.prflStat);
        });*/
    }

    /*getIsMobile(): any {
      this.las.get_isMobile().subscribe(
        (res) => {
          console.log('this is mobile: ', res['mobile']);
        }
      );
    }*/

    enterSite() {
        this.router.navigate(['./a'], { relativeTo: this.route, queryParamsHandling: 'preserve'});
    }

    getState(outlet): string {
        // console.log('aboutChildSte: ', outlet.activatedRouteData.state);
        return outlet.activatedRouteData.state;
    }

}

