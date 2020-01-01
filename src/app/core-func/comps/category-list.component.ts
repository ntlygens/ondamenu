import {ChangeDetectionStrategy, Component, ElementRef, ViewChild, EventEmitter, Input, OnInit, Output, AfterViewInit} from '@angular/core';
import { MenuService } from '../srvcs/menu.service';
import { CategoryProductsData } from '../../amm.enum';
import { CdkVirtualScrollViewport, ScrollDispatcher } from '@angular/cdk/scrolling';
import {filter} from 'rxjs/operators';

@Component({
    selector: 'amm-category-list',
    template: `
        <div [id]='menuNav' [ngClass]="{'': isMobile}" class="" >
            <cdk-virtual-scroll-viewport class="scrollport" itemSize="100" minBufferPx="600" maxBufferPx="800" #scrolllist>
                <amm-menu-item
                    *cdkVirtualFor="
                        let mi of dMenuItems;
                        let idx = index;
                        let first = first; let last = last;
                        let odd = odd; let even = even;
                        templateCacheSize: 0;
                    "
                    [ngClass]="{ first:first, last:last, odd:odd, even:even }"
                    class="w-100"
                    [miName]="mi.prod_name"
                    miDesc="Our breakfast is the finest you’ll find anywhere in the state."
                    [miPic]="mi.src"
                    [miID]="mi.pid"
                    [miPrice]="mi.price"
                    [miIncr]="isIncremental"
                    [miType]=""
                    [isEven]="even"
                    (emitRemoveClick2)='this.removeCounter($event)'
                ></amm-menu-item>
            </cdk-virtual-scroll-viewport>
        </div>
    `,
    styles: [`
        .last div {
            margin-bottom: 60px;
        }
        .mat-list-base {
            padding-top: 5px;
        }
        .scrollport {
            height: 600px;
        }

    `],
    changeDetection: ChangeDetectionStrategy.Default
})
export class CategoryListComponent implements OnInit, AfterViewInit {
    @ViewChild(CdkVirtualScrollViewport, {static: true}) virtualScroll: CdkVirtualScrollViewport;

    @Input() isMobile: boolean;
    @Input() menuNav = '';
    @Input() menuID = '';
    @Input() clientID = '';
    @Input() menuOpen: boolean;
    @Input() isIncremental: boolean;
    @Output() emitRemoveClick3: EventEmitter<any> = new EventEmitter<any>();
    @Output() mnmzeListItem: EventEmitter<any> = new EventEmitter<any>();

    dMenuItems: CategoryProductsData[] = [];
    isMiEven: boolean;
    elem;

    constructor(
        private ms: MenuService,
        private elemRef: ElementRef,
        private scrollDispatcher: ScrollDispatcher
    ) {
        this.elem = this.elemRef.nativeElement;

    }

    removeCounter(item): any {
        // this.themsg = msg;
        // console.log( 'in F C : ', item);
        this.emitRemoveClick3.emit(event);
    }

    ngOnInit() {
        if (this.menuNav) {
            ///// ## /// console.log('foodCard: clid - ', this.clientID, ' -- menuID - ', this.menuID);
            this.ms.getCatProds(this.clientID, this.menuID).then(
                (res: CategoryProductsData[]) => {
                    this.dMenuItems = res;
                    ///// ## /// console.log('test_prod: ', this.dMenuItems[0]['prod_name']);
                },
                (err) => {
                    console.log('getCatProds_Error: ' + err);
                }
            );

            /* // previous instance // */
            /*this.ms.getCatProds(this.clientID, this.menuID).subscribe(
                (res) => {
                    this.dMenuItems = res;
                    ///// ## /// console.log('test_prod: ', this.dMenuItems[0]['prod_name']);
                },
                (err) => {
                    console.log('getCatProds_Error: ' + err);
                },
                () => {
                    ///// ## /// console.log('success: category products returned');
                }
            );*/

        }
    }

    ngAfterViewInit(): void {
        // this.virtualScroll.elementScrolled()
        //     .subscribe(event => {
        //         console.log('scrolled', event);
        //     });
        // console.log('data: ', this.virtualScroll.measureScrollOffset('top'));

        this.scrollDispatcher.scrolled().pipe(
            filter(event => this.virtualScroll.measureScrollOffset('top') > 150)
            // filter(event => this.virtualScroll.getRenderedRange().end === this.virtualScroll.getDataLength())
        ).subscribe(event => {
            this.mnmzeListItem.emit('scrolled');
            // console.log('data: ', this.virtualScroll.measureScrollOffset('top'));
            // this.searchPageNumber++;
            // this.nextSearchPage(this.searchPageNumber);
        });
    }

}
