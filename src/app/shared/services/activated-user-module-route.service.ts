import {Injectable} from '@angular/core';
import {ActivatedRoute} from "@angular/router";

@Injectable({
  providedIn: 'root'
})
export class ActivatedUserModuleRouteService {
  userModuleRoute: ActivatedRoute = this.route;

  constructor(private route: ActivatedRoute) {
  }

  setRoute(route: ActivatedRoute): void {
    this.userModuleRoute = route;
  }
}
