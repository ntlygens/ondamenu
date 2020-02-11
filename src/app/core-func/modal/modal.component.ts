import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { ActivatedRoute } from '@angular/router';
import { regExps } from '../errors/custom-validation.component';
import {MerchantService} from '../srvcs/merchant.service';


@Component({
    selector: 'amm-modal',
    template: `
        <form id='MerchantModal' [formGroup]="mImgForm" (ngSubmit)="submit()" style="text-align: center" novalidate>
            <div class='mImgFile hidden'>
                <label for="file">File</label>
                <input #fileInput id="file" type='file' class=''  formControlName="file" (change)="onFileSelected($event)" />
                <!--<mat-form-field>
                    <input matInput placeholder='lastname' type='text' name='lastname' [(ngModel)]="data.lastname" />
                </mat-form-field>
                <mat-form-field>
                    <input matInput placeholder='gender' type='text' name='gender' [(ngModel)]="data.gender" />
                </mat-form-field>
                <mat-form-field>
                    <input matInput placeholder='address' type='text' name='address' [(ngModel)]="data.address.city" />
                </mat-form-field>-->
            </div>
            <figure>
                <img *ngIf='url' [src]="url" alt="selected image"/>
                <figcaption *ngIf='imgErr'>
                    <p *ngIf="sizeErr">
                        Selected file size is too big.<br>
                        Max file size is {{fileMaxSize / 1000}}kb. <br>
                        Please select another file.
                    </p>
                    <p *ngIf="typeErr">
                        You've selected a <em style="color: red">non-image</em> file. <br>
                        Only ".jpg", ".jpeg", ".png" files accepted<br>
                        Please select another file.
                    </p>
                </figcaption>
            </figure>
            <!--<button (click)='isUserValid()' [disabled]='this.submitForm.invalid' color='warn' mat-raised-button type='button'>Sign In</button>-->
            <div id='loginOptns' class="d-flex" style="justify-content: space-evenly">
                <button class="btn btn-dark" type="button" (click)="fileInput.click()">Choose File</button>
                <button *ngIf="fileSlctd" [disabled]="imgErr" class="btn btn-primary" type="submit">Submit</button>
                <!--<a href='#' (click)='$event.preventDefault(); gotoReset()' routerLinkActive='true' id='reset' name='reset'>Reset</a>-->
            </div>
        </form>

    `,
    styles: [`
        img {
            width: 200px;
            height: auto;
            margin: 5px 5px 20px;
        }
    `]
})
export class ModalComponent implements OnInit {
    mImgForm: FormGroup;
    desc: string;
    prodID: string;
    images = [];
    mID: any;
    selectedFile: File = null;
    url: any;
    imgErr = false;
    sizeErr = false;
    typeErr = false;
    fileSlctd = false;
    fileCrntSize: number;
    fileTrimSize: any;
    fileMaxSize = 150000;
    imagePath: any;
    exts = ['jpg', 'jpeg', 'png'];

    constructor(
        private fb: FormBuilder,
        private ms: MerchantService,
        private route: ActivatedRoute,
        private dialogRef: MatDialogRef<ModalComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any,
    ) {
        this.prodID = data.pid;
        this.mID = this.route.snapshot.queryParams.mID;

    }

    ngOnInit() {
        this.mImgForm = this.fb.group({
            file: ['', [Validators.required]],
            fileSource: ['', [Validators.required]]

        });
        // console.log('MID: ', this.mID);
        // console.log(' PID: ', this.prodID);
        /*this.submitForm = this.fb.group({
            merchantLoginData: this.fb.group({
                firstname: ['', [Validators.required]],
                lastname: ['', [Validators.required]],
                gender: ['', [Validators.required]],
                address: ['']
            })
        });*/
    }

    onFileSelected(event) {
        // console.log('event: ', event);
        this.imgErr = false;
        if (event.target.files && event.target.files[0]) {
            // const filesAmount = event.target.files.length;
            this.selectedFile = event.target.files[0];
            this.fileCrntSize = this.selectedFile.size;
            // this.fileTrimSize = String(this.fileCrntSize).substr(0, 3);
            this.fileTrimSize = Math.floor(this.fileCrntSize / 1000);


            const fileName = this.selectedFile.name;
            const fullFileType = this.selectedFile.type;
            const splitType = fullFileType.split('/');
            const fileType = splitType[0];
            const fileTypeExt = splitType[1];

            console.log('type: ', fileType);

            const reader = new FileReader();
            reader.onload = (ev: any) => {
                // console.log('result: ', ev.target.result);
                this.url = reader.result;
            };

            if (this.selectedFile) {
                console.log('exttts ', fileTypeExt);
                if ( (fileType !== 'image') && (this.exts.indexOf(fileTypeExt) === -1) ) {
                    console.log('not correct ext');
                    this.imgErr = true;
                    this.typeErr = true;
                    this.sizeErr = false;
                    this.fileSlctd = false;

                } else if (this.fileCrntSize > this.fileMaxSize ) {
                    console.log('size: ', this.fileTrimSize);
                    reader.readAsDataURL(this.selectedFile);
                    this.imgErr = true;
                    this.sizeErr = true;
                    this.typeErr = false;
                    this.fileSlctd = false;

                } else {
                    reader.readAsDataURL(this.selectedFile);
                    this.fileSlctd = true;
                    this.imgErr = false;
                    this.typeErr = false;
                    this.sizeErr = false;
                    console.log('file good');
                }

            }
            // for (let i = 0; i < filesAmount; i++) {

        }
    }

    submit() {
        const fd = new FormData();
        fd.append('image', this.selectedFile, this.selectedFile.name);
        fd.append('clID', this.mID);
        fd.append('pID', this.prodID);
        fd.append('rPlc', '0');

        const dRes1 = 'image already exists';
        const dRes2 = 'image uploaded';

        this.ms.sendProdImgs(fd).subscribe(
            (res) => {
                console.log( 'init res: ', res);
                switch (res) {
                    case 3:
                        alert('There is a problem with your file.\n Please try another.');
                        // this.dialogRef.close();
                        break;
                    case 2:
                        alert('Image Set');
                        this.dialogRef.close();
                        break;
                    case 0:
                        if ( window.confirm('Replace current image?')) {
                            const fd1 = new FormData();
                            fd1.append('image', this.selectedFile, this.selectedFile.name);
                            fd1.append('clID', this.mID);
                            fd1.append('pID', this.prodID);
                            fd1.append('rPlc', '1');
                            this.ms.sendProdImgs(fd1).subscribe(
                                (resp: any) => {
                                    // console.log('replaced ', resp);
                                    alert('Image replaced');
                                    this.dialogRef.close();
                                },
                                (err) => {
                                    console.log('there was an error replacing image.');
                                }
                            );

                        } else {
                            alert('Image Not Changed');
                            this.dialogRef.close();
                        }
                        break;

                }


            },
            (err) => {
                console.log('submitMerchantImgs_Error: ', err);
            }
        );

    }

}
