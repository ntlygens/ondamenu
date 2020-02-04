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
            <img *ngIf='url'  [src]="url" /> <br/>
            <!--<button (click)='isUserValid()' [disabled]='this.submitForm.invalid' color='warn' mat-raised-button type='button'>Sign In</button>-->
            <div id='loginOptns' class="d-flex" style="justify-content: space-evenly">
                <button class="btn btn-dark" type="button" (click)="fileInput.click()">Choose File</button>
                <button class="btn btn-primary" type="submit">Submit</button>
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
    imagePath: any;

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
        if (event.target.files && event.target.files[0]) {
            // const filesAmount = event.target.files.length;
            this.selectedFile = event.target.files[0];
            // for (let i = 0; i < filesAmount; i++) {
            const reader = new FileReader();
            reader.onload = (ev: any) => {
                // console.log('result: ', ev.target.result);
                this.url = reader.result;
            };
            reader.readAsDataURL(this.selectedFile);
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

        this.ms.sendProdImgs(fd).then(
            (res: any) => {
                // console.log( 'init res: ', res);
                switch (res) {
                    case undefined:
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
                            this.ms.sendProdImgs(fd1).then(
                                (resp: any) => {
                                   //  console.log('replaced ', resp);
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
