import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { MerchantDOHRating } from '../../amm.enum';
import { HttpClient, HttpParams } from '@angular/common/http';


@Injectable({
    providedIn: 'root'
})
export class DohService {
    readonly dohRtng$: any;
    setDohRtng = new BehaviorSubject<any>({dohRtg: true});

    mDOHData: MerchantDOHRating[];
    mDOHUrl: 'http://thedohurlhere.com/php/';

    constructor(
        private http: HttpClient
    ) {
        this.dohRtng$ = this.setDohRtng.asObservable();
    }

    setDOHRating(s) {
        this.setDohRtng.next(s);
    }

    getDOHRating(): any {
        return this.dohRtng$;
    }

    async getMrchDOHData(mID: string) {
        const mDOHInfo = new HttpParams()
            .set('mDohNfo', mID);

        const dohData = await this.http.get(`${this.mDOHUrl}`, {params: mDOHInfo}).toPromise();
        if (!dohData) { return; }
        return dohData;
    }
}
