import {CUSTOM_ELEMENTS_SCHEMA, NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {UsersRoutingModule} from './users-routing.module';
import {CreateIndividualProfileComponent} from './components/create-individual-profile/create-individual-profile.component';
import {PersonalDetailsTabComponent} from './components/personal-details-tab/personal-details-tab.component';
import {CompanyDetailsTabComponent} from './components/company-details-tab/company-details-tab.component';
import {NgWizardModule} from 'ng-wizard';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {CompaniesService} from './services/companies.service';
import { CompanyClaimCardComponent } from './components/company-claim-card/company-claim-card.component';
import {SharedModule} from "../../shared/shared.module";
import { EditIndividualProfileComponent } from './components/edit-individual-profile/edit-individual-profile.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import {UpdateUserProfileService} from "./services/update-user-profile.service";
import { ManageColleaguesComponent } from './components/manage-colleagues/manage-colleagues.component';
import { ManageConnectionsComponent } from './components/manage-connections/manage-connections.component';
import {NgbNavModule} from "@ng-bootstrap/ng-bootstrap";
import {FontAwesomeModule} from "@fortawesome/angular-fontawesome";
import { EventsListingsComponent } from './components/events-listings/events-listings.component';
import { IgxCalendarModule, IgxSnackbarModule } from 'igniteui-angular';
import { HammerModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';


@NgModule({
  declarations: [
    CreateIndividualProfileComponent,
    PersonalDetailsTabComponent,
    CompanyDetailsTabComponent,
    CompanyClaimCardComponent,
    EditIndividualProfileComponent,
    DashboardComponent,
    ManageColleaguesComponent,
    ManageConnectionsComponent,
    EventsListingsComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    UsersRoutingModule,
    NgWizardModule,
    SharedModule,
    FormsModule,
    NgbNavModule,
    FontAwesomeModule,
    IgxCalendarModule,
    IgxSnackbarModule,
    HammerModule,
    BrowserAnimationsModule
  ],
  exports: [
    DashboardComponent
  ],
  providers: [
    CompaniesService,
    UpdateUserProfileService
  ],
  schemas:[CUSTOM_ELEMENTS_SCHEMA]
})
export class UsersModule {
}
