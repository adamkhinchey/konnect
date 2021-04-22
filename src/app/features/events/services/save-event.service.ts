import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable, Subject} from "rxjs";
import {EventFunctionTypes} from "../models/types";
import {environment} from "../../../../environments/environment";
import {SaveEventClass} from "../models/classes/saveEvent.class";
import {NgxSpinnerService} from "ngx-spinner";
import {HttpClient} from "@angular/common/http";
import {HttpErrRespHandlerService} from "../../../shared/services";
import {ApiResponseModelInterface} from "../../../shared/models";
import {take, tap} from "rxjs/operators";
import {hideSpinnerPostApiCall} from "../../../shared/utils";

@Injectable({
  providedIn: 'root'
})
export class SaveEventService {

  private apiBaseUrl = environment.apiBaseURL;

  private ownCompanyStatusMap = new Map<EventFunctionTypes, null | boolean | boolean[]>([
    [EventFunctionTypes.CLIENT, true],
    [EventFunctionTypes.EVENT_MANAGER, null]
  ]);

  public activeVenuePanelIndex: number | null = null;

  setIsFnOwnCompany = new BehaviorSubject<Map<EventFunctionTypes, null | boolean | boolean[]>>(this.ownCompanyStatusMap);
  triggerSaveOnly= new Subject();

  constructor(
    private spinner: NgxSpinnerService,
    private http: HttpClient,
    private httpErrorHandler: HttpErrRespHandlerService,
  ) {
  }

  saveToDb(event: SaveEventClass): Observable<any> {
    this.spinner.show();
    return this.http.post<ApiResponseModelInterface>(
      `${this.apiBaseUrl}/saveEvent`,
      {event})
      .pipe(
        hideSpinnerPostApiCall(this.spinner),
        take(1),
        this.httpErrorHandler.processError(true, false)
      );
  }
}
