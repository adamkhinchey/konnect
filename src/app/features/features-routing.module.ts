import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {UsersModule} from './users/users.module';

const routes: Routes = [
  {
    path: 'create-konnect-profile',
    loadChildren: () => import('./users/users.module').then(m => m.UsersModule), pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes), UsersModule],
  exports: [RouterModule]
})
export class FeaturesRoutingModule {
}
