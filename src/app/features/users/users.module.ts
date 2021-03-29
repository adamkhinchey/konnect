import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {UsersRoutingModule} from './users-routing.module';
import {CreateIndividualProfileComponent} from './components/create-individual-profile/create-individual-profile.component';
import {PersonalDetailsTabComponent} from './components/personal-details-tab/personal-details-tab.component';
import {CompanyDetailsTabComponent} from './components/company-details-tab/company-details-tab.component';
import {NgWizardModule} from 'ng-wizard';
import {ReactiveFormsModule} from '@angular/forms';
import {CompaniesService} from './services/companies.service';
import { CompanyClaimCardComponent } from './components/company-claim-card/company-claim-card.component';
import {SharedModule} from "../../shared/shared.module";


@NgModule({
  declarations: [
    CreateIndividualProfileComponent,
    PersonalDetailsTabComponent,
    CompanyDetailsTabComponent,
    CompanyClaimCardComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    UsersRoutingModule,
    NgWizardModule,
    SharedModule,
  ],
  providers: [
    CompaniesService
  ]
})
export class UsersModule {
}
