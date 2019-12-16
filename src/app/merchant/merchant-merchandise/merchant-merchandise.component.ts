import { Component, OnInit, ViewChild } from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import { ActivatedRoute, Router } from '@angular/router';
import {
    MatPaginator,
    MatSort,
    MatTableDataSource,
    MatDialog,
    MatDialogConfig,
} from '@angular/material';

// import { merge, Observable, of as observableOf } from 'rxjs';
// import { catchError, startWith, map, switchMap } from 'rxjs/operators';

import { MerchantService } from '../../core-func/srvcs/merchant.service';
import { MerchantProductCats, MerchantCatProducts, LocalMerchantCatProducts } from '../merchant.enum';
import { ModalComponent } from '../../core-func/modal/modal.component';
// import { EditSelBtnComponent } from '../../core-func/editor/edit-sel-btn/edit-sel-btn.component';
// import { forEach } from '@angular/router/src/utils/collection';

@Component({
    selector: 'amm-merchant-merchandise',
    templateUrl: './merchant-merchandise.component.html',
    styleUrls: ['./merchant-merchandise.component.scss'],
    providers: [ MerchantService ]
})
export class MerchantMerchandiseComponent implements OnInit {
    @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
    @ViewChild(MatSort, {static: true}) sort: MatSort;

    displayedColumns: string[] = ['select', 'img', 'name', 'price', 'stockCount', 'category', 'hidden'];

    dataSource: MatTableDataSource<LocalMerchantCatProducts>;
    selection = new SelectionModel<LocalMerchantCatProducts>(true, []);

    mProds: LocalMerchantCatProducts[] = [];
    mProdCats: MerchantProductCats[] = [];
    merchantID: any;

    amtRows2Edit: number;
    isLoadingResults = true;
    isRateLimitReached = false;

    componentData: any;
    editorModeBtn: boolean;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private ms: MerchantService,
        private dialog: MatDialog,

    ) {
        this.merchantID = this.route.snapshot.queryParams.mID;
        console.log('merchaandise id:= ', this.merchantID);
        // this.ads.getMerchantCategories(this.merchantID)
        // working model //
        /*this.ads.getMerchantItemsW_Cats(this.merchantID, this.sort.active, this.sort.direction, this.paginator.pageIndex)*/
        this.ms.getMerchantItemsW_Cats(this.merchantID).then(
            (res: LocalMerchantCatProducts[]) => {
                // *useforElementsArray* this.mProds = res['elements'];
                this.mProds = res;

                // this.mProdCats = this.mProds[0]['categories']['elements'];
                /// === /// console.log('prod: ', JSON.stringify(this.mProds) );
                // console.log('prod: ', this.mProds[0]['name'], ' -- ', 'prodCat: ', this.mProdCats[0]['name'] );

                this.buildTable(this.mProds);
            },
            (err) => {
                console.log('getMerchantItemsW_Cats_Error: ', err);
            }
        );

        this.editorModeBtn = false;
        // this.dataSource.sort = this.sort;
        // this.dataSource.paginator = this.paginator;
        // this.masterToggle();
    }


    private buildTable(data) {
        this.dataSource = new MatTableDataSource(data);
        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;
        this.isLoadingResults = false;
    }



    /** Whether the number of selected elements matches the total number of rows. */
    isAllSelected() {
        const numSelected = this.selection.selected.length;
        const numRows = this.dataSource.data.length;
        return numSelected === numRows;
    }

    /** Selects all rows if they are not all selected; otherwise clear selection. */
    masterToggle() {
        this.isAllSelected() ?
            this.selection.clear() :
            this.dataSource.data.forEach(row => this.selection.select(row));
    }

    applyFilter(filterValue: string) {
        this.dataSource.filter = filterValue.trim().toLowerCase();

        if (this.dataSource.paginator) {
            this.dataSource.paginator.firstPage();
        }
    }

    changeImage(e) {
        const dialogConfig = new MatDialogConfig();
        // const dialogRef = this.dialog.open(ModalComponent, dialogConfig);
        const dialogRef = this.dialog.open(ModalComponent, {
            width: '600px',
            autoFocus: true,
            data: { comp: this.componentData }
        });

    }

    ngOnInit() {
        this.componentData = {
            firstname: 'Something',
            lastname: 'Important',
            gender: 'M',
            address : {
                city: 'somewhere'
            }
        };

    }

    amtElemSelected(): number {
        this.amtRows2Edit = this.selection.selected.length;
        console.log('rows: ', this.amtRows2Edit);
        return this.amtRows2Edit;
    }

    editSelectedElemData(): void {
        const tempArr: LocalMerchantCatProducts[] = [];
        this.dataSource.data.forEach( (x) => {
            if ( this.selection.isSelected(x) ) {
                console.log('prodid: ', x.prod_id);
                tempArr.push(x);
            }
        });

        this.buildTable(tempArr);
        this.masterToggle();
        this.editorModeBtn = true;


    }

    closeEditor(): void {
        this.editorModeBtn = false;
        this.buildTable(this.mProds);


    }

}
