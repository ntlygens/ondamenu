import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})

export class MenuService {
    private srvrURL = 'https://smashradio1fm.com/php/';
    constructor(
        private http: HttpClient,
    ) {
        console.log('srvrUrl = ', this.srvrURL);
    }

    getAllCategories( clientID: string ): Observable<any> {
        const nuParamsGetCats = new HttpParams()
            .set( 'clid', clientID );

        return this.http.get( `${this.srvrURL}`, { params: nuParamsGetCats } );
    }

    getCatProds( menu: string, cat: string ): Observable<any> {
        const nuParamsCatProds = new HttpParams()
            .set( 'cl', menu )
            .set( 'Cat', cat );

        return this.http.get( `${this.srvrURL}`, { params: nuParamsCatProds } );
    }

    getSubCats( menu: string, subcat: string ): Observable<any> {
        const nuParamsSubCats = new HttpParams()
            .set( 'c', menu )
            .set( 'sC', subcat );

        return this.http.get( `${this.srvrURL}`, { params: nuParamsSubCats } );
    }

    getPromoBnr( menu: string ): Observable<any> {
        const nuParamsPromoBnr = new HttpParams()
            .set( 'pBnr', menu );

        return this.http.get(`${this.srvrURL}`, {params: nuParamsPromoBnr} );
    }

    getClientBnr( menu: string ): Observable<any> {
        const nuParamsClientBnr = new HttpParams()
            .set( 'cBnr', menu );

        return this.http.get(`${this.srvrURL}`, {params: nuParamsClientBnr} );
    }
}
