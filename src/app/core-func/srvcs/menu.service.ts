import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})

export class MenuService {
    private srvrURL = 'https://ondamenu.com/php/';
    constructor(
        private http: HttpClient,
    ) {
        // console.log('srvrUrl = ', this.srvrURL);
    }

    async getAllCategories( clientID: string ) {
        const nuParamsGetCats = new HttpParams()
            .set( 'clid', clientID );

        const allCats = this.http.get( `${this.srvrURL}`, { params: nuParamsGetCats } ).toPromise();
        if (!allCats) { return; }
        return allCats;
    }

    async getCatProds( client: string, cat: string ) {
        const nuParamsCatProds = new HttpParams()
            .set( 'cl', client )
            .set( 'Cat', cat );

        const catProds = await this.http.get( `${this.srvrURL}`, { params: nuParamsCatProds }).toPromise();
        if (!catProds) { return; }
        return catProds;
    }

    async getSubCats( client: string, subcat: string ) {
        const nuParamsSubCats = new HttpParams()
            .set( 'c', client )
            .set( 'sC', subcat );

        const subCats = this.http.get( `${this.srvrURL}`, { params: nuParamsSubCats } ).toPromise();
        if ( !subCats ) { return; }
        return subCats;
    }

    getPromoBnr( client: string ): Observable<any> {
        const nuParamsPromoBnr = new HttpParams()
            .set( 'pBnr', client );

        return this.http.get(`${this.srvrURL}`, {params: nuParamsPromoBnr} );
    }

    getClientBnr( client: string ): Observable<any> {
        const nuParamsClientBnr = new HttpParams()
            .set( 'cBnr', client );

        return this.http.get(`${this.srvrURL}`, {params: nuParamsClientBnr} );
    }
}
