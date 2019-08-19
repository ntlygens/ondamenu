import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, Validator } from '@angular/forms';
import { LoginService } from '../../core-func/srvcs/login.service';
import {
    ConfirmValidEmailMatcher,
    regExps,
    errorMessages,
} from '../../core-func/errors/custom-validation/custom-validation.component';


@Component({
    selector: 'app-sign-in',
    template: `
            <!--<img class='splashImg fixedCenter' src='../../../assets/imgs/Login_Cntnr.svg' alt='background_image' />-->
            <form [formGroup]='submitForm' [ngClass]='this.clientType === "m" ? "signInForm_border": ""' id='CTA_div' novalidate>
                <article>Welcome to Biota <br> sign in</article>
                <div formGroupName='userLoginData'>
                    <mat-form-field>
                        <input matInput (blur)='validateEmail()' placeholder='email' type='email' formControlName='email' name='email' [errorStateMatcher]='confirmValidEmailMatcher' />
                        <mat-error>
                            {{errors[emailErrInst]}}
                        </mat-error>
                    </mat-form-field>

                    <mat-form-field>
                        <input matInput placeholder='password' type='password' formControlName='password' name='password'  />
                        <mat-error>
                            {{errors[passErrInst]}}
                        </mat-error>
                    </mat-form-field>

                </div>
                <button (click)='validateUser()' [disabled]='this.submitForm.invalid' color='warn' mat-raised-button type='button'>Sign In</button>
                <div id='loginOptns'>
                    <a href='#' (click)='$event.preventDefault(); gotoSignUp()' routerLinkActive='true' id='signup' name='signup'>Sign Up</a>
                    <a href='#' (click)='$event.preventDefault(); gotoReset()' routerLinkActive='true' id='reset' name='reset'>Reset</a>
                </div>
            </form>

  `,
    styles: [`
      .splashImg {
        width: 100%;
        height: auto;
      }
    `],
    providers: [
      LoginService,
      // LocalAuthService,
    ],
})
export class SignInComponent implements OnInit {
    confirmValidEmailMatcher = new ConfirmValidEmailMatcher();
    errors = errorMessages;
    validator: Validator;

    emailErrInst: string;
    passErrInst: string;
    emailPwdLock: boolean;
    submitForm: FormGroup;
    clientType: any;
    merchantID: any;
    employeeID: any;
    clientID: any;
    code: any;

    isProfileCompleted: boolean;
    isTourComplete: boolean;
    constructor(
        private fb: FormBuilder,
        private als: LoginService,
        // private las: LocalAuthService,
        private router: Router,
        private route: ActivatedRoute,
        // private bottomSheetRef: MatBottomSheetRef<SignInComponent>,
    ) {
        this.emailErrInst = 'email';
        this.passErrInst = 'password';
        this.createForm();

        // let urlSnap = this.route.snapshot.pathFromRoot.map(o => o.url[0]).join('/');
        // let params = (new URL(document.location.href)).searchParams;
        // console.log('params: ', params);
        // console.log('url: ', urlSnap);
        // let searchParams = new URLSearchParams(params);
        // console.log('param count, ', $(searchParams).length);
        /*if ( searchParams.has('mId')) {
          this.merchantID = searchParams.get('auth');
          this.clientType = 'm';
          console.log( 'merchant' );
        } else {
          this.clientType = 'u';
          console.log( 'user' );
        }*/

        /*if ( urlSnap.indexOf('auth') > 0 ) {

        } else {
          this.clientType = 'u';
          console.log( 'user' );
        }*/
    }

    ngOnInit() {
      const params = (new URL(document.location.href)).searchParams;
      // console.log('params: ', params);
      // console.log('url: ', urlSnap);
      const searchParams = new URLSearchParams(params);
      // let urlSnap = this.route.snapshot.pathFromRoot.map(o => o.url[0]).join('/');
      // console.log('urlsnap: ', urlSnap);

      /*this.las.get_url_path().subscribe( (data) => {
        this.clientType = data.urlpath;
        // console.log('path: ', murl);
      });
      this.las.get_mid_param().subscribe( (data) => {
        this.merchantID = data.m_ID;
        // console.log('path: ', murl);
      });*/

      /*if ( urlSnap.indexOf('auth') > 0 ) {
        this.clientType = 'm';
        console.log( 'merchant mmm' );
      } else {
        this.clientType = 'u';
        console.log( 'client ccc' );
      }*/

      switch ( true ) {
        case searchParams.has('merchant_id'):
          this.clientType = 'm';
          this.merchantID = searchParams.get('merchant_id');
          break;
        case searchParams.has('employee_id'):
          this.employeeID = searchParams.get('employee_id');
          break;
        case searchParams.has('client_id'):
          this.clientID = searchParams.get('client_id');
          break;
        case searchParams.has('code'):
          this.code = searchParams.get('code');
          break;
        default:
          this.clientType = 'u';

      }

      console.log( 'm: ', this.merchantID, 'c: ', this.clientType );

    }

