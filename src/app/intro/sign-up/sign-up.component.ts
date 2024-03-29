import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validator, Validators, FormArray, AbstractControl } from '@angular/forms';
import { LoginService } from '../../core-func/srvcs/login.service';
import {
    ConfirmValidEmailMatcher,
    ConfirmValidBusinessName,
    regExps, bizNmScrubr,
    errorMessages, bizNameErrMsgs
} from '../../core-func/errors/custom-validation.component';
import {GuiService} from '../../core-func/srvcs/gui.service';

@Component({
    selector: 'amm-sign-up',
    template: `
              <div id="ntroCntnr" class="">
                  <form [formGroup]='submitForm' id='signUpForm' novalidate>
                      <h3>Sign Up</h3>
                      <mat-horizontal-stepper id='stepper' formArrayName='formArray' linear #stepper>
                          <mat-step formGroupName='0' [stepControl]='formArray?.get([0])'>
                              <ng-template matStepLabel>Enter <em *ngIf='isMerchant'>Business</em> Name</ng-template>
                              <mat-form-field *ngIf='isMerchant || isClient'>
                                  <input matInput placeholder='Biz Name' type='text' formControlName='name' name='name' [errorStateMatcher]='confirmValidBusinessName' />
                                  <mat-error>
                                      {{bizerrors[bizNameErrInst]}}
                                  </mat-error>
                              </mat-form-field>

                              <ng-template matStepLabel>Enter your email</ng-template>
                              <mat-form-field>
                                  <input matInput (blur)='this.validateEmail()' placeholder='email' type='email' formControlName='email' name='email' [errorStateMatcher]='confirmValidEmailMatcher'  />
                                  <mat-error>
                                      {{errors[emailErrInst]}}
                                  </mat-error>
                              </mat-form-field>

                              <ng-template matStepLabel>Enter your password</ng-template>
                              <mat-form-field>
                                  <input matInput placeholder='password' type='password' formControlName='password' name='password'  />
                                  <mat-error>
                                      {{errors[passErrInst]}}
                                  </mat-error>
                              </mat-form-field>
                              <div>
                                  <button mat-button matStepperNext>Next</button>
                              </div>
                          </mat-step>

                          <mat-step *ngIf='isMerchant || isClient' formGroupName='1' [stepControl]='formArray?.get([1])'>
                              <ng-template matStepLabel>Select what applies</ng-template>
                              <mat-form-field>
                                  <input matInput placeholder='Merchant ID' type='text' formControlName='merchantid' name='merchantid' [errorStateMatcher]='confirmValidBusinessName' />
                                  <mat-error>
                                      {{bizerrors[merchantIdErrInst]}}
                                  </mat-error>
                              </mat-form-field>
                              <mat-form-field>
                                  <mat-select placeholder="Role" formControlName="role">
                                      <mat-option *ngFor='let role of roles; let idx=index' [value]='role.val'>{{role.name}}</mat-option>
                                  </mat-select>
                              </mat-form-field>
                              <mat-form-field>
                                  <mat-select placeholder="Product" formControlName="product" multiple>
                                      <mat-option *ngFor='let product of products; let idx=index' [value]='product.val'>{{product.name}}</mat-option>
                                  </mat-select>
                              </mat-form-field>

                              <div>
                                  <button mat-button matStepperPrevious>Previous</button>
                                  <button mat-button matStepperNext>Next</button>
                              </div>
                          </mat-step>

                          <mat-step>
                              This is the end
                              <div>
                                  <button mat-button matStepperPrevious>Previous</button>
                              </div>
                          </mat-step>

                      </mat-horizontal-stepper>
                      <button (click)='this.addUser()' [disabled]='this.submitForm.invalid' color='warn' mat-raised-button type='button'>Sign Up</button>
                      <div id='loginOptns'>
                          <a  href='#' (click)='$event.preventDefault(); this.gotoSignIn()' routerLinkActive='true' id='signin' name='signup'>Sign In</a>
                          <a  href='#' (click)='$event.preventDefault(); this.gotoReset()' routerLinkActive='true' id='reset' name='reset'>Reset</a>
                      </div>
                    </form>
              </div>
          `,
    styles: [`

                .splashImg {
                  width: 100%;
                  height: auto;
                }

                h3 {
                    text-transform: uppercase;
                }

                #signUpForm {
                    z-index: 3;
                    position: fixed;
                    top: 55%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    clear: both;
                    width: 100%;
                    text-align: center;
                    padding: 0 5%;
                }

                #stepper {
                  height: 400px;
                  margin: auto;
                  width: inherit;
                }
                .mat-stepper-horizontal, .mat-stepper-vertical {
                    background-color: #fffffff5;
                }
                .mat-form-field--no-underline .mat-input-underline {
                  background-color: transparent;
                }
                .mat-form-field {
                    width: 100%;
                    padding: 0 5%;
                }

              `],
    providers: [
        LoginService
    ]
})

