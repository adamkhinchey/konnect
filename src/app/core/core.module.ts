import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CoreRoutingModule } from './core-routing.module';
import {httpInterceptorProviders} from './http-interceptors';


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    CoreRoutingModule
  ],
  providers: [
   httpInterceptorProviders
  ]
})
export class CoreModule { }
