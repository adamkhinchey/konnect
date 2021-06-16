import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { environment } from "../../../environments/environment";
import { Observable } from "rxjs";
import { map, take, tap } from "rxjs/operators";
import { HttpErrRespHandlerService } from "./http-err-resp-handler.service";
import { ApiResponseModelInterface } from "../models";
import { NgxSpinnerService } from "ngx-spinner";
import { hideSpinnerPostApiCall } from "../utils";

@Injectable({
  providedIn: 'root'
})
export class UserInfoService {
  apiBaseURL = environment.apiBaseURL;

  constructor(
    private http: HttpClient,
    private httpErrorHandler: HttpErrRespHandlerService,
    private spinner: NgxSpinnerService) {
  }

  getInfo(userId: any = 0): Observable<any> {
    this.spinner.show();
    return this.http.get<ApiResponseModelInterface>(`${this.apiBaseURL}/me?userId${userId}`).pipe(
      hideSpinnerPostApiCall(this.spinner),
      take(1),
      this.httpErrorHandler.processError(true, false),
      map(response => response.data?.user || null));
  }
}
