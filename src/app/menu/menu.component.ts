import { Component, ElementRef, OnInit, OnDestroy, ViewChild, HostListener, Inject } from '@angular/core';
import { Location, DOCUMENT } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { MenuService } from '../core-func/srvcs/menu.service';
import { StorageService } from '../core-func/srvcs/storage.service';
import { MerchantInfoData } from '../amm.enum';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
    selector: 'amm-menu',
    templateUrl: './menu.component.html',
    styleUrls: ['./menu.component.scss'],
    providers: [ MenuService ]
})
export class MenuComponent implements OnInit, OnDestroy {
    @ViewChild('cartRef', {static: true}) cartRef: ElementRef;
    @ViewChild('menuRef', {static: true}) menuRef: ElementRef;
    @ViewChild('cartIcon', {static: true}) cartIcon: ElementRef;

    bnrData: MerchantInfoData;
    mobileOn: boolean;
    menuOpen: boolean;

    dCats: any = [];
    allSubCats: any = [];
    navCats: any = [];
    subNavCats: any = [];

    catsAllwd = 4;
    elem: any;

    Arr = Array;
    nMbr = 20;

    private destroy$ = new Subject<any>();

    SWIPE_ACTION = { LEFT: 'swipeleft', RIGHT: 'swiperight'};
    TOUCH_ACTION = { TOUCH: 'tap', DOUBLETAP: 'double-tap' };

    constructor(
        @Inject(DOCUMENT) document,
        private loc: Location,
        private ms: MenuService,
        private elemRef: ElementRef,
        private route: ActivatedRoute,
        private ss: StorageService,
    ) {

        this.ss.menuBnrData$.pipe(takeUntil(this.destroy$)).subscribe( (res: MerchantInfoData) => {
            console.log('data_Eg: = ', res.username);
            this.bnrData = res;
            this.getCats(res.client_id);

        });

    }

    getCats(cid: string): any {
        this.ms.getAllCategories(`${cid}`).subscribe(
            (dCtgrys) => {
                (dCtgrys).forEach((x, i) => {
                    x.id = x.cid;
                    x.name = x.cval;
                    x.clientid = x.client_id;
                    if (i < this.catsAllwd) {
                        this.ms.getSubCats(x.clientid, x.id).subscribe(
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
                console.log('getAllCategories Complete', this.navCats);
            }
        );
    }

    getCatProds(cID, mnuID): any {

    }

    /*@HostListener('window:scroll', ['$event'])
    onWindowScroll(e) {
        console.log('wndw_scrl: ', e);

        if ( window.pageYOffset > 148) {
            const el = document.getElementById('miBnr');
            el.classList.add('sticky-bar');
        } else {
            const el = document.getElementById('miBnr');
            el.classList.remove('sticky-bar');
        }

        if ( window.pageYOffset > 148) {
            const el = document.getElementById('clientMenu');
            el.classList.add('sticky-btns');
        } else {
            const el = document.getElementById('clientMenu');
            el.classList.remove('sticky-btns');
        }
    }*/

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


    // * ======== navigation hooks ========= * //

    ngOnInit() {
        this.elem = this.elemRef.nativeElement;
        const dEl = this.elem.querySelector('.imgStngs');
        dEl.classList.add('fullImg');

        // TODO: setup matchmedia for mobile test //
        this.mobileOn = true;

    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }


}
