import {Injectable} from '@angular/core';
import {
  HttpErrorResponse,
  HttpEvent,
  HttpEventType,
  HttpHandler,
  HttpInterceptor,
  HttpRequest
} from '@angular/common/http';

import {Observable, of, throwError} from 'rxjs';
import {AuthService} from '../services/auth.service';
import {catchError, filter, map, tap} from "rxjs/operators";
import {ActivatedRoute, NavigationEnd, Router} from "@angular/router";
import {devLogger} from "../../shared/utils";

/** Pass untouched request through to the next request handler. */
@Injectable()
export class BasicAuthInterceptor implements HttpInterceptor {

  constructor(private authService: AuthService, private router: Router, private activatedRoute: ActivatedRoute) {
    /*this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map(() => this.activatedRoute),
      map(route => {
        while (route.firstChild) {
          route = route.firstChild;
        }
        return route;
      }),
      map(route => route.url)
    ).subscribe((result) => {
      result.toPromise()
        .then((value) => {
          devLogger('log', {URLVAL: value});
        }).catch((err) => {
        devLogger('error', {interceptorRouteDetect: err});
      });
    });*/

  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.authService.getToken();
    let clonedRequest: HttpRequest<any>;
    //skip auth
    if (!req.headers.has('no-auth')) {
      clonedRequest = token ? req.clone({
        setHeaders: {Authorization: token}
      }) : req.clone();
    } else {
      const headers = req.headers.delete('no-auth');
      clonedRequest = req.clone({
        headers
      });
    }

    return next.handle(clonedRequest)
      .pipe(
        map((event: HttpEvent<any>) => {
          return event;
        }),
        catchError((httpErrorResponse: HttpErrorResponse, _: Observable<HttpEvent<any>>) => {
            if (httpErrorResponse.status === 401) {
              this.authService.redirectToLogin().then();
            }
            return throwError(httpErrorResponse);
          }
        )
      );
  }
}