export class SignUpComponent {

    // TODO: Add password confirmation field IMPORTANT //

    confirmValidEmailMatcher = new ConfirmValidEmailMatcher();
    confirmValidBusinessName = new ConfirmValidBusinessName();

    errors = errorMessages;
    bizerrors = bizNameErrMsgs;

    bizNameErrInst: string;
    merchantIdErrInst: string;
    emailErrInst: string;
    passErrInst: string;
    fileErrInst: string;

    submitForm: FormGroup;
    clientType: string;
    mProduct = [];
    isMerchant: boolean;
    isClient: boolean;
    isUser: boolean;

    merchantParam: string;
    mrchCodeParam: string;
    employeeParam: string;

    roles = [
        {name: 'Farm/Producer', val: 'producer'},
        {name: 'Supplier/Retailer', val: 'retailer'},
        {name: 'Rest\'rant/Merchant', val: 'merchant'}
    ];
    products = [
        {name: 'packaged items', val: 'pkgd_food'},
        {name: 'prepared food', val: 'prepd_food'},
        {name: 'prepared fish', val: 'fish'},
        {name: 'prepared meat', val: 'meat'},
        {name: 'prepared halal', val: 'halal'},
        {name: 'prepared kosher', val: 'kosher'}
    ];

    get formArray(): AbstractControl | null {
        return this.submitForm.get('formArray');
    }


    constructor(
        private fb: FormBuilder,
        private als: LoginService,
        private gs: GuiService,
        private router: Router,
        private route: ActivatedRoute
    ) {
        this.bizNameErrInst = 'bizName';
        this.merchantIdErrInst = 'mrchntID';
        this.emailErrInst = 'email';
        this.passErrInst = 'password';
        this.fileErrInst = 'file';
        this.gs.setStartPg(false);

        const urlSnap = this.route.snapshot.pathFromRoot.map(o => o.url[0]).join('/');
        this.merchantParam = this.route.snapshot.queryParams.merchant_id;
        this.mrchCodeParam = this.route.snapshot.queryParams.code;
        this.employeeParam = this.route.snapshot.queryParams.employee_id;
        const urlSnapClType = urlSnap[1];
        // console.log('urlSnapClType = ', urlSnap[1]);
        // console.log('mrchntID = ', this.merchantParam);

        switch ( urlSnapClType ) {
            case '/':
                this.clientType = 'm';
                this.isMerchant = true;
                this.createMerchantForm();
                // console.log( 'merchant in auth: ', urlSnapClType );
                break;
            case 'c':
                this.clientType = urlSnapClType;
                this.isClient = true;
                this.createClientForm();
                // console.log( 'client: ', urlSnapClType );
                break;
            case 'u':
                this.clientType = urlSnapClType;
                this.isUser = true;
                this.createUserForm();
                // console.log( 'user: ', urlSnapClType );
                break;

        }

    }

    makeDirty(): void {
        // this.formArray.get([1, 'role']).markAsTouched();
        // this.formArray.get([1, 'product']).markAsTouched();
        // (adtnlOptns as FormArray).push(this.fb.group({
        //   role: [''],
        // }));
        // console.log('its dirty');
    }

    createMerchantForm() {
        this.submitForm = this.fb.group( {
            formArray: this.fb.array( [
                this.fb.group( {
                    name: [ '', [ Validators.required, Validators.pattern( bizNmScrubr.bizName ) ] ],
                    email: [ '', [ Validators.required, Validators.email ] ],
                    password: [ { value: '', disabled: true }, [ Validators.required, Validators.pattern( regExps.password ) ] ]
                }),
                this.fb.group( {
                    merchantid: [ {value: this.merchantParam, disabled: true }, Validators.required ],
                    role: [ '', Validators.required ],
                    product: [ '', Validators.required ],
                    /*dbdata: [ '' ]*/
                }),
            ])
        });
    }

