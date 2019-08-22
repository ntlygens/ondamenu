import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

    readonly isSplashPg$: any;
    setPgRoute = new BehaviorSubject<any>({s: true});

  constructor() {
      this.isSplashPg$ = this.setPgRoute.asObservable();
  }

  setPageRoute(s) {
      this.setPgRoute.next(s);
  }

  getPageRoute(): any {
      return this.isSplashPg$;
  }
}
