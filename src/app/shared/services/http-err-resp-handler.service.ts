import {Injectable} from '@angular/core';
import {HttpErrorResponse} from '@angular/common/http';
import {Observable, of, OperatorFunction, throwError} from 'rxjs';
import {ToastrService} from 'ngx-toastr';
import {devLogger} from '../utils';
import {catchError} from 'rxjs/operators';
import {AuthService} from "../../core/services/auth.service";

@Injectable()
export class HttpErrRespHandlerService {

  constructor(public toaster: ToastrService) {
  }

  processError<T>(rethrow = false, showAlert = true): OperatorFunction<T, T> {
    return catchError((err, caught) => this.handleError(err, caught, rethrow, showAlert));
  }

  handleError<T>(error: HttpErrorResponse, caught: Observable<T>, rethrow = false, showAlert = true): Observable<never | any> {
    devLogger('error', {error});
    const errorMessage = error.error.message ? error.error.message : 'Something Went wrong!';
    if (showAlert) {
      this.toaster.error(errorMessage);
    }
    if (rethrow) {
      return throwError(error);
    }
    return of(null);
  }

}
