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

    async getMerchantDetails(mID: string) {
        const mdHttpParams = new HttpParams()
            .set('mID', mID);

        const details = await this.http.get(`${this.$rURL}`, {params: mdHttpParams}).toPromise();
        if (!details) { return; }
        return details;
    }
}
