import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams  } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { ActivatedRoute } from '@angular/router';

@Injectable({
    providedIn: 'root'
})
export class LoginService {
    baseURL;
    emailValidate;
    newUser;
    clientType;
    CloverAuth;

    readonly profileStatus$: any;

    setPrflStatus = new BehaviorSubject<any>( {prflStat: 0 });

    constructor(
        private http: HttpClient,
        private route: ActivatedRoute
    ) {
        this.baseURL = 'https://www.smashradio1fm.com/php/'; // Remote
        // this.biotaURL = 'https://www.smashradio1fm.com/biota'; // Remote
        this.CloverAuth = 'https://api.clover.com:443/auth/authorize';
        this.emailValidate = 'http://localhost/~ntlygens/php/validateEmail.php'; // Local
        this.newUser = 'http://localhost/~ntlygens/php/addUser.php'; // Local
        this.profileStatus$ = this.setPrflStatus.asObservable();
    }

    createJSONPostHeader(headers: HttpHeaders) {
        headers.append('Content-Type', 'application/json');
    }

    isProfileComplete(merchant: string): Observable<any> {
        const nuParamsIsProfileComplete = new HttpParams()
            .set('chkprfl', merchant);

        return this.http.get(`${this.baseURL}`, { params: nuParamsIsProfileComplete});
    }

    isUserValid(email: string, pwd: string, menu: string, mID?: string): Observable<any> {
        const nuParamsIsUserValid = new HttpParams()
            .set('email', email)
            .set('menu', menu)
            .set('pwd', pwd)
            .set('mID', mID);

        return this.http.get(`${this.baseURL}`, {params: nuParamsIsUserValid});
    }

    isEmailValid(email: string, menu: string, mID?: string): Observable<any> {
        const nuParamsIsEmailValid = new HttpParams()
            .set('vldtemail', email)
            .set('menu', menu)
            .set('mID', mID);

        return this.http.get(`${this.baseURL}`, {params: nuParamsIsEmailValid} );
    }


    addNewUser(...args): Observable<any> {
        const splitArgs = (args.toString()).split(',');
        const postVars = [
            'username',
            'email',
            'pwd',
            'clienttype',
            'merchant_id',
            'employee_id',
            'merchant_code',
            'role',
            'product'
        ];

        let Params = new HttpParams();

        for (let i = 0; i < splitArgs.length; ++i) {
            if ( i < 7 ) {
                Params = Params.append(`${[postVars[i]]}`, `${splitArgs[ i ]}`);
            } else {
                Params = Params.append( `${splitArgs[ i ]}`, '1' );
            }
        }

        const headers = new HttpHeaders();
        this.createJSONPostHeader(headers);

        return this.http.post(`${this.baseURL}`, [Params], {headers});
    }

    getProfileStatus(): any {
        return this.profileStatus$;
    }

    setProfileStatus(prfl: any) {
        this.setPrflStatus.next(prfl);
    }

    async getAllMerchants() {
        const userGetAllMerchants = new HttpParams()
            .set('clientType', 'user');

        const mrchntData = await this.http.get(`${this.baseURL}`, {params: userGetAllMerchants}).toPromise();
        if (!mrchntData) { return; }
        return mrchntData;

    }
}
