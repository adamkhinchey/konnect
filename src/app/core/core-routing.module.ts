import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';

import {ForgotPasswordComponent, LoginComponent, ResetPasswordComponent} from './components';
import AuthGuard from './guards/authGuard';

const routes: Routes = [
  {path: 'login', component: LoginComponent, pathMatch: 'full'},
  {
    path: 'forgot-password', children: [
      {path: '', component: ForgotPasswordComponent},
      {path: 'reset/:token', component: ResetPasswordComponent, pathMatch: 'full'}
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [
    AuthGuard,
  ]
})
export class CoreRoutingModule {
}
