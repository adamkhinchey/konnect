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
import {HttpClientModule} from '@angular/common/http';
import {ReactiveFormsModule} from '@angular/forms';
import { ResetPasswordComponent } from './components/reset-password/reset-password.component';
import {SharedModule} from "../shared/shared.module";

@NgModule({
  declarations: [
    ForgotPasswordComponent,
    HeaderComponent,
    FooterComponent,
    BodyComponent,
    LoginComponent,
    ResetPasswordComponent
  ],
  imports: [
    CommonModule,
    HttpClientModule,
    CoreRoutingModule,
    ReactiveFormsModule,
    SharedModule
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
