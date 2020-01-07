import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import {BehaviorSubject, Subject} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
    private keyURI = 'https://www.smashradio1fm.com/php/'; // SANDBOX LINK //
    // private keyEndpoint = 'http://apisandbox.dev.clover.com/v2/merchant/'; // SANDBOX LINK //

    private static createJSONPostHeader(headers: HttpHeaders) {
        headers.append('content-type', 'application/json');
    }

    constructor(
        private http: HttpClient
    ) {}

    getkey(mID: string): any {
        const getHKey = new HttpParams()
            .set('gKey', mID);

        return this.http.get(`${this.keyURI}`, {params: getHKey});
    }

    async sendPayment(...args) {
        const splitArgs = (args.toString()).split(',');
        const postVars = [
            'oid4pymnt',
            'oamt',
            'omid',
            'occnum',
            'occxpm',
            'occxpy',
            'occcvv',
            'occzip'
        ];

        let Params = new HttpParams();

        console.log('args recieved length: ', args.length, '; test arg: ', args[0]);
        for (let i = 0; i < splitArgs.length; ++i) {
            if ( i < 8 ) {
                Params = Params.append(`${[postVars[i]]}`, `${splitArgs[ i ]}`);
            } else {
                console.log('send4Payment_postVars_Error: amt args revieved does not same as function;');
                // Params = Params.append( `${splitArgs[ i ]}`, '1' );
            }
        }

        // console.log('Params: ', Params);
        const headers = new HttpHeaders();
        PaymentService.createJSONPostHeader(headers);

        const payResp = await this.http.post( `${this.keyURI}`, [Params], {headers} ).toPromise();
        if (!payResp) { return; }
        return payResp;
    }
}
