import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, Subject } from 'rxjs';
import { MerchantInfoData } from '../../amm.enum';

@Injectable({
    providedIn: 'root'
})
export class StorageService {

    readonly isStartPg$: any;
    readonly menuBnrData$: any;
    readonly profileStatus$: any;

    private setStartPg$: Subject<boolean> = new BehaviorSubject<boolean>(true);
    private setPrflStatus$: Subject<boolean> = new BehaviorSubject<boolean>(false);
    private setMnuData$: Subject<MerchantInfoData> = new BehaviorSubject<MerchantInfoData>(null);


    constructor() {
        this.isStartPg$ = this.setStartPg$.asObservable();
        this.menuBnrData$ = this.setMnuData$.asObservable();
        this.profileStatus$ = this.setPrflStatus$.asObservable();
    }

    setStartPg(s) {
        this.setStartPg$.next(s);
    }

    setProfileStatus(profile) {
        this.setPrflStatus$.next(profile);
    }

    setBannerData(menudata) {
        this.setMnuData$.next(menudata);
    }

}
