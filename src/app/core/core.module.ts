import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CoreRoutingModule } from './core-routing.module';
import {httpInterceptorProviders} from './http-interceptors';
import { LoginComponent } from './components/login/login.component';
import { ForgotPasswordComponent } from './components/forgot-password/forgot-password.component';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { BodyComponent } from './components/body/body.component';
import { LayoutComponent } from './components/layout/layout.component';

@NgModule({
  declarations: [LoginComponent, ForgotPasswordComponent, HeaderComponent, FooterComponent, BodyComponent, LayoutComponent],
  imports: [
    CommonModule,
    CoreRoutingModule
  ],
  providers: [
   httpInterceptorProviders
  ]
})
export class CoreModule { }
