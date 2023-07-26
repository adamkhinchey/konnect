import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { EventFunctionTypes } from '../models/types';
import { environment } from '../../../../environments/environment';
import { SaveEventClass } from '../models/classes/saveEvent.class';
import { NgxSpinnerService } from 'ngx-spinner';
import { HttpClient } from '@angular/common/http';
import { HttpErrRespHandlerService } from '../../../shared/services';
import { ApiResponseModelInterface } from '../../../shared/models';
import { take, tap } from 'rxjs/operators';
import { devLogger, hideSpinnerPostApiCall } from '../../../shared/utils';
import { Company } from '../../users/models';
import {
  InviteFnCmpCntInterface,
  InviteFnCmpInterface,
  VenueTimeChangedSubjectInterface,
} from '../models/interfaces';

type FetchedVenueSrvcsCmp = {
  company: Company;
  venueIndex: number;
  serviceIndex: number;
};
type FetchedVenueSrvcCmpCnts = {
  contactList: InviteFnCmpCntInterface[];
  venueIndex: number;
  serviceIndex: number;
};

type FetchedVenueExCmp = {
  company: Company;
  venueIndex: number;
  exhibitorIndex: number;
};
type FetchedVenueExCmpCnts = {
  contactList: InviteFnCmpCntInterface[];
  venueIndex: number;
  exhibitorIndex: number;
};

@Injectable({
  providedIn: 'root',
})
export class EventService {
  public isDeleted: boolean = false;
  private _isSaveDisabled: boolean = false;
  private _isEdit: boolean = false;
  private _isNotesEdit: boolean = false;
  isSaveDisabledChange = new Subject<boolean>();
  isEditChange = new Subject<boolean>();
  isNotesEditChange = new Subject<boolean>();
  // addsupplier = new Subject<boolean>();
  set isSaveDisabled(value: boolean) {
    this._isSaveDisabled = value;
    this.isSaveDisabledChange.next(this._isSaveDisabled);
  }
  get isSaveDisabled() {
    return this._isSaveDisabled;
  }

  set isEdit(value: boolean) {
    this._isEdit = value;
    this.isEditChange.next(this._isEdit);
  }
  get isEdit() {
    return this._isEdit;
  }
  set isNotesEdit(value: boolean) {
    this._isNotesEdit = value;
    this.isNotesEditChange.next(this._isNotesEdit);
  }
  get isNotesEdit() {
    return this._isNotesEdit;
  }
  private apiBaseUrl = environment.apiBaseURL;

  private ownCompanyStatusMap = new Map<
    EventFunctionTypes,
    null | boolean | boolean[]
  >([
    [EventFunctionTypes.CLIENT, false],
    [EventFunctionTypes.EVENT_MANAGER, null],
  ]);

  public activeVenuePanelIndex: number | null = null;
  public activeServicePanel: {
    venueIndex: number;
    serviceIndex: number;
  } | null = null;
  public activeExhibitorPanel: {
    venueIndex: number;
    exhibitorIndex: number;
  } | null = null;

  setIsFnOwnCompany = new BehaviorSubject<
    Map<EventFunctionTypes, null | boolean | boolean[]>
  >(this.ownCompanyStatusMap);

  public editDetails:any="";
  letestDate = new BehaviorSubject(this.editDetails);

  supplierCompanyAddSubject = new Subject<{
    venueIndex: number;
    serviceIndex: number;
    supplierCompany: Company | InviteFnCmpInterface;
  }>();

  supplierCmpCntAddSubject = new Subject<{
    venueIndex: number;
    serviceIndex: number;
    contactList: InviteFnCmpCntInterface[];
  }>();

  exhibitorCompanyAddSubject = new Subject<{
    venueIndex: number;
    exhibitorIndex: number;
    exhibitorCompany: Company | InviteFnCmpInterface;
  }>();

  exhibitorCmpCntAddSubject = new Subject<{
    venueIndex: number;
    exhibitorIndex: number;
    contactList: InviteFnCmpCntInterface[];
  }>();

  triggerSaveOnly = new Subject();

  fetchEventFilesSubject = new Subject<number>();

  // tslint:disable-next-line:variable-name
  private _hideInfoBar = false;

  get hideInfoBar(): boolean {
    return this._hideInfoBar;
  }

  set hideInfoBar(value: boolean) {
    this._hideInfoBar = value;
  }

  venuePreEventTimeChange = new Subject<VenueTimeChangedSubjectInterface>();
  venueEventTimeChange = new Subject<VenueTimeChangedSubjectInterface>();
  venuePostEventTimeChange = new Subject<VenueTimeChangedSubjectInterface>();

