import {ChangeDetectionStrategy, Component, ElementRef, EventEmitter, Input, OnInit, Output} from '@angular/core';
import { MenuService } from '../srvcs/menu.service';
import {CategoryProductsData} from '../../amm.enum';

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
            height: 420px;
        }
    `],
    changeDetection: ChangeDetectionStrategy.Default
})
export class CategoryListComponent implements OnInit {
    @Input() isMobile: boolean;
    @Input() menuNav = '';
    @Input() menuID = '';
    @Input() clientID = '';
    @Input() menuOpen: boolean;
    @Input() isIncremental: boolean;
    @Output() emitRemoveClick3: EventEmitter<any> = new EventEmitter<any>();

    dMenuItems: CategoryProductsData[];
    isMiEven: boolean;
    elem;

    constructor(
        private ms: MenuService,
        private elemRef: ElementRef
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
            this.ms.getCatProds(this.clientID, this.menuID).subscribe(
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
            );

        }
    }

}
