import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, Subject } from 'rxjs';
import { MerchantInfoData } from '../../amm.enum';

@Injectable({
    providedIn: 'root'
})
export class StorageService {
    readonly menuBnrData$: any;
    readonly profileStatus$: any;

    private setPrflStatus$: Subject<boolean> = new BehaviorSubject<boolean>(false);
    private setMnuData$: Subject<MerchantInfoData> = new BehaviorSubject<MerchantInfoData>(null);

    constructor() {
        this.menuBnrData$ = this.setMnuData$.asObservable();
        this.profileStatus$ = this.setPrflStatus$.asObservable();
    }

    setProfileStatus(profile) {
        this.setPrflStatus$.next(profile);
    }

    setBannerData(menudata) {
        this.setMnuData$.next(menudata);
    }

}