  exhibitionPreEventTimeChange =
    new Subject<VenueTimeChangedSubjectInterface>();
  exhibitionEventTimeChange = new Subject<VenueTimeChangedSubjectInterface>();
  exhibitionPostEventTimeChange =
    new Subject<VenueTimeChangedSubjectInterface>();

  private fetchedVenueSrvcsCmp: FetchedVenueSrvcsCmp[] = [];
  private fetchedVenueSrvcsCmpCnts: FetchedVenueSrvcCmpCnts[] = [];

  private fetchedVenueExCmp: FetchedVenueExCmp[] = [];
  private fetchedVenueExCmpCnts: FetchedVenueExCmpCnts[] = [];

  public navigatesToSuppliers = new Subject();
  public navigatesToExhibitors = new Subject();

  constructor(
    private spinner: NgxSpinnerService,
    private http: HttpClient,
    private httpErrorHandler: HttpErrRespHandlerService
  ) {}

  resetVenueExhibitorData() {
    this.fetchedVenueExCmp = [];
    this.fetchedVenueExCmpCnts = [];
  }

  resetVenueSupplierData() {
    this.fetchedVenueSrvcsCmp = [];
    this.fetchedVenueSrvcsCmpCnts = [];
  }

  reset(): void {
    this.ownCompanyStatusMap = new Map<
      EventFunctionTypes,
      null | boolean | boolean[]
    >([
      [EventFunctionTypes.CLIENT, false],
      [EventFunctionTypes.EVENT_MANAGER, null],
    ]);
    this.setIsFnOwnCompany.next(this.ownCompanyStatusMap);
    this.activeVenuePanelIndex = null;
    this.activeServicePanel = null;
    this.activeExhibitorPanel = null;
    this.hideInfoBar = false;
    this.fetchedVenueSrvcsCmp = [];
    this.fetchedVenueSrvcsCmpCnts = [];
    this.fetchedVenueExCmp = [];
    this.fetchedVenueExCmpCnts = [];
  }

  supplierCompanyAdded(company: Company | InviteFnCmpInterface): void {
    if (
      this.activeServicePanel?.venueIndex !== undefined &&
      this.activeServicePanel?.serviceIndex !== undefined
    ) {
      this.supplierCompanyAddSubject.next({
        venueIndex: this.activeServicePanel.venueIndex,
        serviceIndex: this.activeServicePanel.serviceIndex,
        supplierCompany: company,
      });
    }
  }

  supplierContactsAdded(contactList: InviteFnCmpCntInterface[]): void {
    if (
      this.activeServicePanel?.venueIndex !== undefined &&
      this.activeServicePanel?.serviceIndex !== undefined
    ) {
      this.supplierCmpCntAddSubject.next({
        venueIndex: this.activeServicePanel.venueIndex,
        serviceIndex: this.activeServicePanel.serviceIndex,
        contactList,
      });
    }
  }

  exhibitorCompanyAdded(company: Company | InviteFnCmpInterface): void {
    if (
      this.activeExhibitorPanel?.venueIndex !== undefined &&
      this.activeExhibitorPanel?.exhibitorIndex !== undefined
    ) {
      this.exhibitorCompanyAddSubject.next({
        venueIndex: this.activeExhibitorPanel.venueIndex,
        exhibitorIndex: this.activeExhibitorPanel.exhibitorIndex,
        exhibitorCompany: company,
      });
    }
  }

  exhibitorContactsAdded(contactList: InviteFnCmpCntInterface[]): void {
    if (
      this.activeExhibitorPanel?.venueIndex !== undefined &&
      this.activeExhibitorPanel?.exhibitorIndex !== undefined
    ) {
      this.exhibitorCmpCntAddSubject.next({
        venueIndex: this.activeExhibitorPanel.venueIndex,
        exhibitorIndex: this.activeExhibitorPanel.exhibitorIndex,
        contactList,
      });
    }
  }

  addFetchedVenueSrvcCmp(param: FetchedVenueSrvcsCmp): void {
    // const find = this.fetchedVenueSrvcsCmp.find((value) => {
    //   //@ts-ignore
    //   return value.company.supplierId === param.company.supplierId && value.serviceIndex === param.serviceIndex && value.venueIndex === param.venueIndex
    // })
    // if(!find){
    this.fetchedVenueSrvcsCmp.push(param);
    // }
  }

  getFetchedVenueSrvcsCmp(): FetchedVenueSrvcsCmp[] {
    return this.fetchedVenueSrvcsCmp;
  }

  addFetchedVenueSrvcCmpCnt(param: FetchedVenueSrvcCmpCnts): void {
    this.fetchedVenueSrvcsCmpCnts.push(param);
  }

