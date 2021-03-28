import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';

import {ForgotPasswordComponent, LoginComponent} from './components';
import ShouldLogin from './guards/shouldLogin';
import IsAuthenticated from './guards/isAuthenticated';
import UserToken from './guards/user-token.class';
import UserPermission from './guards/user-permissions.class';

const routes: Routes = [
  {path: 'login', component: LoginComponent, pathMatch: 'full'},
  {
    path: 'forgot-password', children: [
      {path: '', component: ForgotPasswordComponent}
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [
    ShouldLogin,
    IsAuthenticated,
    UserToken,
    UserPermission
  ]
})
export class CoreRoutingModule {
}
