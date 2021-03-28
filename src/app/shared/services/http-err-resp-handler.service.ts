import {Injectable} from '@angular/core';
import {SharedModule} from '../shared.module';
import {HttpErrorResponse} from '@angular/common/http';
import {Observable, of, throwError} from 'rxjs';
import {ToastrService} from 'ngx-toastr';
import {devLogger} from '../utils';

@Injectable({
  providedIn: SharedModule
})
export class HttpErrRespHandlerService {

  constructor(public toaster: ToastrService) {
  }

  handleError(error: HttpErrorResponse, caught: Observable<any>): Observable<never> {
    let errorMessage = 'Unknown error!';
    errorMessage = `Error: ${error.error.message}`;
    this.toaster.error(errorMessage);
    return throwError(of([]));
  }

}
