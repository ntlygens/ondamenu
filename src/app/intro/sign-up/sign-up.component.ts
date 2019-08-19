import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validator, Validators, FormArray, AbstractControl } from '@angular/forms';
import { LoginService } from '../../core-func/srvcs/login.service';
import {
  ConfirmValidEmailMatcher,
  ConfirmValidBusinessName,
  regExps, bizNmScrubr,
  errorMessages, bizNameErrMsgs
} from '../../core-func/errors/custom-validation/custom-validation.component';

@Component({
  selector: 'app-sign-up',
  template: `
    <img class='splashImg fixedCenter' src='../../../assets/imgs/Login_Cntnr.svg' alt='background_image' />
    <form [formGroup]='submitForm' id='signUpForm' novalidate>
      <article>Welcome to Biota <br> <b>Sign Up</b></article>
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
              <mat-option *ngFor='let role of roles; let idx=index' [value]='role'>{{role}}</mat-option>
            </mat-select>
          </mat-form-field>
          <mat-form-field>
            <mat-select placeholder="Product" formControlName="product" multiple>
              <mat-option *ngFor='let product of products; let idx=index' [value]='product'>{{product}}</mat-option>
            </mat-select>
          </mat-form-field>
          <!--<mat-form-field>
            <button type="button" mat-button (click)="imgFileInput.click()">Submit Your Data</button>
            <input #imgFileInput hidden type="file" placeholder='DB-Data' formControlName='dbdata' name='dbdata' />
            <input matInput placeholder='DB-Data' type='file' formControlName='dbdata' name='dbdata' />
            <mat-error>
              {{errors[fileErrInst]}}
            </mat-error>
          </mat-form-field>-->

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


      <!--<div #signupPG><ng-content select='signUp_ui'></ng-content></div>
      <div *ngIf='signupPG.children.length === 0'>
          <img class='splashImg' src='../../../assets/imgs/SignUp_Cntnr.svg' alt='background_image' />
          <div id='CTA_div'>
              <article>Welcome to Biota <br> <b>Get Started</b></article>
              <button routerLink='/user' routerLinkActive='true' color='warn' mat-flat-button type='button'>Sign Up</button>
              <div id='loginOptns'>
                  <a mat-raised-button routerLink='/intro' routerLinkActive='true'>Sign In</a>
                  <a mat-raised-button routerLink='/intro/reset' routerLinkActive='true' id='reset' name='reset'>Reset</a>
              </div>
          </div>
      </div>-->
  `,
  styles: [`

    .splashImg {
      width: 100%;
      height: auto;
    }

    #signUpForm {
      z-index: 3;
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      clear: both;
      width: 75%;
    }

    #stepper {
      height: 400px;
      margin: auto;
      width: inherit;
    }

    .mat-form-field--no-underline .mat-input-underline {
      background-color: transparent;
    }
  `],
  providers: [
    LoginService
  ]
})
export class SignUpComponent {

  // TODO: Add password confirmation field IMPORTANT //

  confirmValidEmailMatcher = new ConfirmValidEmailMatcher();
  // confirmValidParentMatcher = new ConfirmValidParentMatcher();
  confirmValidBusinessName = new ConfirmValidBusinessName();

  errors = errorMessages;
  bizerrors = bizNameErrMsgs;
  validator: Validator;

  bizNameErrInst: string;
  merchantIdErrInst: string;
  emailErrInst: string;
  passErrInst: string;
  fileErrInst: string;

  emailPwdLock: boolean;
  submitForm: FormGroup;
  submitFormTest: FormGroup;
  clientType: string;
  mProduct = [];
  isMerchant: boolean;
  isClient: boolean;
  isUser: boolean;

  merchantParam: string;
  mrchCodeParam: string;
  employeeParam: string;
  Param: string;
  merchantFormID: any;

  checked = true;
  disabled = true;

  roles = [
    'producer',
    'retailer',
    'merchant'
  ];
  products = [
    'goods',
    'produce',
    'fish',
    'meat',
    'halal',
    'kosher'
  ];

  get formArray(): AbstractControl | null {
    return this.submitForm.get('formArray');
  }


