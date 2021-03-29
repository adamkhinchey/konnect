import {Injectable} from '@angular/core';
import {SharedModule} from '../shared.module';
import {HttpErrorResponse} from '@angular/common/http';
import {Observable, of, OperatorFunction, throwError} from 'rxjs';
import {ToastrService} from 'ngx-toastr';
import {devLogger} from '../utils';
import {catchError} from 'rxjs/operators';

@Injectable({
  providedIn: SharedModule
})
export class HttpErrRespHandlerService {

  constructor(public toaster: ToastrService) {
  }

  processError<T>(rethrow = false): OperatorFunction<T, T> {
    return catchError((err, caught) => this.handleError(err, caught, rethrow));
  }

  handleError<T>(error: HttpErrorResponse, caught: Observable<T>, rethrow = false): Observable<never | any> {
    devLogger('error', {error});
    const errorMessage = error.error.message ? error.error.message : 'Something Went wrong!';
    this.toaster.error(errorMessage);
    if (rethrow) {
      return throwError(error);
    }
    return of(null);
  }

}
