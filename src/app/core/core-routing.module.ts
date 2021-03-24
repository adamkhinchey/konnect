import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';

import {LoginComponent} from './components';
import ShouldLogin from './guards/shouldLogin';
import IsAuthenticated from "./guards/isAuthenticated";
import UserToken from "./guards/user-token.class";
import UserPermission from './guards/user-permissions.class';

const routes: Routes = [
  {path: 'login', component: LoginComponent, pathMatch: 'full'},
  {path: '**', redirectTo: '/login'},
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
