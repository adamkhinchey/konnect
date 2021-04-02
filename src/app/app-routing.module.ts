import {NgModule} from '@angular/core';
import {PreloadAllModules, RouterModule, Routes} from '@angular/router';
import {CoreModule} from './core/core.module';
import {UsersModule} from "./features/users/users.module";
import AuthGuard from "./core/guards/authGuard";

const routes: Routes = [
  {
    path: 'login',
    loadChildren: () => import('./core/core.module').then(m => m.CoreModule),
  },
  {
    path: 'create-konnect-profile',
    loadChildren: () => import('./features/users/users.module').then(m => m.UsersModule),
  },
  {
    path: 'home',
    pathMatch: 'full',
    children: [{
      path: 'edit-profile',
      loadChildren: () => import('./features/users/users.module').then(m => m.UsersModule),
      pathMatch: 'full'
    }]
  },
  {
    path: 'home',
    /* children: [
     {
       path: 'edit-profile',*/
    loadChildren: () => import('./features/users/users.module').then(m => m.UsersModule),
    /* }
   ]*/
  },
  {
    path: '**',
    redirectTo: '/home',
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {preloadingStrategy: PreloadAllModules}),
    CoreModule,
    UsersModule
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
