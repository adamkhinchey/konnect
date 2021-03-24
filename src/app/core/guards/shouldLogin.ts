import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot, UrlTree} from '@angular/router';
import {Observable} from 'rxjs';
import UserPermission from "./user-permissions.class";
import UserToken from "./user-token.class";


@Injectable()
export default class ShouldLogin implements CanActivate {
  constructor(private permission: UserPermission, private currentUser: UserToken) {
  }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    // TODO uncomment and add logic
    //return this.permission.canActivate(this.currentUser, route.params.id);
    return true
  }
}