  getFetchedVenueSrvcCmpCnts(): FetchedVenueSrvcCmpCnts[] {
    return this.fetchedVenueSrvcsCmpCnts;
  }

  // for exhibitor

  addFetchedVenueExCmp(param: FetchedVenueExCmp): void {
    this.fetchedVenueExCmp.push(param);
  }

  getFetchedVenueExCmp(): FetchedVenueExCmp[] {
    return this.fetchedVenueExCmp;
  }

  addFetchedVenueExCmpCnt(param: FetchedVenueExCmpCnts): void {
    this.fetchedVenueExCmpCnts.push(param);
  }

  getFetchedVenueExCmpCnts(): FetchedVenueExCmpCnts[] {
    return this.fetchedVenueExCmpCnts;
  }

  saveToDb(event: SaveEventClass): Observable<any> {
    this.spinner.show();
    return this.http
      .post<ApiResponseModelInterface>(`${this.apiBaseUrl}/saveEvent`, {
        event,
      })
      .pipe(
        hideSpinnerPostApiCall(this.spinner),
        take(1),
        this.httpErrorHandler.processError(true, true)
      );
  }

  updateToDb(event: SaveEventClass, eventId: any): Observable<any> {
    this.spinner.show();
    return this.http
      .patch<ApiResponseModelInterface>(`${this.apiBaseUrl}/updateEvent`, {
        eventId,
        event,
      })
      .pipe(
        hideSpinnerPostApiCall(this.spinner),
        take(1),
        this.httpErrorHandler.processError(true, true)
      );
  }

  fetchEventFiles(eventID: number): Observable<ApiResponseModelInterface> {
    this.spinner.show();
    return this.http
      .get<ApiResponseModelInterface>(
        `${this.apiBaseUrl}/event/${eventID}/files`
      )
      .pipe(
        hideSpinnerPostApiCall(this.spinner),
        take(1),
        this.httpErrorHandler.processError(true, true)
      );
  }

  // importExport(data: any): Observable<any> {
  //   this.spinner.show();
  //   return this.http
  //     .post<ApiResponseModelInterface>(
  //       `${this.apiBaseUrl}/importExportServicesAndExhibitors`,
  //       data
  //     )
  //     .pipe(
  //       hideSpinnerPostApiCall(this.spinner),
  //       take(1),
  //       this.httpErrorHandler.processError(true, true)
  //     );
  // }

  importExport(data: any): Observable<any> {
    this.spinner.show();
    return this.http
      .post<ApiResponseModelInterface>(
        `${environment.importLambdaUrl}`,
        data
      )
      .pipe(
        hideSpinnerPostApiCall(this.spinner),
        take(1),
        this.httpErrorHandler.processError(true, true)
      );
  }
  deleteBucketFile(key: any): Observable<any> {
    // this.spinner.show();
    return this.http
      .post<ApiResponseModelInterface>(
        `${this.apiBaseUrl}/deleteBucketFileByKey`,
        { key }
      )
      .pipe(
        // hideSpinnerPostApiCall(this.spinner),
        take(1),
        this.httpErrorHandler.processError(true, true)
      );
  }

  giveClientPermission(data: any): Observable<any> {
    this.spinner.show();
    return this.http
      .post<ApiResponseModelInterface>(
        `${this.apiBaseUrl}/saveClientAccessPermission`,
        data
      )
      .pipe(
        hideSpinnerPostApiCall(this.spinner),
        take(1),
        this.httpErrorHandler.processError(true, true)
      );
  }

  getAssignToList(
    eventId: any,
    creatorFromCompanyId: any = 0,
    taskId: any = 0
  ): Observable<any> | any {
    if(eventId > 0){
    this.spinner.show();
    return this.http
      .post<ApiResponseModelInterface>(
        `${this.apiBaseUrl}/getTaskAssignToList`,
        { eventId, creatorFromCompanyId, taskId }
      )
      .pipe(
        hideSpinnerPostApiCall(this.spinner),
        take(1),
        this.httpErrorHandler.processError(true, true)
      );
    }
  }
  addEventTask(data: any): Observable<any> {
    this.spinner.show();
    return this.http
      .post<ApiResponseModelInterface>(`${this.apiBaseUrl}/addEventTask`, data)
      .pipe(
        hideSpinnerPostApiCall(this.spinner),
        take(1),
        this.httpErrorHandler.processError(true, true)
      );
  }

