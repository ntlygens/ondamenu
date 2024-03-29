import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Subject, BehaviorSubject, Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class MerchantService {
    readonly mID$;

    private $rURL = 'https://smashradio1fm.com/php/';
    private isMID$: Subject<any> = new BehaviorSubject<any>('mid');

    private static createJSONPostHeader(headers: HttpHeaders) {
        headers.append('Content-Type', 'application/json');
    }

    private static createFilePostHeader(headers: HttpHeaders) {
        headers.append('Content-Type', 'multipart/form-data');
        headers.append('Accept', 'application/json');
    }

    constructor(
        private http: HttpClient
    ) {
        this.mID$ = this.isMID$.asObservable();
    }

    /* // ----- Get Calls ----- // */
    async getMerchantDetails(mID: string) {
        const mdHttpParams = new HttpParams()
            .set('mID', mID);

        const details = await this.http.get(`${this.$rURL}`, {params: mdHttpParams}).toPromise();
        if (!details) {
            return;
        }
        return details;
    }

    async getMobileDashCardData() {
        const dashboardTileData = await this.http.get('assets/core-assets/docs/mobile-dashboard-interface.json').toPromise();
        if (!dashboardTileData) { return; }

        return dashboardTileData;
    }

    async getMerchantItemsW_Cats(mID: string) {
        const mdHttpParams = new HttpParams()
            .set('mInCt', mID);

        const mItems = await this.http.get(`${this.$rURL}`, {params: mdHttpParams}).toPromise();
        if (!mItems) { return; }
        return mItems;
    }

    /*async sendProdImgs(data) {
        // console.log('fd-data: ', data);
        // let nuParamSendProdImgs = new HttpParams();
        // .set('items', items);
        // .set('orderid', orderid);
        // nuParamSendProdImgs = data;

        const headers = new HttpHeaders();
        MerchantService.createFilePostHeader(headers);

        // console.log('bdy \n' + JSON.stringify(items));
        // console.log('foodOrder2Send: ', nuParamsAddItems2Order );
        const mImage = await this.http.post(`${this.$rURL}`, data, { headers }).toPromise();
        if ( mImage ) { return; }
        return mImage;
    }*/

    sendProdImgs(data) {
        // console.log('fd-data: ', data);
        // let nuParamSendProdImgs = new HttpParams();
        // .set('items', items);
        // .set('orderid', orderid);
        // nuParamSendProdImgs = data;

        const headers = new HttpHeaders();
        MerchantService.createFilePostHeader(headers);

        // console.log('bdy \n' + JSON.stringify(items));
        // console.log('foodOrder2Send: ', nuParamsAddItems2Order );
        return this.http.post(`${this.$rURL}`, data, { headers });

    }



    /* // ----- Put Calls ----- // */
    sendMerchantProfileData(...args): Observable<any> {
        const splitArgs = (args.toString()).split(',');
        const argsLength = splitArgs.length;
        const postVars = [
            'mID',
            'username',
            'email',
            'pwd',
            'slogan',
            'bio',
            'phone',
            'delivery',
            'shipping',
            'bldg_num',
            'address',
            'address2',
            'boro',
            'state',
            'zip',
            'food',
            'concept',
            'model',
            'restrictions',
            'formData'
        ];

        let Params = new HttpParams();
        for (let i = 0; i < argsLength; ++i) {
            if ( i < (argsLength - 1) ) {
                Params = Params.append(`${[postVars[i]]}`, `${splitArgs[i]}`);
            } else {
                Params = Params.append( `${[postVars[i]]}`, '1' );
            }
        }

        // console.log('Params: ' + Params);
        const headers = new HttpHeaders();
        MerchantService.createJSONPostHeader(headers);

        return this.http.post(`${this.$rURL}`, [Params], {headers});

    }

}
