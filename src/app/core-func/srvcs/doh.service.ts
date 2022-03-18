import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';


@Injectable({
    providedIn: 'root'
})
export class DohService {
    readonly dohRtng$: any;
    readonly dohRtngData$: any;
    setDohRtng = new BehaviorSubject<any>({dohRtg: true});

    private mSiteURL: 'https://smashradio1fm.com/php/';
    mDOHUrlDBA: 'https://data.cityofnewyork.us/resource/43nn-pn8j.json?$where=dba like ';
    mDOHURL: 'https://data.cityofnewyork.us/resource/43nn-pn8j.json?';
    mDOHUrlZIP: '&zipcode=';
    mDOHUrlLIMIT: 'limit=1';

    constructor(
        private http: HttpClient
    ) {
        this.dohRtng$ = this.setDohRtng.asObservable();
    }

    setDOHRating(s) {
        this.setDohRtng.next(s);
    }

    getDOHRatingData(): any {
        return this.dohRtng$;
    }

    async getMrchDOHData(arg) {
        // const argArray: Array<string> = (args.toString()).split(',');
        const mDOHInfo = new HttpParams()
            .set('dohData', '*')
            .set('clid', arg);

        const dohData = await this.http.get(`${this.mSiteURL}`, {params: mDOHInfo}).toPromise();
        if (!dohData) { return; }
        return dohData;
    }

    async getNewMrchDOHData(arg) {
        // const argArray: Array<string> = (args.toString()).split(',');

        const mDOHInfo = new HttpParams()
            .set('$newDohSelect', '*')
            .set('clid', arg);
        const newDohData = await this.http.get(`${this.mSiteURL}`, {params: mDOHInfo}).toPromise();
        if (!newDohData) { return; }
        return newDohData;
    }
}