  SaveConfirmationDate(data: any,type:any,date:any,selectedCompany:any,eventId:any,sendtype:any): Observable<any> {
    
    this.spinner.show();
   
    return this.http
      .post<ApiResponseModelInterface>(`${this.apiBaseUrl}/addConfirmationDate`, {data,type,date,selectedCompany,eventId,sendtype})
      .pipe(
        hideSpinnerPostApiCall(this.spinner),
        take(1),
        this.httpErrorHandler.processError(true, true)
      );


     
  }

  
  SaveViewExhibitorDetails(selectedCompany:any,eventId:any): Observable<any> {
    
    this.spinner.show();
   
    return this.http
      .post<ApiResponseModelInterface>(`${this.apiBaseUrl}/saveViewExhibitor`, {selectedCompany,eventId})
      .pipe(
        hideSpinnerPostApiCall(this.spinner),
        take(1),
        this.httpErrorHandler.processError(true, true)
      );


     
  }

  UpdateViewExhibitorDetails(selectedCompany:any,eventId:any): Observable<any> {
    
    this.spinner.show();
   
    return this.http
      .post<ApiResponseModelInterface>(`${this.apiBaseUrl}/updateViewExhibitor`, {selectedCompany,eventId})
      .pipe(
        hideSpinnerPostApiCall(this.spinner),
        take(1),
        this.httpErrorHandler.processError(true, true)
      );


     
  }

  SaveCrerwConfirmationDate(data: any,type:any,date:any,selectedCompany:any,eventId:any,sendtype:any): Observable<any> {
    
    this.spinner.show();
   
    return this.http
      .post<ApiResponseModelInterface>(`${this.apiBaseUrl}/addCrewConfirmationDate`, {data,type,date,selectedCompany,eventId,sendtype})
      .pipe(
        hideSpinnerPostApiCall(this.spinner),
        take(1),
        this.httpErrorHandler.processError(true, true)
      );


     
  }


  GetLatestDate(type:any,selectedCompany:any,eventId:any,SendType:any): Observable<any> {
    
    this.spinner.show();
    return this.http
      .post<ApiResponseModelInterface>(`${this.apiBaseUrl}/getLetestDate`, {type,selectedCompany,eventId,SendType})
      .pipe(
        hideSpinnerPostApiCall(this.spinner),
        take(1),
        this.httpErrorHandler.processError(true, true)
      );
  }

  GetSendHistory(type:any,selectedCompany:any,eventId:any,SendType:any): Observable<any> {
    
    this.spinner.show();
    return this.http
      .post<ApiResponseModelInterface>(`${this.apiBaseUrl}/getSendHistory`, {type,selectedCompany,eventId,SendType})
      .pipe(
        hideSpinnerPostApiCall(this.spinner),
        take(1),
        this.httpErrorHandler.processError(true, true)
      );

  }

  GetViewExhibitor(selectedCompany:any,eventId:any): Observable<any> {
    
    this.spinner.show();
    return this.http
      .post<ApiResponseModelInterface>(`${this.apiBaseUrl}/getViewExhibitor`, {selectedCompany,eventId})
      .pipe(
        hideSpinnerPostApiCall(this.spinner),
        take(1),
        this.httpErrorHandler.processError(true, true)
      );

  }

  getEventTasks(data: any): Observable<any> {
    this.spinner.show();
    return this.http
      .post<ApiResponseModelInterface>(`${this.apiBaseUrl}/listEventTask`, {
        ...data,
      })
      .pipe(
        hideSpinnerPostApiCall(this.spinner),
        take(1),
        this.httpErrorHandler.processError(true, true)
      );
  }
  changeTaskStatus(data: any): Observable<any> {
    this.spinner.show();
    return this.http
      .post<ApiResponseModelInterface>(`${this.apiBaseUrl}/changeTaskStatus`, {
        ...data,
      })
      .pipe(
        hideSpinnerPostApiCall(this.spinner),
        take(1),
        this.httpErrorHandler.processError(true, true)
      );
  }
  removeTask(taskId: any): Observable<any> {
    this.spinner.show();
    return this.http
      .post<ApiResponseModelInterface>(`${this.apiBaseUrl}/deleteEventTask`, {
        taskId,
      })
      .pipe(
        hideSpinnerPostApiCall(this.spinner),
        take(1),
        this.httpErrorHandler.processError(true, true)
      );
  }
  updateTaskOrder(data: any): Observable<any> {
    this.spinner.show();
    return this.http
      .post<ApiResponseModelInterface>(
        `${this.apiBaseUrl}/updateUserTaskOrder`,
        {
          ...data,
        }
      )
      .pipe(
        hideSpinnerPostApiCall(this.spinner),
        take(1),
        this.httpErrorHandler.processError(true, true)
      );
  }
}
