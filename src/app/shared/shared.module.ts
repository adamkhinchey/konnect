import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {SharedRoutingModule} from './shared-routing.module';
import {HttpClientModule} from '@angular/common/http';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {ToastrModule} from 'ngx-toastr';
import {CompanySearchComponent} from './components/company-search/company-search.component';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {CreateCompanyComponent} from './components/create-company/create-company.component';
import {CompanyCategoriesService, GetRegionAndCountriesService, HttpErrRespHandlerService} from "./services";
import {NgMultiSelectDropDownModule} from "ng-multiselect-dropdown";
import {RemoveModalComponent} from './components/modals/remove-modal/remove-modal.component';
import {FileUploadComponent} from './components/file-upload/file-upload.component';
import {FileUploadTriggerDirective} from "./directives/file-upload-trigger-directive";
import { SafeUrlPipePipe } from './pipes/safe-url-pipe.pipe';
import { SortPipe } from './pipes/sort.pipe';
import { InviteColleaguesComponent } from './components/modals/invite-colleagues/invite-colleagues.component';
import { WaitingForApprovalComponent } from './components/waiting-for-approval/waiting-for-approval.component';
import { ImageFallbackDirective } from './directives/image-fallback.directive';
import { DateFilterPipe } from './pipes/dateFilter.pipe';
import { ConfirmationDialogComponent } from './components/confirmation-dialog/confirmation-dialog.component';
import { AngularEditorModule } from '@kolkov/angular-editor';
import { ImportExportComponent } from './components/import-export/import-export.component';
import { ClientAccessComponent } from './components/client-access/client-access.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AddTaskComponent } from './components/add-task/add-task.component';

@NgModule({
  declarations: [
    CompanySearchComponent,
    CreateCompanyComponent,
    RemoveModalComponent,
    FileUploadComponent,
    FileUploadTriggerDirective,
    SafeUrlPipePipe,
    SortPipe,
    DateFilterPipe,
    InviteColleaguesComponent,
    WaitingForApprovalComponent,
    ImageFallbackDirective,
    ConfirmationDialogComponent,
    ImportExportComponent,
    ClientAccessComponent,
    AddTaskComponent,
   ],
  imports: [
    CommonModule,
    ToastrModule.forRoot({timeOut: 3000}),
    NgMultiSelectDropDownModule,
    SharedRoutingModule,
    HttpClientModule,
    ReactiveFormsModule,
    FormsModule,
    AngularEditorModule,
    NgbModule
  ],
  exports: [
    CompanySearchComponent,
    CreateCompanyComponent,
    RemoveModalComponent,
    FileUploadComponent,
    FileUploadTriggerDirective,
    SafeUrlPipePipe,
    SortPipe,
    DateFilterPipe,
    InviteColleaguesComponent,
    WaitingForApprovalComponent,
    ImageFallbackDirective,
    ImportExportComponent,
    ClientAccessComponent
  ],
  providers: [
    GetRegionAndCountriesService,
    HttpErrRespHandlerService,
    CompanyCategoriesService
  ]
})
export class SharedModule {
}
