import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams  } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { ActivatedRoute } from '@angular/router';

@Injectable({
    providedIn: 'root'
})
export class LoginService {
    baseURL;
    // emailValidate;
    // newUser;
    clientType;
    CloverAuth;

    constructor(
        private http: HttpClient,
        private route: ActivatedRoute
    ) {
        this.baseURL = 'https://www.smashradio1fm.com/php/'; // Remote
        // this.biotaURL = 'https://www.smashradio1fm.com/biota'; // Remote
        this.CloverAuth = 'https://api.clover.com:443/auth/authorize';
        // this.emailValidate = 'http://localhost/~ntlygens/php/validateEmail.php'; // Local
        // this.newUser = 'http://localhost/~ntlygens/php/addUser.php'; // Local
    }

    createJSONPostHeader(headers: HttpHeaders) {
        headers.append('Content-Type', 'application/json');
    }

    isProfileComplete(merchant: string): Observable<any> {
        const nuParamsIsProfileComplete = new HttpParams()
            .set('chkprfl', merchant);

        return this.http.get(`${this.baseURL}`, { params: nuParamsIsProfileComplete});
    }

    isUserValid(email: string, pwd: string, client: string, mID?: string): Observable<any> {
        const nuParamsIsUserValid = new HttpParams()
            .set('email', email)
            .set('client', client)
            .set('pwd', pwd)
            .set('mID', mID);

        return this.http.get(`${this.baseURL}`, {params: nuParamsIsUserValid});
    }

    isEmailValid(email: string, client: string, mID?: string): Observable<any> {
        const nuParamsIsEmailValid = new HttpParams()
            .set('vldtemail', email)
            .set('client', client)
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

    async getAllMerchants() {
        const userGetAllMerchants = new HttpParams()
            .set('clientType', 'user');

        const mrchntData = await this.http.get(`${this.baseURL}`, {params: userGetAllMerchants}).toPromise();
        if (!mrchntData) { return; }
        return mrchntData;

    }

    async getMerchantPromoCampaign() {
        const userGetMerchantCampaign = new HttpParams()
            .set('clientType', 'campaign')
            .set('client', 'm_92005');

        const mrchntPromoData = await this.http.get(`${this.baseURL}`, {params: userGetMerchantCampaign}).toPromise();
        if (!mrchntPromoData) { return; }
        return mrchntPromoData;

    }
}
