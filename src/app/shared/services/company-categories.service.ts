import {Injectable} from '@angular/core';
import {environment} from '../../../environments/environment';
import {HttpClient} from '@angular/common/http';
import {HttpErrRespHandlerService} from './http-err-resp-handler.service';
import {Observable} from "rxjs";
import {ApiResponseModelInterface} from "../models";
import {map, tap} from "rxjs/operators";
import {devLogger, hideSpinnerPostApiCall} from "../utils";
import {NgxSpinnerService} from "ngx-spinner";

@Injectable()
export class CompanyCategoriesService {
  apiBaseUrl = environment.apiBaseURL;

  constructor(
    private http: HttpClient,
    private httpErrorHandler: HttpErrRespHandlerService,
    private spinner: NgxSpinnerService) {
  }

  get(): Observable<any> {
    this.spinner.show();
    return this.http.get<ApiResponseModelInterface>(`${this.apiBaseUrl}/getCategoryList`)
      .pipe(
        hideSpinnerPostApiCall(this.spinner),
        this.httpErrorHandler.processError(),
        map(response => {
          return response.data?.categoryList || [];
        })
      );
  }
}
