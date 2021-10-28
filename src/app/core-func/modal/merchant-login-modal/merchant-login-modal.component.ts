import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validator, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog/dialog';
import { MatDialogRef  } from '@angular/material/dialog/dialog-ref';
import { regExps } from '../../errors/custom-validation.component';
import { MerchantLoginForm } from '../../../amm.enum';

@Component({
  selector: 'amm-merchant-login-modal',
  template: `
    <form id='MerchantModal' novalidate>
      <div ngModelGroup='mLoginForm'>

        <h1 mat-dialog-title>Hi {{data.name}}</h1>
        <div mat-dialog-content>
          <p>What's your favorite animal?</p>
          <mat-form-field>
            <input matInput [(ngModel)]="data.animal">
          </mat-form-field>
        </div>
        <div mat-dialog-actions>
          <button mat-button (click)="onNoClick()">No Thanks</button>
          <button mat-button [mat-dialog-close]="data.animal" cdkFocusInitial>Ok</button>
        </div>
        <!--<mat-form-field>
          <input matInput placeholder='firstname' type='text' name='firstname' [(ngModel)]="data.comp.firstname" />
        </mat-form-field>
        <mat-form-field>
          <input matInput placeholder='lastname' type='text' name='lastname' [(ngModel)]="data.comp.lastname" />
        </mat-form-field>
        <mat-form-field>
          <input matInput placeholder='gender' type='text' name='gender' [(ngModel)]="data.comp.gender" />
        </mat-form-field>
        <mat-form-field>
          <input matInput placeholder='address' type='text' name='address' [(ngModel)]="data.comp.address.city" />
        </mat-form-field>-->
      </div>
      <!--<button (click)='isUserValid()' [disabled]='this.submitForm.invalid' color='warn' mat-raised-button type='button'>Sign In</button>-->
      <div id='loginOptns'>
        <!--<a href='#' (click)='$event.preventDefault(); gotoSignUp()' routerLinkActive='true' id='signup' name='signup'>Sign Up</a>
        <a href='#' (click)='$event.preventDefault(); gotoReset()' routerLinkActive='true' id='reset' name='reset'>Reset</a>-->
      </div>
    </form>
  `,
  styleUrls: ['./merchant-login-modal.component.scss']
})
export class MerchantLoginModalComponent implements OnInit {

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<MerchantLoginModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: MerchantLoginForm
  ) { }

  ngOnInit() {
      // console.log('data: ', this.data.name);
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

}
