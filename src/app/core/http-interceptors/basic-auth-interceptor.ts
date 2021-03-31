import {Injectable} from '@angular/core';
import {
  HttpErrorResponse,
  HttpEvent,
  HttpEventType,
  HttpHandler,
  HttpInterceptor,
  HttpRequest
} from '@angular/common/http';

import {Observable, throwError} from 'rxjs';
import {AuthService} from '../services/auth.service';
import {catchError, map, tap} from "rxjs/operators";
import {Router} from "@angular/router";
import {devLogger} from "../../shared/utils";

/** Pass untouched request through to the next request handler. */
@Injectable()
export class BasicAuthInterceptor implements HttpInterceptor {

  constructor(private authService: AuthService, private router: Router) {
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const clonedRequest = req.clone({
      setHeaders: {Authorization: this.authService.getToken()}
    });
    
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
