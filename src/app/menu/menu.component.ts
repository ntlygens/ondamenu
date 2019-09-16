import {
    Component,
    ElementRef,
    OnInit,
    AfterViewInit,
    OnDestroy,
    ViewChild,
    HostListener,
    Inject,
    Output,
    EventEmitter, ComponentRef, ViewContainerRef
} from '@angular/core';
import { Location, DOCUMENT } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { MenuService } from '../core-func/srvcs/menu.service';
import { StorageService } from '../core-func/srvcs/storage.service';
import {CategoryData, MerchantInfoData, SubCategoryData} from '../amm.enum';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
    selector: 'amm-menu',
    templateUrl: './menu.component.html',
    styleUrls: ['./menu.component.scss'],
    providers: [ MenuService ]
})
export class MenuComponent implements OnInit, AfterViewInit, OnDestroy {
    @ViewChild('cartRef', {static: true}) cartRef: ElementRef;
    @ViewChild('touchnav', {static: true}) touchnav;
    @ViewChild('menuRef', {static: true}) menuRef: ElementRef;
    @ViewChild('cartIcon', {static: true}) cartIcon: ElementRef;
    @ViewChild('fullMenuBtn', {static: true}) fullMenuBtn;
    @Output() dFtr: EventEmitter<any> = new EventEmitter<any>();


    bnrData: MerchantInfoData;
    mobileOn: boolean;
    menuOpen: boolean;
    isAllBtnActive: boolean;
    active: boolean;

    dCats: any = [];
    allSubCats: any = [];
    navCats: any = [];
    subNavCats: any = [];

    catsAllwd = 4;
    elem: any;
    allItemsBtn: any;

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
        // private compRef: ComponentRef<>,
        private route: ActivatedRoute,
        private ss: StorageService,
    ) {

        this.ss.menuBnrData$.pipe(takeUntil(this.destroy$)).subscribe( (res: MerchantInfoData) => {
            console.log('data_Eg: = ', res.username);
            this.bnrData = res;
            this.getCats(res.client_id);

        });
        // this.active = true;

    }

    getCats(cid: string): any {
        this.ms.getAllCategories(`${cid}`).then(
            (dCtgrys: CategoryData[]) => {
                dCtgrys.forEach((x, i) => {
                    const dCID = x.cid;
                    const dNM = x.cval;
                    const dCLID = x.client_id;
                    // console.log('temp: ', dNM);
                    if (i < this.catsAllwd) {
                        this.ms.getSubCats(dCLID, dCID).then(
                            (res: SubCategoryData[]) => {
                                // const catname = dNM;
                                this.allSubCats.push({[dNM]: res});
                            },
                            (err) => {
                                console.log('getSubCat_Error: ', err);
                            }
                        );
                        this.navCats.push(x);
                    }

                    this.dCats.push(x);
                });
            },
            (err) => {
                console.log('getAllCategories_Error: ', err);
            }
        );
        // console.log('cat array amt: ', this.navCats.length, ' first cat array name ', this.navCats[0]);
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
        const navbtn = e.target.parentNode.id;
        console.log('menuIndex: ', currentIndex);
        // if (this.menuOpen !== true) {
        //     // target.classList.toggle('menuOpen');
        //     this.menuOpen = true;
        // }

        if ( action === this.TOUCH_ACTION.TOUCH) {
            console.log('actnTrgt: ', action);
            this.fullMenuBtn.isActive = currentIndex === null;
            // TODO: ADD MENU ID TO BUTTON AND CALL INSTEAD OF NAME # USE MENUID //
            this.dCats.forEach((x: CategoryData, i) => {
                const crntCat = (i === currentIndex);
                x.visible = crntCat;

                if ( crntCat && i < 4) {
                    // if ( (i === currentIndex) && i < 4) {
                    const subCatObj = this.allSubCats[i];

                    this.subNavCats.length = 0;
                    Object.keys(subCatObj).forEach( (key) => {
                            // console.log('pi ' + JSON.stringify(subCatObj[key]));
                        switch (key) {
                            case x.cval:
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

    minimizeUI(e) {
        console.log('this footer btn open');
        const cntnr = this.elem.querySelector('#mainClientCntnr');
        const img = this.elem.querySelector('.imgStngs');
        const info = this.elem.querySelector('.iteminfo');
        const doh = this.elem.querySelector('.dohSrvcs');
        const rate = this.elem.querySelector('.rate');

        cntnr.classList.add('mini');
        img.setAttribute('style', 'top: -148px');
        info.setAttribute('style', 'top: -218px');
        doh.setAttribute('style', 'top: 82px; right: 130px');
        rate.setAttribute('style', 'width: fit-content; padding: 0.325rem 0.45rem 0.245rem;');
        rate.previousSibling.setAttribute('style', 'display: none');
        rate.firstElementChild.setAttribute('style', 'font-size: 1rem');
        /*Array.from([cntnr, img, info, doh]).forEach( (x) => {
            x.classList.add('mini');
        });*/

        // this.elem.attrs('(')
    }


    // * ======== navigation hooks ========= * //

    ngOnInit() {
        this.elem = this.elemRef.nativeElement;
        const dEl = this.elem.querySelector('.imgStngs');
        dEl.classList.add('fullImg');

        // TODO: setup matchmedia for mobile test //
        this.mobileOn = true;
        // this.elem.setAttribute('dFtr', 'footer.openCart()');

    }

    ngAfterViewInit(): void {
        // this.allItemsBtn = document.querySelector('#fullMenuBtn button');
        // this.isAllBtnActive = Boolean(this.allItemsBtn.getAttribute('isactive'));

        // console.log('isAllBtnActive: ', this.isAllBtnActive);
        // console.log('AllBtn: ', this.allItemsBtn.classList);
        // this.fullMenuBtn.isActive = true;
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }


}
