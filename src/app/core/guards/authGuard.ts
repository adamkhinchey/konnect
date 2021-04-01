import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree} from '@angular/router';
import {Observable} from 'rxjs';
import {AuthService} from '../services/auth.service';
import {UserInfoService} from "../../shared/services";
import {devLogger} from "../../shared/utils";


@Injectable()
export default class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private userInfoService: UserInfoService,
    private router: Router) {
  }

  async canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): /*Observable<boolean | UrlTree> | */Promise<boolean> /*| UrlTree> | boolean | UrlTree*/ {
    try {
      const user = await this.userInfoService.getInfo().toPromise();
      if (user) {
        this.authService.setUserInfo(user);
        devLogger('log', {me: user});
        return true;
      } else {
        await this.router.navigate(['login']);
        return false;
      }
    } catch (err) {
      devLogger('error', err);
      await this.router.navigate(['login']);
      return false;
    }
    //return this.permission.canActivate(this.currentUser, route.params.id);
  }
}
