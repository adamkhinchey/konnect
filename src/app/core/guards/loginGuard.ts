import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree} from '@angular/router';
import {Observable} from 'rxjs';
import {AuthService} from '../services/auth.service';
import {UserInfoService} from "../../shared/services";
import {devLogger} from "../../shared/utils";


@Injectable()
export default class LoginGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private userInfoService: UserInfoService,
    private router: Router) {
  }

  async canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): /*Observable<boolean | UrlTree> | */Promise<boolean> /*| UrlTree> | boolean | UrlTree*/ {
    if (this.authService.getToken()) {
      this.router.navigate(['home', 'edit-profile']);
      return false;
    }
    return true;
  }
}
