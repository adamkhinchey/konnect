import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree} from '@angular/router';
import {Observable} from 'rxjs';
import UserToken from "./user-token.class";
import UserPermission from "./user-permissions.class";


@Injectable()
export default class IsAuthenticated implements CanActivate {
  constructor(private permission: UserPermission, private currentUser: UserToken, private router: Router) {
  }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this.router.parseUrl('/login');
    //return this.permission.canActivate(this.currentUser, route.params.id);
  }
}