  constructor(
    private fb: FormBuilder,
    private als: LoginService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.bizNameErrInst = 'bizName';
    this.merchantIdErrInst = 'mrchntID';
    this.emailErrInst = 'email';
    this.passErrInst = 'password';
    this.fileErrInst = 'file';
    // this.createForm();

    const urlSnap = this.route.snapshot.pathFromRoot.map(o => o.url[0]).join('/');
    this.merchantParam = this.route.snapshot.queryParams.merchant_id;
    this.mrchCodeParam = this.route.snapshot.queryParams.code;
    this.employeeParam = this.route.snapshot.queryParams.employee_id;
    const urlSnapClType = urlSnap[1];
    console.log('urlSnapClType = ', urlSnap[1]);
    console.log('mrchntID = ', this.merchantParam);

    switch ( urlSnapClType ) {
      case 'a':
        this.clientType = 'm';
        this.isMerchant = true;
        this.createMerchantForm();
        console.log( 'merchant in auth: ', urlSnapClType );
        break;
      case 'c':
        this.clientType = urlSnapClType;
        this.isClient = true;
        this.createClientForm();
        console.log( 'client: ', urlSnapClType );
        break;
      case 'u':
        this.clientType = urlSnapClType;
        this.isUser = true;
        this.createUserForm();
        console.log( 'user: ', urlSnapClType );
        break;

    }

    /*if ( urlSnapClType === ('m' || 'c') ) {
      this.clientType = urlSnapClType;
      this.isMerchant = true;
      this.createMerchantForm();
      console.log( 'merchant: ', urlSnapClType );
    } else {
      this.clientType = urlSnapClType;
      this.isMerchant = false;
      this.createUserForm();
      console.log( 'client: ', urlSnapClType );
    }*/
  }

  makeDirty(): void {
    // this.formArray.get([1, 'role']).markAsTouched();
    // this.formArray.get([1, 'product']).markAsTouched();
    // (adtnlOptns as FormArray).push(this.fb.group({
    //   role: [''],
    // }));
    console.log('its dirty');
  }

  createMerchantForm() {
    // if (this.isMerchant) {
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
    // if (this.isMerchant) {
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
    // if (this.isMerchant) {
    /*  this.submitForm = this.fb.group( {
        formArray: this.fb.array( [
          this.fb.group( {
            email: [ '', [ Validators.required, Validators.email ] ],
            password: [ { value: '', disabled: true }, [ Validators.required, Validators.pattern( regExps.password ) ] ]
          }),
          this.fb.group( {
            role: [ '', Validators.required ],
            product: [ '', Validators.required ]
          }),
        ])
      });
    } else {*/
      this.submitForm = this.fb.group( {
        formArray: this.fb.array( [
          this.fb.group( {
            name: [ '', [ Validators.required, Validators.pattern( bizNmScrubr.bizName ) ] ],
            email: [ '', [ Validators.required, Validators.email ] ],
            password: [ { value: '', disabled: true }, [ Validators.required, Validators.pattern( regExps.password ) ] ]
          })
        ])
      });
    // }

  }

  isBizNameValid() {
    console.log( 'is activated');
    /*if ( this.formArray.get([0, 'name']).errors < 1 ) {

    };*/
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
        console.log('eMailSign-Up-res: ' + validRes);
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
        console.log('addUser MerchantID: ', this.merchantParam);

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
                console.log('something went wrong adding merchant');
                break;
              // user added //
              case res === 1:
                this.router.navigate([''], { relativeTo: this.route });
                console.log('Valid Merchant Pass');
                break;
            }
          }
        );
      } else {

        this.als.addNewUser( `${username}`, `${useremail}`, `${userpass}`, `${this.clientType}` ).subscribe( res => {
          // const usrValidRes = res;
          console.log('res: ' + res);
          switch ( true ) {
            // user not addded //
            case res !== 1:
              this.passErrInst = 'addUsrError';
              // this.formArray.get( [ 0, 'password' ] ).setErrors( { 'addUsrError: ': true } );
              // console.log( 'something went wrong with user' );
              break;
            // user added //
            case res === 1:
              this.router.navigate( [ '' ], { relativeTo: this.route } );
              console.log( 'Valid User Pass' );
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
