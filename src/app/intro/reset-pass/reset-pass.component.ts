import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Route, Router } from '@angular/router';
import { FormBuilder, Form, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-reset-pass',
  template: `
      <!--<div #resetPG><ng-content select='reset_ui'></ng-content></div>-->
      <!--<div *ngIf='resetPG.children.length === 0'>-->
      <div>
          <img class='splashImg fixedCenter' src='../../../assets/imgs/PWReset_Cntnr.svg' alt='background_image' />
          <div id='CTA_div'>
              <article>Welcome to Biota <br>Reset Password</article>
              <button routerLink='/intro' routerLinkActive='true' color='warn' mat-flat-button type='button'>Reset</button>
              <div id='loginOptns'>
                  <a mat-raised-button (click)='$event.preventDefault(); gotoSignUp()' routerLinkActive='true' id='signup' name='signup'>Sign Up</a>
                  <a mat-raised-button (click)='$event.preventDefault(); gotoSignIn()' routerLinkActive='true' id='signin' name='signin'>Sign In</a>
              </div>
          </div>
      </div>
  `,
  styles: [`
    .splashImg {
      width: 100%;
      height: auto;
    }
  `]
})
export class ResetPassComponent implements OnInit {

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private fb: FormBuilder,
  ) {}

  ngOnInit() {
  }

  gotoSignIn() {
    this.router.navigate(['/auth'], {queryParamsHandling: 'preserve'});
  }

  gotoSignUp() {
    this.router.navigate(['/auth/signup'], {queryParamsHandling: 'preserve'});
  }

}
