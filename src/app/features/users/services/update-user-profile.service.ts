import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { HttpErrRespHandlerService } from "../../../shared/services";
import { environment } from "../../../../environments/environment";
import { Observable } from "rxjs";
import { map, pluck, take, tap } from "rxjs/operators";
import { ApiResponseModelInterface, LoginUserProfile } from "../../../shared/models";
import { NgxSpinnerService } from "ngx-spinner";
import { hideSpinnerPostApiCall } from "../../../shared/utils";

@Injectable()
export class UpdateUserProfileService {

  apiBaseUrl = environment.apiBaseURL;

  constructor(private spinner: NgxSpinnerService, private http: HttpClient, private httpErrorHandler: HttpErrRespHandlerService) {
  }

  update(param: any): Observable<any> {
    this.spinner.show();
    return this.http.put<ApiResponseModelInterface>(
      `${this.apiBaseUrl}/updateUserProfile`,
      { ...param }
    ).pipe(
      hideSpinnerPostApiCall(this.spinner),
      take(1),
      this.httpErrorHandler.processError(false),
      map(response => response?.data || null)
    );
  }

  getUserDataByUid(uid: any): Observable<any> {
    this.spinner.show();
    return this.http.post<ApiResponseModelInterface>(
      `${this.apiBaseUrl}/getUserDataByUID`,
      { inviteUID: uid }
    ).pipe(
      hideSpinnerPostApiCall(this.spinner),
      take(1),
      this.httpErrorHandler.processError(false),
      pluck('data', 'user'),
      map(user => {
        if (!user) {
          throw new Error('Nondeterministic response');
        } else {
          return user as LoginUserProfile;
        }
      })
    );
  }

  // getUserDataByUid(payload: { uid: any }): Observable<any> | void {
  //   alert('payload: ' + payload);
  //   this.spinner.show();
  //   this.loginSubscription = this.http.post<LoginResponse>(
  //     `${this.apiBaseURL}/getUserDataByUID`,
  //     { inviteUID: payload }
  //   ).pipe(
  //     hideSpinnerPostApiCall(this.spinner),
  //     take(1),
  //     this.httpErrRespHandler.processError(true),
  //     pluck('data', 'user'),
  //     map(user => {
  //       if (!user) {
  //         throw new Error('Nondeterministic response');
  //       } else {
  //         return user as LoginUserProfile;
  //       }
  //     }),
  //   ).subscribe(this.loginObserver);
  // }

}
