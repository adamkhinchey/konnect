import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {CoreModule} from './core/core.module';

const routes: Routes = [
  {
    path: 'login',
    loadChildren: () => import('./core/core.module').then(m => m.CoreModule)
  },
  {path: '', redirectTo: '/login', pathMatch: 'full'}
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes),
    CoreModule
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
