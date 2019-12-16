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



    /* // ----- Put Calls ----- // */
    sendMerchantProfileData(...args): Observable<any> {
        const splitArgs = (args.toString()).split(',');
        const postVars = [
            'mID',
            'username',
            'email',
            'pwd',
            'slogan',
            'bio',
            'address',
            'phone',
            'food',
            'concept',
            'model',
            'restrictions',
            'formData'
        ];

        let Params = new HttpParams();

        for (let i = 0; i < splitArgs.length; ++i) {
            if ( i < 7 ) {
                Params = Params.append(`${[postVars[i]]}`, `${splitArgs[i]}`);
            } else {
                Params = Params.append( `${splitArgs[ i ]}`, '1' );
            }
        }

        const headers = new HttpHeaders();
        MerchantService.createJSONPostHeader(headers);

        return this.http.post(`${this.$rURL}`, [Params], {headers});

    }

}
