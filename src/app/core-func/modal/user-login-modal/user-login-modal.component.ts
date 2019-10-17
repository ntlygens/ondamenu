import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { UserLoginForm } from '../../../amm.enum';
import { CustomValidators, ConfirmValidEmailMatcher, ConfirmValidModalEmailMatcher, ConfirmValidParentMatcher, ConfirmValidModalParentMatcher, regExps, errorMessages } from '../../errors/custom-validation.component';

@Component({
  selector: 'amm-user-login-modal',
  template: `
    <form *ngIf='!signUpForm' [formGroup]='userAuthForm' novalidate>
      <h1 mat-dialog-title>{{data.name}}</h1>
      <img src='../biota/assets/leaf_icon.jpg' class='modal_icon' />
      <p>Please sign in or sign up below</p>
      <div mat-dialog-content>

        <div formGroupName='submitLoginForm'>
          <mat-form-field>
            <input matInput placeholder='enter your email' type='email' formControlName='email' name='email' [errorStateMatcher]='confirmValidEmailMatcher' />
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
      <h1 mat-dialog-title>{{data.name}}</h1>
      <img src='../biota/assets/leaf_icon.jpg' class='modal_icon' />
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
    }
    .mat-dialog-actions {
      justify-content: center;
    }
  `]
})
export class UserLoginModalComponent implements OnInit {
  userAuthForm: FormGroup;
  submitLoginForm: FormGroup;
  submitEmailGroup: FormGroup;
  submitPassGroup: FormGroup;

  confirmValidEmailMatcher = new ConfirmValidEmailMatcher();
  confirmValidModalEmailMatcher = new ConfirmValidModalEmailMatcher();
  confirmValidParentMatcher = new ConfirmValidParentMatcher();
  confirmValidModalParentMatcher = new ConfirmValidModalParentMatcher();
  errors = errorMessages;
  emailErrInst: string;
  passErrInst: string;

  signUpForm: boolean;

  constructor(
    private fb: FormBuilder,
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
