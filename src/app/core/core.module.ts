import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {CoreRoutingModule} from './core-routing.module';
import {httpInterceptorProviders} from './http-interceptors';
import {
  LoginComponent,
  ForgotPasswordComponent,
  HeaderComponent,
  FooterComponent,
  BodyComponent,
} from './components';
import {HttpClientModule} from "@angular/common/http";

@NgModule({
  declarations: [
    ForgotPasswordComponent,
    HeaderComponent,
    FooterComponent,
    BodyComponent,
    LoginComponent
  ],
  imports: [
    CommonModule,
    HttpClientModule,
    CoreRoutingModule,
  ],
  providers: [
    httpInterceptorProviders
  ],
  exports: [
    BodyComponent,
    FooterComponent,
    HeaderComponent
  ]
})
export class CoreModule {
}
