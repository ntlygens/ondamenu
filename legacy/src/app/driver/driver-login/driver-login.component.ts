import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { LoginService } from '../../core-func/srvcs/login.service';
import { StorageService } from '../../core-func/srvcs/storage.service';
import {
    ConfirmValidEmailMatcher,
    regExps,
    errorMessages,
} from '../../core-func/errors/custom-validation.component';

@Component({
    selector: 'amm-driver-login',
    template: '<body> <div> we are here. this is the driver </div> </body>' ,
    styles: [`.bg-body { align-content: center }`],
    providers: [LoginService]
})
export class DriverLoginComponent implements OnInit {
    confirmValidEmailMatcher = new ConfirmValidEmailMatcher();
    errors = errorMessages;

    emailErrInst: string;
    passErrInst: string;
    submitForm: UntypedFormGroup;
    clientType: any;
    merchantID: any;
    employeeID: any;
    clientID: any;
    code: any;

    constructor(
        private fb: UntypedFormBuilder,
        private als: LoginService,
        private router: Router,
        private route: ActivatedRoute,
        private ss: StorageService,
    ) {
        this.emailErrInst = 'email';
        this.passErrInst = 'password';
        // this.createForm();
    }

    ngOnInit() {
    }

}
