import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from "rxjs";
import { environment } from "../../../../environments/environment";
import { map, take, tap } from "rxjs/operators";
import { HttpErrRespHandlerService } from "../../../shared/services/http-err-resp-handler.service";
import {
  ApiResponseModelInterface,
  ColleagueInviteInterface,
  ConnectionType,
  CreateCompanyInterface, SearchGlobalPayload
} from '../../../shared/models';
import { AssociateToCompany, Company } from '../models';
import { camelCase, mapKeys } from 'lodash-es';
import { NgxSpinnerService } from "ngx-spinner";
import { devLogger, hideSpinnerPostApiCall } from "../../../shared/utils";

@Injectable({
  providedIn: 'root'
})
export class EventslistingService {

  apiBaseUrl = environment.apiBaseURL;

  constructor(private spinner: NgxSpinnerService, private http: HttpClient, private httpErrorHandler: HttpErrRespHandlerService) {
  }

  getEventsList(): Observable<any> {
    this.spinner.show();
    return this.http.get<ApiResponseModelInterface>(
      `${this.apiBaseUrl}/getEventList`
    ).pipe(
      hideSpinnerPostApiCall(this.spinner),
      this.httpErrorHandler.processError(),
      map(response => {
        return response.data;
      })
    );
  }
}
