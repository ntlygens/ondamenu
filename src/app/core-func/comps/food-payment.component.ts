import { Component, OnInit, Input, ElementRef, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PaymentService } from '../srvcs/payment.service';

@Component({
    selector: 'amm-food-payment',
    template: `
        <div [ngClass]="orderSbmtd ? 'visible' : 'hidden'">
            <form [formGroup]="submitForm" (submit)="sendData4Payment()" (reset)="cancelOrder()">
                <div formGroupName="name">
                    <label for="first">First</label>
                    <input type="text" id="first" class="form-control" formControlName="first" placeholder="firstname" required >
                    <!-- app-validation-messages [control]="this.submitForm.get('name.first')"></app-validation-messages -->
                    <label for="first">Last</label>
                    <input type="text" id="last" class="form-control" formControlName="last" placeholder="lastname" required >
                    <!-- app-validation-messages [control]="this.submitForm.get('name.last')"></app-validation-messages -->
                </div>
                <div formGroupName="ccdata">
                    <div class="d-flex mt-2">
                        <div>
                            <label for="cardType">card type</label>
                            <select id="cardType" name="cardType" class="form-control" formControlName="cardType">
                                <option value="visa">Visa</option>
                                <option value="mastercard">Master Card</option>
                                <option value="American Express">American Express</option>
                                <option value="discover">Discover</option>
                            </select>
                        </div>
                        <div>
                            <label for="cardNumber">card number </label>
                            <input type="number" id="cardNumber" class="form-control col-8" formControlName="cardNumber" placeholder="5262 **** **** ****" value="" required>
                            <!-- app-validation-messages [control]="this.submitForm.get('ccdata.cardNumber')"></app-validation-messages -->
                        </div>
                        <div>
                            <label for="cvv">cvv </label>
                            <input type="number" id="cvv" class="form-control col-6" formControlName="cvv" placeholder="eg. 111" required>
                            <!-- app-validation-messages [control]="this.submitForm.get('ccdata.cvv')"></app-validation-messages -->
                        </div>
                        <div>
                            <label for="zip">zipcode </label>
                            <input type="number" id="zip" class="form-control col-8" formControlName="zip" placeholder="10001" required>
                            <!-- app-validation-messages [control]="this.submitForm.get('ccdata.zip')"></app-validation-messages -->
                        </div>
                        <div class="d-flex justify-content-between mt-2" >
                            <label for="expMonth">Exp. Date</label>
                            <select id="expMonth" name="expMonth" class="form-control" formControlName="expMonth">
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
                            </select> <select id="expYear" name="expYear" class="form-control" formControlName="expYear">
                            <option value="16">2016</option>
                            <option value="17">2017</option>
                            <option value="18">2018</option>
                            <option value="19">2019</option>
                            <option value="20">2020</option>
                            <option value="21">2021</option>
                            <option value="22">2022</option>
                            <option value="23">2023</option>
                            <option value="24">2024</option>
                            <option value="25">2025</option>
                        </select>
                        </div>
                    </div>

                </div>
                <div formGroupName="orderData">
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
        .visible {
            display: block;
        }

        .hidden {
            display: none;
        }
      `],
    providers: [PaymentService]
})
export class FoodPaymentComponent implements OnInit, AfterViewInit {
    @Input() orderSbmtd: boolean;

    pResult = false; elem: any; mID: any;
    orderAmount: number;
    orderId: string;

    submitForm: FormGroup;

    constructor(
        private fb: FormBuilder,
        private elemRef: ElementRef,
        private ps: PaymentService
    ) {
        this.elem = this.elemRef.nativeElement;
    }


    /// ======== APP FUNCTIONS ======== ///

    sendData4Payment(): void {

    }

    cancelOrder() {
        this.submitForm.reset();
        this.orderSbmtd = false;
    }

    cartIDSend(msg: string) {
        console.log('oIDRecvd-' + msg);
        this.orderId = msg;
    }

    cartAmtSend(msg: number) {
        console.log('amtRecvd-', msg);
        this.orderAmount = msg;
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
    }

}
