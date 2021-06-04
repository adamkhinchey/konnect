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
import { camelCase, mapKeys } from 'lodash-es';
import { NgxSpinnerService } from "ngx-spinner";
import { devLogger, hideSpinnerPostApiCall } from "../../../shared/utils";
@Injectable({
  providedIn: 'root'
})
export class ViewEventService {
  apiBaseUrl = environment.apiBaseURL;

  constructor(
    private http: HttpClient,
    private httpErrorHandler: HttpErrRespHandlerService,
    private spinner: NgxSpinnerService) {
  }

  getEventsByEventId(eventId: any, tabType: any): Observable<any> {
    this.spinner.show();
    return this.http.get<ApiResponseModelInterface>(
      `${this.apiBaseUrl}/getEvent?eventId=${eventId}&tabType=${tabType}`
    ).pipe(
      hideSpinnerPostApiCall(this.spinner),
      this.httpErrorHandler.processError(),
      map((response: any) => {
        return response?.data;
      })
    );
  }
  deleteEvent(eventId: any): Observable<any> {
    this.spinner.show();
    return this.http.get<ApiResponseModelInterface>(
      `${this.apiBaseUrl}/deleteMyEvent?eventId=${eventId}`
    ).pipe(
      hideSpinnerPostApiCall(this.spinner),
      this.httpErrorHandler.processError(),
      map((response: any) => {
        return response?.data;
      })
    );
  }

  removeDecline(payload: any): Observable<any> {
    this.spinner.show();
    return this.http.get<ApiResponseModelInterface>(
      `${this.apiBaseUrl}/acceptDeclineEventTabParts?eventId=${payload.eventId}&tabId=${payload.tabId}&tabType=${payload.tabType}&isAccept=${payload.isAccept}`
    ).pipe(
      hideSpinnerPostApiCall(this.spinner),
      this.httpErrorHandler.processError(),
      map((response: any) => {
        return response?.data;
      })
    );
  }

}
