import { AfterViewInit, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { HttpClient, HttpEvent, HttpEventType, HttpResponse } from '@angular/common/http';
import { FormBuilder, FormGroup, FormControl, AbstractControl, Validators, Validator, Form } from '@angular/forms';

import { ActivatedRoute, Router } from '@angular/router';
import { filter, map, takeUntil, tap } from 'rxjs/operators';

import { errorMessages, bizNmScrubr, regExps } from '../../core-func/errors/custom-validation.component';
import { MatBottomSheet, MatBottomSheetConfig } from '@angular/material';
import { MerchantService } from '../../core-func/srvcs/merchant.service';
import {LocSrvcCuisine, LocSrvcDining, LocSrvcModel, LocSrvcRstrctns, LocSrvcType, MerchantInfoData} from '../../amm.enum';
import { Subject } from 'rxjs';
import {GuiService} from '../../core-func/srvcs/gui.service';


export function uploadProgress<T>( cb: ( progress: number ) => void ) {
    return tap(( event: HttpEvent<T> ) => {
        if ( event.type === HttpEventType.UploadProgress ) {
            cb(Math.round((100 * event.loaded) / event.total));
        }
    });
}

/*export function toResponseBody<T>() {
    return pipe(
        filter(( event: HttpEvent<T> ) => event.type === HttpEventType.Response),
        map(( res: HttpResponse<T> ) => res.body)
    );
}*/

@Component({
    selector: 'amm-merchant-profile',
    templateUrl: './merchant-profile.component.html',
    styleUrls: ['./merchant-profile.component.scss'],
    providers: [
        // AppDataService,
        MatBottomSheetConfig,
        MerchantService,
    ],

})

export class MerchantProfileComponent implements OnInit, AfterViewInit {
    // @ViewChild('fileUpload') fileUpload: FileUploadComponent;
    private destroy$ = new Subject<any>();
    isOpen = true;
    errors = errorMessages;
    prflErrInst: string;
    fileSelected: boolean;
    progress = 0;

    /*sendFile = new FormGroup({
      email: new FormControl(null, Validators.required),
      image: new FormControl(null, [Validators.required, requiredFileType('png')])
    });*/

    /// FOR FILE UPLOAD COMPONENT ///
    // signup = new FormGroup({
    //   uploadedfile: new FormControl(null, [Validators.required, requiredFileType('png')])
    // });
    success = false;

    profileSubmitForm: FormGroup;
    merchantName: string;
    merchantID: string;
    merchantDetails: MerchantInfoData[];
    merchantCategories: any;

    models = Object.keys(LocSrvcModel);

    cuisines = Object.keys(LocSrvcCuisine);

    dining = Object.keys(LocSrvcDining);

    restrictions = Object.keys(LocSrvcRstrctns);

    step = 0;
    setStep(index: number) {
        this.step = index;
    }

    nextStep() {
        this.step++;
    }

    prevStep() {
        this.step--;
    }

    get profileFormArray(): AbstractControl | null {
        return this.profileSubmitForm.get('profileFormArray');
    }


    constructor(
        private route: ActivatedRoute,
        private router: Router,
        // private ads: AppDataService,
        private ms: MerchantService,
        private gs: GuiService,
        private fb: FormBuilder,
        private cd: ChangeDetectorRef,
        private http: HttpClient,
        private bottomSheet: MatBottomSheet,
        // private bottomSheetConfig: MatBottomSheetConfig<FileUploadComponent>
    ) {
        this.merchantID = this.route.snapshot.queryParams.mID;
        this.prflErrInst = 'profileError';
        // console.log('id:= ', this.merchantID);
        this.gs.isMobileDevice().subscribe(
            (res) => {
                // console.log('this is mobile mSplashComp: ', res);
                /*switch ( res ) {
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

                }*/
            },
            (err) => {
                // console.log('isMobileDevice_Error: ' + err);
            }
        );
        this.createProfileForm();
        this.fileSelected = false;
        // this.fileUpload.
    }

    createProfileForm() {
        // if (this.isMerchant) {
        this.profileSubmitForm = this.fb.group( {
            profileFormArray: this.fb.array( [
                this.fb.group( {
                    username: [ '', [ Validators.required ] ],
                    email: [ '', [ Validators.required, Validators.email ] ],
                    password: [ { value: '', disabled: true }, [ Validators.required, Validators.pattern( regExps.password ) ] ],
                    slogan: ['', [Validators.required]],
                    bio: ['', Validators.required ],
                    address: ['', Validators.required],
                    phone: ['', Validators.required]
                }),
                this.fb.group( {
                    food: [ '', [ Validators.required ] ],
                    concept: [ '', [ Validators.required ] ],
                    model: [ '', [ Validators.required ]],
                    restrictions: ['', [Validators.required]],
                })/*,
        this.fb.group( {
          uploadedfile: [ null, [Validators.required, requiredFileType('png')] ],

        }),*/
            ])
        });
    }

    expandedPanel(num: number) {
        this.step = num;
        this.profileFormArray.get([num]);
    }

    /*submit() {
      this.success = false;
      // const daFile = this.profileFormArray.get([2, 'uploadedfile']);

      if ( !this.sendFile.valid ) {
        markAllAsDirty(this.sendFile);
        return;
      }

      this.http.post(`${this.route}/m/`, toFormData(this.sendFile.value), {
        reportProgress: true,
        observe: 'events'
      }).pipe(
        uploadProgress(progress => (this.progress = progress)),
        toResponseBody()
      ).subscribe(res => {
        this.progress = 0;
        this.success = true;
        this.sendFile.reset();
      });
    }*/

    /*hasError( field: string, error: string ) {
      const control = this.sendFile.get(field);
      return control.dirty && control.hasError(error);
      // return control.hasError(error);
    }*/

    setMerchantDetails() {
        const username = this.profileFormArray.get([0, 'username']).value;
        const email = this.profileFormArray.get([0, 'email']).value;
        const pwd = this.profileFormArray.get([0, 'password']).value;
        const slogan = this.profileFormArray.get([0, 'slogan']).value;
        const bio = this.profileFormArray.get([0, 'bio']).value;
        const address = this.profileFormArray.get([0, 'address']).value;
        const phone = this.profileFormArray.get([0, 'phone']).value;
        const food = this.profileFormArray.get([1, 'food']).value;
        const concept = this.profileFormArray.get([1, 'concept']).value;
        const model = this.profileFormArray.get([1, 'model']).value;
        const restrictions = this.profileFormArray.get([1, 'restrictions']).value;
        const formData = '';

        markAllAsDirty(this.profileSubmitForm);
        // const formData = this.profileFormArray.get([2, 'uploadedfile']).value;
        // console.log('this right here');

        if ( this.profileSubmitForm.dirty ) {
            this.ms.sendMerchantProfileData(
                `${this.merchantID}`,
                `${username}`,
                `${email}`,
                `${pwd}`,
                `${slogan}`,
                `${bio}`,
                `${address}`,
                `${phone}`,
                `${food}`,
                `${concept}`,
                `${model}`,
                `${restrictions}`,
                `${formData}`,
                // formData
            ).subscribe(
                (res) => {
                    // console.log( 'res from setData: ', res);

                },
                (err) => {
                    // console.log('SendMerchantProfile_Error: ', err);
                },
                () => {
                    // this.router.navigate(['../../', 'merchandise' ], {relativeTo: this.route, queryParamsHandling: 'preserve' });
                    this.router.navigate(['/m'], {relativeTo: this.route, queryParamsHandling: 'preserve'});
                    // console.log('it completed');
                });
        }
        // this.router.navigate(['../../', 'b', 'merchandise' ], {relativeTo: this.route, queryParamsHandling: 'preserve' });
        // this.router.navigate(['../../', 'merchandise' ], {relativeTo: this.route, queryParamsHandling: 'preserve' });
    }

    sendMerchantDbFile(file: File) {
        const formData = this.profileFormArray.get([2, 'uploadedfile']).value;
    }

    getCategories() {
        this.router.navigate(['merchandise'], {relativeTo: this.route});

    }

    toggle() {
        this.isOpen = !this.isOpen;
        // console.log('toggled');
    }

    /*onFileChange(event, field) {
      if ( event.target.files && event.target.files.length ) {
        const [ file ] = event.target.files;
        // just checking if it is an image, ignore if you want
        if ( !file.type.startsWith( 'image' ) ) {
          this.profileSubmitForm.get( field ).setErrors( {
            required: true
          } );
          this.cd.markForCheck();
        } else {
          // unlike most tutorials, i am using the actual Blob/file object instead of the data-url
          this.profileSubmitForm.patchValue( {
            [ field ]: file
          } );
          // need to run CD since file load runs outside of zone
          this.cd.markForCheck();
        }
      }
    }*/

    openUploadFile() {
        /*this.bottomSheetConfig = {
            hasBackdrop: true,
            disableClose: false,
            backdropClass: 'bottomSheetBackdrop'
        };*/

        // this.bottomSheet.open(BottomSheetComponent, this.bottomSheetConfig );
        // this.bottomSheet.open(FileUploadComponent, this.bottomSheetConfig );
    }

    ngOnInit() {

    }

    ngAfterViewInit(): void {
        this.ms.getMerchantDetails(`${this.merchantID}`).then(
            (mNfo: MerchantInfoData[]) => {
                this.merchantDetails = mNfo;
                // console.log('md1: ', this.merchantDetails);
            },
            (err) => {
                // console.log('getMerchantDetail_Error: ' + err);
            }
        );
    }
}

export function markAllAsDirty( form: FormGroup ) {
    for ( const control of Object.keys(form.controls) ) {
        form.controls[control].markAsDirty();
    }
}

export function toFormData<T>( formValue: T ) {
    const formData = new FormData();

    for ( const key of Object.keys(formValue) ) {
        const value = formValue[key];
        formData.append(key, value);
    }

    return formData;
}
