import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {CreateIndividualProfileComponent} from './components/create-individual-profile/create-individual-profile.component';

const routes: Routes = [
  {path: 'create-konnect-profile', component: CreateIndividualProfileComponent, pathMatch: 'full'}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UsersRoutingModule {
}
