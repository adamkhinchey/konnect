import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';

import {ForgotPasswordComponent, LoginComponent, ResetPasswordComponent} from './components';
import AuthGuard from './guards/authGuard';
import LoginGuard from "./guards/loginGuard";

const routes: Routes = [
  {path: 'login', component: LoginComponent, pathMatch: 'full', canActivate: [LoginGuard]},
  {
    path: 'forgot-password', children: [
      {path: '', component: ForgotPasswordComponent},
      {path: 'reset/:token', component: ResetPasswordComponent, pathMatch: 'full'}
    ],
    canActivate: [LoginGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [
    AuthGuard,
    LoginGuard
  ]
})
export class CoreRoutingModule {
}
