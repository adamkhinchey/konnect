import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {environment} from "../../../environments/environment";
import {Observable} from "rxjs";
import {map, take} from "rxjs/operators";
import {HttpErrRespHandlerService} from "./http-err-resp-handler.service";
import {ApiResponseModelInterface} from "../models";

@Injectable({
  providedIn: 'root'
})
export class UserInfoService {
  apiBaseURL = environment.apiBaseURL;

  constructor(private http: HttpClient, private httpErrorHandler: HttpErrRespHandlerService) {
  }

  getInfo(): Observable<any> {
    return this.http.get<ApiResponseModelInterface>(`${this.apiBaseURL}/me`).pipe(
      take(1),
      this.httpErrorHandler.processError(true, false),
      map(response => response.data?.user || null));
  }
}
