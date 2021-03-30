import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {SharedRoutingModule} from './shared-routing.module';
import {HttpClientModule} from '@angular/common/http';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {ToastrModule} from 'ngx-toastr';
import {CompanySearchComponent} from './components/company-search/company-search.component';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {CreateCompanyComponent} from './components/create-company/create-company.component';
import {GetRegionAndCountriesService, HttpErrRespHandlerService} from "./services";
import {NgMultiSelectDropDownModule} from "ng-multiselect-dropdown";


@NgModule({
  declarations: [CompanySearchComponent, CreateCompanyComponent],
  imports: [
    CommonModule,
    BrowserAnimationsModule,
    ToastrModule.forRoot({timeOut: 3000}),
    NgMultiSelectDropDownModule,
    SharedRoutingModule,
    HttpClientModule,
    ReactiveFormsModule,
    FormsModule,
  ],
  exports: [
    CompanySearchComponent,
    CreateCompanyComponent
  ],
  providers: [
    GetRegionAndCountriesService,
    HttpErrRespHandlerService
  ]
})
export class SharedModule {
}
