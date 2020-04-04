import { Component, OnInit, Input, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PaymentService } from '../srvcs/payment.service';
import { CartService } from '../srvcs/cart.service';
import { takeUntil } from 'rxjs/operators';
import { MerchantInfoData, PaymentResponseData } from '../../amm.enum';
import { Subject } from 'rxjs';
import {ActivatedRoute, Router} from '@angular/router';

@Component({
    selector: 'amm-food-payment',
    template: `
        <amm-advert
            crntPg="Payment Page"
            name="Company Name"
        ></amm-advert>
        <div [ngClass]="orderSbmtd ? 'visible pymtform' : 'hidden'">
            <form [formGroup]="submitForm" (submit)="sendData4Payment()" (reset)="cancelOrder()">
                <div formGroupName="name">
                    <label for="first">First</label>
                    <input style="margin-bottom: 1rem" type="text" id="first" class="form-control" formControlName="first" placeholder="firstname" required >
                    <!-- app-validation-messages [control]="this.submitForm.get('name.first')"></app-validation-messages -->
                    <label for="first">Last</label>
                    <input type="text" id="last" class="form-control" formControlName="last" placeholder="lastname" required >
                    <!-- app-validation-messages [control]="this.submitForm.get('name.last')"></app-validation-messages -->
                </div>
                <hr>
                <div formGroupName="ccdata">
                    <div class="d-inline-flex w-100" style="justify-content: space-between">
                        <div style="width: 60%">
                            <label for="cardNumber">card number </label>
                            <input type="number" id="cardNumber" class="form-control" formControlName="cardNumber"
                                   placeholder="5262 **** **** ****" value="" (blur)="getCardType()" required>
                            <!-- app-validation-messages [control]="this.submitForm.get('ccdata.cardNumber')"></app-validation-messages -->
                        </div>
                        <div [ngClass]="isCardType$ ? 'visible' : 'hidden' ">
                            <label for="cardType">card type</label>
                            <select id="cardType" name="cardType" [selectedIndex]="cardType$" class="form-control" formControlName="cardType">
                                <option value="visa">Visa</option>
                                <option value="mastercard">MasterCard</option>
                                <option value="amex">Amex</option>
                                <option value="discover">Discover</option>
                            </select>
                        </div>
                    </div>
                    <hr>
                    <div class="d-inline-flex mt-2" style="justify-content: space-between">

                        <div style="width: 30%;">
                            <label for="zip">zipcode </label>
                            <input type="number" id="zip" class="form-control" formControlName="zip" placeholder="10001" required>
                            <!-- app-validation-messages [control]="this.submitForm.get('ccdata.zip')"></app-validation-messages -->
                        </div>
                        <div style="width: 45%;">
                            <label for="expMonth">Exp. Date</label>
                            <div class="d-inline-flex w-100">
                                <select id="expMonth" name="expMonth" [selectedIndex]="cardType$" class="form-control" style=" width: 55%; margin-right: 0.25rem;" formControlName="expMonth">
                                    <option value="01">01</option>
                                    <option value="02">02</option>
                                    <option value="03">03</option>
                                    <option value="04">04</option>
                                    <option value="05">05</option>
                                    <option value="06">06</option>
                                    <option value="07">07</option>
                                    <option value="08">08</option>
                                    <option value="09">09</option>
                                    <option value="10">10</option>
                                    <option value="11">11</option>
                                    <option value="12" selected>12</option>
                                </select>
                                <select id="expYear" name="expYear" [selectedIndex]="cardType$" class="form-control" formControlName="expYear">
                                    <option value="20">2020</option>
                                    <option value="21">2021</option>
                                    <option value="22">2022</option>
                                    <option value="23">2023</option>
                                    <option value="24">2024</option>
                                    <option value="25">2025</option>
                                    <option value="26">2026</option>
                                    <option value="27">2027</option>
                                </select>
                            </div>
                        </div>
                        <div style="width: 15%; text-align: right;">
                            <label for="cvv">cvv </label>
                            <input type="number" id="cvv" class="form-control" style="text-align: right" formControlName="cvv" placeholder="111" required>
                            <!-- app-validation-messages [control]="this.submitForm.get('ccdata.cvv')"></app-validation-messages -->
                        </div>
                    </div>
                    <hr>
                </div>
                <div class="fg" formGroupName="orderData">
                    <input type="hidden" id="orderAmount" class="form-control" formControlName="orderAmount" [value]=orderAmount>
                    <input type="hidden" id="orderId" class="form-control" formControlName="orderId" [value]=orderId>
                </div>
                <button type="submit" class="btn btn-default" [disabled]="!submitForm.valid">Purchase</button>
                <button type="reset" class="btn btn-default" >Cancel</button>
            </form>
        </div>
        <div id="messageFromMe" [ngClass]="this.pResult ? 'vislble' : 'hidden'">Your Order is Processing<span style="text-decoration: blink">...</span></div>
      `,
    styles: [`
        form {
            color: white;
        }
        .visible {
            display: block;
        }

        .hidden {
            display: none;
        }

        .fg {
            color: #ea6a5e;
            display: flex;
            justify-content: space-between;
        }

        .pymtform {
            margin: 4%;
        }
        .form-control {
            padding: 0.375rem 0.5rem;
        }

      `],
    providers: [PaymentService]
})
export class FoodPaymentComponent implements OnInit, AfterViewInit, OnDestroy {
    @Input() orderSbmtd: boolean;

