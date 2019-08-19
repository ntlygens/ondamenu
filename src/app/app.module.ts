import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';

import { CoreFuncModule } from './core-func/core-func.module';
import { NgMatModule } from './ng-mat/ng-mat.module';

import { IntroModule } from './intro/intro.module';

import { AppComponent } from './app.component';
// import { SplashComponent } from './intro/splash/splash.component';

@NgModule({
  declarations: [
    AppComponent,
    // plashComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    RouterModule,
    HttpClientModule,

    AppRoutingModule,
    CoreFuncModule,
    NgMatModule,
    IntroModule,

  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
