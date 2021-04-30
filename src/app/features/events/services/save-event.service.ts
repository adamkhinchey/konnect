import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable, Subject} from 'rxjs';
import {EventFunctionTypes} from '../models/types';
import {environment} from '../../../../environments/environment';
import {SaveEventClass} from '../models/classes/saveEvent.class';
import {NgxSpinnerService} from 'ngx-spinner';
import {HttpClient} from '@angular/common/http';
import {HttpErrRespHandlerService} from '../../../shared/services';
import {ApiResponseModelInterface} from '../../../shared/models';
import {take, tap} from 'rxjs/operators';
import {devLogger, hideSpinnerPostApiCall} from '../../../shared/utils';
import {Company} from "../../users/models";
import {InviteFnCmpCntInterface, InviteFnCmpInterface} from "../models/interfaces";

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
  public activeServicePanel: { venueIndex: number, serviceIndex: number } | null = null;

  setIsFnOwnCompany = new BehaviorSubject<Map<EventFunctionTypes, null | boolean | boolean[]>>(this.ownCompanyStatusMap);

  supplierCompanyAddSubject = new Subject<{
    venueIndex: number;
    serviceIndex: number;
    supplierCompany: Company | InviteFnCmpInterface
  }>();

  supplierCmpCntAddSubject = new Subject<{
    venueIndex: number;
    serviceIndex: number;
    contactList: InviteFnCmpCntInterface[]
  }>();

  triggerSaveOnly = new Subject();


  constructor(
    private spinner: NgxSpinnerService,
    private http: HttpClient,
    private httpErrorHandler: HttpErrRespHandlerService,
  ) {
  }

  reset(): void {
    this.ownCompanyStatusMap = new Map<EventFunctionTypes, null | boolean | boolean[]>([
      [EventFunctionTypes.CLIENT, true],
      [EventFunctionTypes.EVENT_MANAGER, null]
    ]);
    this.setIsFnOwnCompany.next(this.ownCompanyStatusMap);
    this.activeVenuePanelIndex = null;
    this.activeServicePanel = null;
  }

  supplierCompanyAdded(company: Company | InviteFnCmpInterface): void {
    if (this.activeServicePanel?.venueIndex !== undefined && this.activeServicePanel?.serviceIndex !== undefined) {
      this.supplierCompanyAddSubject.next({
        venueIndex: this.activeServicePanel.venueIndex,
        serviceIndex: this.activeServicePanel.serviceIndex,
        supplierCompany: company
      });
    }
  }

  supplierContactsAdded(contactList: InviteFnCmpCntInterface[]): void {
    if (this.activeServicePanel?.venueIndex !== undefined && this.activeServicePanel?.serviceIndex !== undefined) {
      this.supplierCmpCntAddSubject.next({
        venueIndex: this.activeServicePanel.venueIndex,
        serviceIndex: this.activeServicePanel.serviceIndex,
        contactList
      });
    }
  }

  saveToDb(event: SaveEventClass): Observable<any> {
    this.spinner.show();
    return this.http.post<ApiResponseModelInterface>(
      `${this.apiBaseUrl}/saveEvent`,
      {event})
      .pipe(
        hideSpinnerPostApiCall(this.spinner),
        take(1),
        this.httpErrorHandler.processError(true, true)
      );
  }


}