    pResult = false; elem: any; mID: any;
    isCardType$: boolean;
    cardType$: number;
    orderAmount: number;
    orderId: string;

    submitForm: FormGroup;
    private destroy$ = new Subject<any>();

    constructor(
        private fb: FormBuilder,
        private elemRef: ElementRef,
        private ps: PaymentService,
        private cs: CartService,
        private router: Router,
        private route: ActivatedRoute
    ) {
        this.elem = this.elemRef.nativeElement;
        this.orderSbmtd = true;
    }


    /// ======== APP FUNCTIONS ======== ///

    sendData4Payment(): void {
        if (this.submitForm.dirty && this.submitForm.valid) {
            this.orderSbmtd = false;
            const cHldrName: string = this.submitForm.value.name.first + ' ' + this.submitForm.value.name.last;
            const ccType: string = this.submitForm.value.ccdata.cardType;
            const ccNmbr: string = this.submitForm.value.ccdata.cardNumber;
            const ccCvv: string = this.submitForm.value.ccdata.cvv;
            const ccZip: string = this.submitForm.value.ccdata.zip;
            const ccExpMth: string = this.submitForm.value.ccdata.expMonth;
            const ccExpYr: string = this.submitForm.value.ccdata.expYear;
            const ccExpDate: string = ccExpMth + ccExpYr;

            const oAmt: number = this.orderAmount;
            const oID: string = this.orderId;


            this.ps.sendPayment(`${oID}`, `${oAmt}`, `${this.mID}`, `${ccNmbr}`, `${ccExpMth}`, `${ccExpYr}`, `${ccCvv}`, `${ccZip}` )
                .then(
                    (res: PaymentResponseData) => {
                        switch (res.result) {
                            case 'DECLINED':
                                alert('We\'re Sorry: ' + res.failureMessage + ' \n ');
                                break;
                            case 'APPROVED':
                                alert('Thank You. Your Payment was Successful');
                                this.router.navigate(['/u'], {relativeTo: this.route, queryParamsHandling: 'preserve'});
                        }
                        /*if (res === Object) {
                            console.log( 'obj res: ', JSON.stringify(res));
                        } else {
                            console.log( 'res: ', res);
                        }*/
                    },
                    (err) => {
                        // console.log('sendPayment_Error: ' + err);
                    }
                );

        }
    }

    cancelOrder() {
        this.submitForm.reset();
        this.orderSbmtd = false;
    }

    cartIDSend(msg: string) {
        // console.log('oIDRecvd-' + msg);
        this.orderId = msg;
    }

    cartAmtSend(msg: number) {
        // console.log('amtRecvd-', msg);
        this.orderAmount = msg;
    }

    getCardType(): number {

        this.isCardType$ = true;
        return this.cardType$;
        console.log('typeee: ', this.cardType$);
    }
    /// ======== LIFE CYCLE HOOKS ======== ///

    ngOnInit() {
        this.submitForm = this.fb.group({
            name: this.fb.group({
                first: ['', [Validators.required, Validators.minLength(2)]],
                last: ['', [Validators.required, Validators.minLength(2)]],
            }),
            ccdata: this.fb.group({
                cardType: ['', Validators.required],
                expMonth: ['', Validators.required],
                expYear: ['', Validators.required],
                cvv: ['', [Validators.required, Validators.pattern('^[0-9]{3}?$')]],
                cardNumber: ['', [Validators.required, Validators.maxLength(16)]],
                zip: ['', [Validators.required, Validators.pattern('^[0-9]{5}(?:-[0-9]{4})?$')]],
            }),
            orderData: this.fb.group({
                orderAmount: ['', Validators.minLength(3)],
                orderId: ['', Validators.minLength(3)],
            })
        });
    }

    ngAfterViewInit(): void {
        const params = (new URL(document.location.href)).searchParams;
        const searchParams = new URLSearchParams(params);

        if ( searchParams.has( 'clid')) {
            this.mID = searchParams.get('clid');
        }


        this.cs.orderID$.pipe(takeUntil(this.destroy$)).subscribe( (res) => {
            // console.log('oid: = ', res);
            this.orderId = res;
        });

        this.cs.orderAmt$.pipe(takeUntil(this.destroy$)).subscribe( (res) => {
            // console.log('oamt: = ', res);
            this.orderAmount = res;
        });
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

}
