import {Injectable} from '@angular/core';
import {environment} from '../../../environments/environment';
import {HttpClient} from '@angular/common/http';
import {HttpErrRespHandlerService} from './http-err-resp-handler.service';
import {Observable} from "rxjs";
import {ApiResponseModelInterface} from "../models";
import {map} from "rxjs/operators";
import {devLogger} from "../utils";

@Injectable()
export class CompanyCategoriesService {
  apiBaseUrl = environment.apiBaseURL;

  constructor(private http: HttpClient, private httpErrorHandler: HttpErrRespHandlerService) {
  }

  get(): Observable<any> {
    return this.http.get<ApiResponseModelInterface>(`${this.apiBaseUrl}/getCategoryList`)
      .pipe(
        this.httpErrorHandler.processError(),
        map(response => {
          return response.data?.categoryList || [];
        })
      );
  }
}