    createForm() {
        this.submitForm = this.fb.group({
            userLoginData: this.fb.group({
                email: ['', [Validators.required, Validators.email]],
                password: [{value: '', disabled: true}, [Validators.required, Validators.pattern(regExps.password)]]
            })
        });
    }

    validateEmail() {
        console.log('mid: ', this.merchantID);
        const user = this.submitForm.get('userLoginData.email').value;
        this.als.isEmailValid(`${user}`, `${this.clientType}`, `${this.merchantID}`).subscribe(
            res => {
                const validRes = res;
                // console.log('v-- ' + validRes);
                switch ( true ) {
                    // email not in DB Not a user //
                    case validRes !== 1:
                        this.emailErrInst = 'wrgemail';
                        this.submitForm.get('userLoginData.email').setErrors({emailErr: true});
                        // console.log(`${this.clientType}` + '-Email not in db- ' + validRes);
                        break;
                    case validRes === 1:
                        this.submitForm.get('userLoginData.password').enable();
                        this.emailErrInst = 'email';
                        // console.log('valid user');
                        break;
                }
                console.log('eMailSign-In-res: ' + validRes);
            }
        );
    }

    validateUser() {
        const client = this.clientType;
        const useremail = this.submitForm.get('userLoginData.email').value;
        const userpass = this.submitForm.get('userLoginData.password').value;
        const merchant = this.merchantID;
        if (this.submitForm.dirty && this.submitForm.valid) {
            this.als.isUserValid(useremail, userpass, client, merchant).subscribe(
                res => {
                    const usrValidRes = res;
                    switch ( true ) {
                        case usrValidRes !== 1:
                            this.passErrInst = 'wrgpwd';
                            this.submitForm.get('userLoginData.password').setErrors({wrongPwd: true});
                            console.log('incorrect pass');
                            break;
                        case usrValidRes === 1:
                            if ( this.clientType === 'm' ) {
                              console.log('being accesed by merchant');
                                /*this.als.getToken(this.merchantID, this.employeeID, this.code).subscribe(
                                  (Res) => {
                                    // this.las.set_mid_param({m_ID: mID});
                                    // this.router.navigate(['/auth'], {queryParams: { 'mId': mID}});

                                    console.log('being accesed by merchant');
                                    console.log('token returned: ', Res);
                                  },
                                  (err) => {
                                    console.log( 'there was an error getting token: ', err);
                                  },
                                  () => {
                                    console.log( 'complete' );
                                    this.router.navigate(['/m'], {relativeTo: this.route, queryParams: {'mID': merchant} });
                                  }
                                );*/
                              this.als.isProfileComplete(merchant).subscribe( resp => {
                                  // console.log('resp: ', resp);
                                  const isProfileCompleted = resp.profile_complete;
                                  this.als.setProfileStatus({prflStat: isProfileCompleted});
                                  console.log('profileCompleted: ', isProfileCompleted);
                                  if ( isProfileCompleted !== '0' ) {
                                    // IF PROFILE COMPLETE //
                                    this.router.navigate( [ '/m' ], { relativeTo: this.route, queryParams: { mID: merchant } } );
                                    console.log('profile completed!');
                                  } else {
                                    // IF PROFILE NOT COMPLETE //
                                    this.router.navigate(['/m/profile'], {relativeTo: this.route, queryParams: {mID: merchant} });
                                    console.log('profile NOT completed!');
                                  }
                                },
                                (err) => {
                                  console.log('there was an error getting profile status: ', err);
                                },
                                () => {
                                  // this.router.navigate(['/m'], {relativeTo: this.route, queryParams: {'mID': merchant} });
                                  // this.als.getProfileStatus().subscribe ( (resp) => { console.log('statusLog: ',  resp['prflStat']); } );
                                });
                            } else {
                                this.router.navigate(['/u'], {relativeTo: this.route});
                            }

                            break;
                    }
                }
            );
        }
    }

    gotoSignUp() {
        this.router.navigate(['/signup'], {relativeTo: this.route, queryParamsHandling: 'preserve'});
    }

    gotoReset() {
        this.router.navigate(['./reset'], {relativeTo: this.route, queryParamsHandling: 'preserve'});
    }


}

