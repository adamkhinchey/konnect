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

  constructor(private toaster: ToastrService) {
  }

  handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Unknown error!';
    devLogger('error', error);
    if (error.error instanceof ErrorEvent) {
      // Client-side errors
      errorMessage = `Error: ${error.error.message}`;
      this.toaster.error(errorMessage);
    } else {
      // Server-side errors
      console.error(error.status);
      errorMessage = `Error: ${error.message}`;
      this.toaster.error(errorMessage);
    }

    return throwError(of([]));
  }

}
