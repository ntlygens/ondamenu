import {
  UntypedFormGroup,
  UntypedFormControl,
  FormGroupDirective,
  NgForm,
  ValidatorFn,
  NgModelGroup,
  NgModel,
  AbstractControlDirective, AbstractFormGroupDirective
} from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';

export class CustomValidators {
    /**
     * Validates that child controls in the form group are equal
     */
    static childrenEqual: ValidatorFn = ( formGroup: UntypedFormGroup ) => {
        const [ firstControlName, ...otherControlNames ] = Object.keys( formGroup.controls || {} );
        const isValid = otherControlNames.every( controlName => formGroup.get( controlName ).value === formGroup.get( firstControlName ).value );
        return isValid ? null : { childrenNotEqual: true };
    }
}

export class ConfirmValidBusinessName implements  ErrorStateMatcher {
  isErrorState(control: UntypedFormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    // return control.parent.invalid && control.touched;
    const isSubmitted = form && form.submitted;
    return (control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}

/**
 * Custom ErrorStateMatcher which returns true (error exists) when the parent form group is invalid and the control has been touched
 */
export class ConfirmValidParentMatcher implements ErrorStateMatcher {
  isErrorState(control: UntypedFormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    return control.parent.invalid && control.touched;
  }
}

/**
 * Custom ErrorStateMatcher which returns true (error exists) when the parent form group is invalid and the control has been touched
 */
export class ConfirmValidModalParentMatcher implements ErrorStateMatcher {
  isErrorState(control: UntypedFormControl | null, form: AbstractControlDirective | NgForm | null): boolean {
    return control.parent.invalid && control.touched;
  }
}

/**
 * Custom ErrorStateMatcher which returns true (error exists) when the parent form group is invalid and the control has been touched
 */
export class ConfirmValidEmailMatcher implements ErrorStateMatcher {
    isErrorState(control: UntypedFormControl | null, form: FormGroupDirective | NgForm | null): boolean {
        const isSubmitted = form && form.submitted;
        return (control && control.invalid && (control.dirty || control.touched || isSubmitted));
    }
}

/**
 * Custom ErrorStateMatcher which returns true (error exists) when the parent form group is invalid and the control has been touched
 */
export class ConfirmValidModalEmailMatcher implements ErrorStateMatcher {
    isErrorState(control: UntypedFormControl | null, form: AbstractControlDirective | NgForm | null): boolean {
        const isSubmitted = form && form.touched;
        return (control && control.invalid && (control.dirty || control.touched || isSubmitted));
    }
}

/**
 * Collection of reusable RegExps
 */
export const regExps: { [key: string]: RegExp } = {
    password: /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{7,15}$/
};

export const bizNmScrubr: { [key: string]: RegExp } = {
    bizName: /^[A-Za-z0-9]+$/i,
    mrchntID: /^[A-Za-z0-9]+$/i
    // bizName: /^(?=.*[0-9])(?=.*[&.,'])[a-zA-Z0-9&.,']{7,15}$/
};

/**
 * Collection of reusable error messages
 */
export const errorMessages: { [key: string]: string } = {
    fullName: 'Full name must be between 1 and 128 characters',
    email: 'Email must be a valid email address (useremail@domain)',
    profileError: 'Only (png) file types accepted!!!. Please select (.png) image file',
    mEmail: 'mEmail must be a valid mEmail address (useremail@domain)',
    loginErr: 'Something went wrong. Please try again.',
    confirmEmail: 'Email addresses must match',
    wrgemail: 'The email provided does not exist on our server',
    fixemail: 'You have the incorrect email. Please Fix.',
    existingEmail: 'This email is already in use',
    addUsrError: 'Error: User not added. Please try again',
    addMrchntError: 'Error: Merchant not added. Please try again',
    password: 'Password must be between 7 and 15 characters, and contain at least one number and special character',
    confirmPassword: 'Passwords must match',
    wrgpwd: 'This password does not match the email provided',
    success: 'Your email is valid',
    file: 'Invalid file type'
};

export const bizNameErrMsgs: { [key: string]: string } = {
    bizName: 'Please enter a proper business name',
    errBizName: 'Please use ONLY Alpha-Numeric Characters',
    mrchntID: 'Please review your Merchant ID and re-enter'
};
