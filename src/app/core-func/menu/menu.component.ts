import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { MenuService } from '../srvcs/menu.service';

@Component({
    selector: 'amm-menu',
    templateUrl: './menu.component.html',
    styleUrls: ['./menu.component.scss'],
    providers: [ MenuService ]
})
export class MenuComponent implements OnInit {
    @ViewChild('cartRef', {static: true}) cartRef: ElementRef;
    @ViewChild('menuRef', {static: true}) menuRef: ElementRef;
    @ViewChild('cartIcon', {static: true}) cartIcon: ElementRef;

    currentPage = 'thisis the current page';

    mobileOn: boolean;
    menuOpen: boolean;

    dCats: any = [];
    allSubCats: any = [];
    navCats: any = [];
    subNavCats: any = [];

    catsAllwd = 4;
    elem: any; bannerImage: string;

    cID: string; cnm: string; img: string;
    phn: string; slg: string; cfd: string;
    cpt: string; del: string;

    SWIPE_ACTION = { LEFT: 'swipeleft', RIGHT: 'swiperight'};
    TOUCH_ACTION = { TOUCH: 'tap', DOUBLETAP: 'double-tap' };

    constructor(
        private loc: Location,
        private clSvc: MenuService,
        private elemRef: ElementRef,
        private route: ActivatedRoute
    ) {
        this.route.queryParams.subscribe( params => {
            this.cID = params.cid;
            this.cnm = params.cnm;
            this.img = params.img;
            this.phn = params.phn;
            this.slg = params.slg;
            this.cfd = params.cfd;
            this.cpt = params.cpt;
            this.del = params.del;
        });
        this.getCats(this.cID);
    }

    ngOnInit() {
        this.elem = this.elemRef.nativeElement;
        const dEl = this.elem.querySelector('.imgStngs');
        dEl.classList.add('fullImg');
        console.log('clientIDS: ', this.cID);
        this.clSvc.getClientBnr(this.cID).subscribe( (res) => {
            this.bannerImage = res.banner;
        });
    }

    getCats(cid: string): any {
        this.clSvc.getAllCategories(`${cid}`).subscribe(
            (dCtgrys) => {
                (dCtgrys).forEach((x, i) => {
                    x.id = x.cid;
                    x.name = x.cval;
                    x.clientid = x.client_id;
                    if (i < this.catsAllwd) {
                        this.clSvc.getSubCats(x.clientid, x.id).subscribe(
                            (res) => {
                                const catname = x.name;
                                this.allSubCats.push({[catname]: res});
                            },
                            (err) => {
                                console.log('getSubCat_Error: ', err);
                            },
                            () => {
                                console.log('getSubCat Complete');
                            }
                        );
                        this.navCats.push(x);
                    }

                    this.dCats.push(x);
                });
            },
            (err) => {
                console.log('getAllCategories_Error: ', err);
            },
            () => {
                console.log('getAllCategories Complete');
            }
        );
    }

    menuClick(currentIndex: number, action: string, e) {
        const target = e.target.closest('.clientMenu');

        if (this.menuOpen !== true) {
            // target.classList.toggle('menuOpen');
            this.menuOpen = true;
        }

        if ( action === this.TOUCH_ACTION.TOUCH) {
            console.log('actnTrgt: ', action);
            // TODO: ADD MENU ID TO BUTTON AND CALL INSTEAD OF NAME # USE MENUID //
            this.dCats.forEach((x, i) => {
                const crntCat = (i === currentIndex);
                x.visible = crntCat;

                if ( crntCat && i < 4) {
                    // if ( (i === currentIndex) && i < 4) {
                    const subCatObj = this.allSubCats[i];

                    this.subNavCats.length = 0;
                    Object.keys(subCatObj).forEach( (key) => {
                            // console.log('pi ' + JSON.stringify(subCatObj[key]));
                        switch (key) {
                            case x.name:
                                subCatObj[key].forEach( (y, j) => {
                                    this.subNavCats.push(y);
                                });
                                break;
                            default:
                                console.log('nothing');
                        }

                    });

                }

            });

        }
    }

    subMenuClick(currentIndex: number, action: string, e ) {
        if (action === this.TOUCH_ACTION.TOUCH) {
            console.log('tap index: ' + currentIndex + ', action: ' + action + ','  +  ' from target: ' + e.target.textContent);

            this.dCats.forEach((x, i) => {
                x.visible = ( x.name === e.target.textContent );

            });
            this.subNavCats.forEach((x, i) => {
                x.visible = ( x.scval === e.target.textContent );

            });
        }

    }

    cartSubmitted() {
        const nBtns = this.elem.querySelectorAll('button.mainSelectors');
        nBtns[1].classList.toggle('btn-success');
        nBtns[1].firstChild.classList.toggle('cartBtnSlctd');
        // console.log('btn- ' + nBtns.classList);
    }

    goback() {
        this.loc.back();
    }

}
