import { Component, OnInit, Inject } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';
import { MatLegacyDialogRef as MatDialogRef } from '@angular/material/legacy-dialog';
import { UserLoginForm } from '../../../amm.enum';
import { CustomValidators, ConfirmValidEmailMatcher, ConfirmValidModalEmailMatcher, ConfirmValidParentMatcher, ConfirmValidModalParentMatcher, regExps, errorMessages } from '../../errors/custom-validation.component';

@Component({
  selector: 'amm-user-login-modal',
  template: `
    <form *ngIf='!signUpForm' [formGroup]='userAuthForm' novalidate>
      <!--<img src='../biota/assets/backgrounds/mobile/bckgrnd-1-noBckgrnd.png' class='modal_icon' />-->
        <div class="imgLOGO"></div>
      <p>Please sign in or sign up below</p>
      <div mat-dialog-content>

        <div formGroupName='submitLoginForm'>
          <mat-form-field>
            <input matInput type='email' formControlName='email' name='email' [(ngModel)]='data.email' [errorStateMatcher]='confirmValidEmailMatcher' />
            <mat-error>
              {{errors[emailErrInst]}}
            </mat-error>
          </mat-form-field>

          <mat-form-field>
            <input matInput placeholder='enter your password' type='password' formControlName='upw' name='upw'  />
            <mat-error>
              {{errors[passErrInst]}}
            </mat-error>
          </mat-form-field>
        </div>

        <div mat-dialog-actions>
          <button mat-button (click)="openSignUpForm()">Sign Up</button>
          <button mat-button [mat-dialog-close]="data" cdkFocusInitial>Submit</button>
        </div>

      </div><!-- mat-dialog-content-end -->
    </form>

    <form *ngIf='signUpForm' ngForm='userAuthForm' novalidate>
        <div class="imgLOGO"></div>
        <p>Please sign in or sign up below</p>
      <div mat-dialog-content>

          <div [ngModelGroup]='submitEmailGroup'>
            <mat-form-field>
              <input matInput placeholder='enter your email' type='email' [(ngModel)]='data.email' [errorStateMatcher]='confirmValidModalEmailMatcher' />
              <mat-error>
                {{errors[emailErrInst]}}
              </mat-error>
            </mat-form-field>

            <!--<mat-form-field>
              <input matInput placeholder='confirm your email' type='email' [(ngModel)]='data.confirm_email' [ngModelOptions]='{name: "confirm_email"}' [errorStateMatcher]='confirmValidParentMatcher' />
            </mat-form-field>-->
          </div>

          <div [ngModelGroup]='submitPassGroup'>
            <mat-form-field>
              <input matInput placeholder='enter your password' type='password' [(ngModel)]='data.upw' name="upw"  />
              <mat-error>
                {{errors[passErrInst]}}
              </mat-error>
            </mat-form-field>

            <mat-form-field>
              <input matInput placeholder='confirm your password' type='password' [(ngModel)]='data.confirm_upw' name='confirm_upw' [errorStateMatcher]='confirmValidModalParentMatcher' />
            </mat-form-field>
          </div>

        <div mat-dialog-actions>
          <button mat-button (click)="closeDialog()">Cancel</button>
          <button mat-button [mat-dialog-close]="data" cdkFocusInitial>Submit</button>
        </div>

      </div><!-- mat-dialog-content-end -->
    </form>

  `,
  styles: [`
    form {
      text-align: center;
        height: 100%;
    }
    .mat-dialog-actions {
      justify-content: center;
    }
      .imgLOGO {
          overflow: hidden;
          width: 80%;
          height: 120px;
          text-align: center;
          vertical-align: middle;
          background: url('../../../../assets/backgrounds/mobile/bckgrnd-1-noBckgrnd.png') 50% 40% no-repeat;
          background-size: cover;
          margin: auto;
      }
  `]
})
export class UserLoginModalComponent implements OnInit {
  userAuthForm: UntypedFormGroup;
  submitLoginForm: UntypedFormGroup;
  submitEmailGroup: UntypedFormGroup;
  submitPassGroup: UntypedFormGroup;

  confirmValidEmailMatcher = new ConfirmValidEmailMatcher();
  confirmValidModalEmailMatcher = new ConfirmValidModalEmailMatcher();
  confirmValidParentMatcher = new ConfirmValidParentMatcher();
  confirmValidModalParentMatcher = new ConfirmValidModalParentMatcher();
  errors = errorMessages;
  emailErrInst: string;
  passErrInst: string;

  signUpForm: boolean;

  constructor(
    private fb: UntypedFormBuilder,
    private dialogRef: MatDialogRef<UserLoginModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: UserLoginForm
  ) {
    this.emailErrInst = 'email';
    this.passErrInst = 'password';
    this.signUpForm = false;
  }

  ngOnInit() {
      // console.log('data: ', this.data.name);
    this.userAuthForm = this.fb.group( {
      submitLoginForm: this.fb.group( {
        email: ['', [Validators.required, Validators.email]],
        upw: ['', [Validators.required, Validators.pattern(regExps.password)]]
      }),
    });

  }

  openSignUpForm(): void {
    this.userAuthForm = this.fb.group({
      submitEmailGroup: this.fb.group({
        email: ['', [Validators.required, Validators.email]],
        // confirm_email: ['', Validators.required]
      }, { /* validator: CustomValidators.childrenEqual */ }),
      submitPassGroup: this.fb.group( {
        upw: ['', [Validators.required, Validators.pattern(regExps.password)]],
        confirm_upw: ['', Validators.required]
      }, {validator: CustomValidators.childrenEqual})
    });

    this.signUpForm = true;
  }

  closeDialog(): void {
    this.dialogRef.close();
  }

}
