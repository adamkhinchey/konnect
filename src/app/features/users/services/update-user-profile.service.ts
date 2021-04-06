import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {HttpErrRespHandlerService} from "../../../shared/services";
import {environment} from "../../../../environments/environment";
import {Observable} from "rxjs";
import {map, take, tap} from "rxjs/operators";
import {ApiResponseModelInterface} from "../../../shared/models";
import {NgxSpinnerService} from "ngx-spinner";

@Injectable()
export class UpdateUserProfileService {

  apiBaseUrl = environment.apiBaseURL;

  constructor(private spinner: NgxSpinnerService, private http: HttpClient, private httpErrorHandler: HttpErrRespHandlerService) {
  }

  update(param: any): Observable<any> {
    this.spinner.show();
    return this.http.put<ApiResponseModelInterface>(
      `${this.apiBaseUrl}/updateUserProfile`,
      {...param}
    ).pipe(
      tap(() => {
        this.spinner.hide();
      }),
      take(1),
      this.httpErrorHandler.processError(false),
      map(response => response?.data || null)
    );
  }

}
