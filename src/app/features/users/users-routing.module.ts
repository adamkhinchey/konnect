import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {CreateIndividualProfileComponent} from './components/create-individual-profile/create-individual-profile.component';
import AuthGuard from "../../core/guards/authGuard";
import {DashboardComponent} from "./components/dashboard/dashboard.component";
import {EditIndividualProfileComponent} from "./components/edit-individual-profile/edit-individual-profile.component";
import {ManageColleaguesComponent} from "./components/manage-colleagues/manage-colleagues.component";

const routes: Routes = [
  {
    path: 'create-konnect-profile',
    component: CreateIndividualProfileComponent,
    pathMatch: 'full',
  },
  {
    path: 'home',
    component: DashboardComponent,
    children: [
      {path: 'edit-profile', component: EditIndividualProfileComponent},
      {
        path: 'company', children: [
          {path: 'manage-colleagues', component: ManageColleaguesComponent}
        ]
      }
    ],
    canActivate: [AuthGuard]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UsersRoutingModule {
}
