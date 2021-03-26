import {NgModule} from '@angular/core';
import {PreloadAllModules, RouterModule, Routes} from '@angular/router';
import {CoreModule} from './core/core.module';
import {FeaturesModule} from './features/features.module';

const routes: Routes = [
  {
    path: 'login',
    loadChildren: () => import('./core/core.module').then(m => m.CoreModule),
  },
  {
    path: 'create-konnect-profile',
    loadChildren: () => import('./features/features.module').then(m => m.FeaturesModule),
  },
  {
    path: '**',
    redirectTo: '/login'
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {preloadingStrategy: PreloadAllModules}),
    CoreModule,
    FeaturesModule
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
