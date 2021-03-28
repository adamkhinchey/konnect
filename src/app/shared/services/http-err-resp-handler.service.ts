import {Injectable} from '@angular/core';
import {SharedModule} from '../shared.module';
import {HttpErrorResponse} from '@angular/common/http';
import {Observable, of, throwError} from 'rxjs';

@Injectable({
  providedIn: SharedModule
})
export class HttpErrRespHandlerService {

  constructor() {
  }

  handleError(error: HttpErrorResponse): Observable<never>{
    let errorMessage = 'Unknown error!';
    if (error.error instanceof ErrorEvent) {
      // Client-side errors
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side errors
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    return throwError(of([]));
  }

}
