import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UsersRoutingModule } from './users-routing.module';
import { CreateIndividualProfileComponent } from './components/create-individual-profile/create-individual-profile.component';
import { PersonalDetailsTabComponent } from './components/personal-details-tab/personal-details-tab.component';
import { CompanyDetailsTabComponent } from './components/company-details-tab/company-details-tab.component';


@NgModule({
  declarations: [
    CreateIndividualProfileComponent,
    PersonalDetailsTabComponent,
    CompanyDetailsTabComponent,
  ],
  imports: [
    CommonModule,
    UsersRoutingModule
  ]
})
export class UsersModule { }
