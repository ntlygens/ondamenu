import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, Subject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class GuiService {
    readonly isStartPg$: any;
    readonly isMobile$: any;
    readonly isVisible$: any;

    private setStartPg$: Subject<boolean> = new BehaviorSubject<boolean>(true);
    private setMediaSize$: Subject<boolean> = new BehaviorSubject<boolean>(false);
    private setVisibility$: Subject<boolean> = new BehaviorSubject<boolean>(true);


    constructor() {
        this.isStartPg$ = this.setStartPg$.asObservable();
        this.isMobile$ = this.setMediaSize$.asObservable();
        this.isVisible$ = this.setVisibility$.asObservable();
    }

    // *** set data fns *** //
    setStartPg(s) {
        this.setStartPg$.next(s);
    }

    setMediaDevice(d) {
        this.setMediaSize$.next(d);
    }

    setVisibility(d) {
        this.setVisibility$.next(d);
    }


    // *** get data fns *** //
    isMobileDevice() {
        const isDeviceMobile = this.isMobile$;
        if (!isDeviceMobile) {
            return;
        }
        return isDeviceMobile;
        // return this.isMobile$;
    }
}