    createClientForm() {
        this.submitForm = this.fb.group( {
            formArray: this.fb.array( [
                this.fb.group( {
                    name: [ '', [ Validators.required, Validators.pattern( bizNmScrubr.bizName ) ] ],
                    email: [ '', [ Validators.required, Validators.email ] ],
                    password: [ { value: '', disabled: true }, [ Validators.required, Validators.pattern( regExps.password ) ] ]
                }),
                this.fb.group( {
                    merchantid: [ '', [ Validators.required, Validators.pattern( bizNmScrubr.mrchntID ) ] ],
                    role: [ '', Validators.required ],
                    product: [ '', Validators.required ],
                    /*dbdata: [ '' ]*/
                }),
            ])
        });
    }

    createUserForm() {
        this.submitForm = this.fb.group( {
            formArray: this.fb.array( [
                this.fb.group( {
                    name: [ '', [ Validators.required, Validators.pattern( bizNmScrubr.bizName ) ] ],
                    email: [ '', [ Validators.required, Validators.email ] ],
                    password: [ { value: '', disabled: true }, [ Validators.required, Validators.pattern( regExps.password ) ] ]
                })
            ])
        });
    }

    isBizNameValid() {
        // console.log( 'is activated');
    }

    validateEmail() {
        const user = this.formArray.get([0, 'email']).value;
        const mrchID = this.merchantParam;
        this.als.isEmailValid(`${user}` , `${this.clientType}`, `${mrchID}` ).subscribe(
            res => {
                const validRes = res;
                switch ( true ) {
                    // email not present in DB //
                    case validRes !== 1:
                        this.formArray.get([0, 'password']).enable();
                        this.emailErrInst = 'email';
                        // console.log(`${this.clientType}` + 'Email not in db good for signup');
                        break;
                    // email present in DB //
                    case validRes === 1:
                        this.emailErrInst = 'existingEmail';
                        this.formArray.get([0, 'email']).setErrors({emailErr: true});
                        // this.submitForm.get('userLoginData.email').setErrors({'emailErr': true});
                        break;
                }
                // console.log('eMailSign-Up-res: ' + validRes);
            }
        );
    }

    addUser() {
        const username = this.formArray.get([0, 'name']).value;
        const useremail = this.formArray.get([0, 'email']).value;
        const userpass = this.formArray.get([0, 'password']).value;
        // console.log()
        // console.log('merch: ', this.isMerchant);
        if (this.submitForm.dirty && this.submitForm.valid) {

            if (this.isMerchant || this.isClient)   {
                // console.log('addUser MerchantID: ', this.merchantParam);

                const merchantid = this.formArray.get([1, 'merchantid']).value;
                const role = this.formArray.get([1, 'role']).value;
                const products = this.formArray.get([1, 'product']).value;
                // const dbdata = this.formArray.get([1, 'dbdata']).value;

                products.forEach( (x, i) => {
                    // console.log('value: ' + x);
                    this.mProduct[i] = x;
                    // console.log('v: ' + this.mProduct[i]);
                });

                this.als.addNewUser(
                    `${username}`,
                    `${useremail}`,
                    `${userpass}` ,
                    `${this.clientType}`,
                    `${merchantid}`,
                    `${this.employeeParam}`,
                    `${this.mrchCodeParam}`,
                    `${role}`,
                    `${this.mProduct}`,
                    // `${dbdata}`
                ).subscribe(
                    res => {
                        // const usrValidRes = res;
                        switch ( true ) {
                            // user not addded //
                            case res !== 1:
                                this.passErrInst = 'addMrchntError';
                                // this.formArray.get([0, 'password']).value.setErrors({ 'addUsrError: ': true});
                                // console.log('something went wrong adding merchant');
                                break;
                            // user added //
                            case res === 1:
                                this.router.navigate(['./signin'], { relativeTo: this.route });
                                // console.log('Valid Merchant Pass');
                                break;
                        }
                    }
                );
            } else {

                this.als.addNewUser( `${username}`, `${useremail}`, `${userpass}`, `${this.clientType}` ).subscribe( res => {
                    // const usrValidRes = res;
                    // console.log('res: ' + res);
                    switch ( true ) {
                        // user not addded //
                        case res !== 1:
                            this.passErrInst = 'addUsrError';
                            // this.formArray.get( [ 0, 'password' ] ).setErrors( { 'addUsrError: ': true } );
                            // console.log( 'something went wrong with user' );
                            break;
                        // user added //
                        case res === 1:
                            this.router.navigate( [ './signin' ], { relativeTo: this.route } );
                            // console.log( 'Valid User Pass' );
                            break;
                    }
                } );
            }
        }
    }

    gotoSignIn() {
        this.router.navigate(['/signin'], {queryParamsHandling: 'preserve'});
    }

    gotoReset() {
        this.router.navigate(['/auth/reset'], {queryParamsHandling: 'preserve'});
    }

}
