import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {HttpErrRespHandlerService} from "../../../shared/services";
import {environment} from "../../../../environments/environment";
import {Observable} from "rxjs";
import {map, take} from "rxjs/operators";
import {ApiResponseModelInterface} from "../../../shared/models";

@Injectable()
export class UpdateUserProfileService {

  apiBaseUrl = environment.apiBaseURL;

  constructor(private http: HttpClient, private httpErrorHandler: HttpErrRespHandlerService) {
  }

  update(param: any): Observable<any> {
    return this.http.put<ApiResponseModelInterface>(
      `${this.apiBaseUrl}/updateUserProfile`,
      {...param}
    ).pipe(
      take(1),
      this.httpErrorHandler.processError(false),
      map(response => response?.data || null)
    );
  }

}
