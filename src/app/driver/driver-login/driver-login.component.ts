import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LoginService } from '../../core-func/srvcs/login.service';
import { StorageService } from '../../core-func/srvcs/storage.service';
import {
    ConfirmValidEmailMatcher,
    regExps,
    errorMessages,
} from '../../core-func/errors/custom-validation.component';

@Component({
    selector: 'amm-driver-login',
    templateUrl: './driver-login.component.html',
    styleUrls: ['./driver-login.component.scss'],
    providers: [LoginService]
})
export class DriverLoginComponent implements OnInit {
    confirmValidEmailMatcher = new ConfirmValidEmailMatcher();
    errors = errorMessages;

    emailErrInst: string;
    passErrInst: string;
    submitForm: FormGroup;
    clientType: any;
    merchantID: any;
    employeeID: any;
    clientID: any;
    code: any;

    constructor(
        private fb: FormBuilder,
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
