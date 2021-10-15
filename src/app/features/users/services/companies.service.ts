import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from "rxjs";
import { environment } from "../../../../environments/environment";
import { map, pluck, take, tap } from "rxjs/operators";
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

@Injectable()
export class CompaniesService {

  apiBaseUrl = environment.apiBaseURL;

  constructor(private spinner: NgxSpinnerService, private http: HttpClient, private httpErrorHandler: HttpErrRespHandlerService) {
  }

  transformToCompanyModel(data: any): Company | null {
    return data ? mapKeys(data, (v, k) => camelCase(k)) as Company : null;
  }


  search(
    param: { domain: string | null; searchKeyword: string | null; includeMyCompanies?: boolean; includePrivate?: number },
    showSpinner = true): Observable<any> {
    if (showSpinner) {
      this.spinner.show();
    }
    return this.http.post<ApiResponseModelInterface>(
      `${this.apiBaseUrl}/searchCompany`,
      { ...param }
    ).pipe(
      hideSpinnerPostApiCall(this.spinner),
      this.httpErrorHandler.processError(),
      map((response: ApiResponseModelInterface) => (
        response ? {
          company: response?.data?.company || null,
          companyList: response?.data?.companyList || null
        } : null)),
      map((companyResponse) => {
        return {
          company: this.transformToCompanyModel(companyResponse?.company),
          companyList: companyResponse?.companyList?.map((company: any) => this.transformToCompanyModel(company))
        };
      })
    );
  }

  searchForEvent(
    param: { domain: string | null; searchKeyword: string | null; includeMyCompanies?: boolean; includePrivate?: number },
    showSpinner = true): Observable<any> {
    if (showSpinner) {
      this.spinner.show();
    }
    return this.http.post<ApiResponseModelInterface>(
      `${this.apiBaseUrl}/searchCompanyForEvent`,
      { ...param }
    ).pipe(
      hideSpinnerPostApiCall(this.spinner),
      this.httpErrorHandler.processError(),
      map((response: ApiResponseModelInterface) => (
        response ? {
          company: response?.data?.company || null,
          companyList: response?.data?.companyList || null
        } : null)),
      map((companyResponse) => {
        return {
          company: this.transformToCompanyModel(companyResponse?.company),
          companyList: companyResponse?.companyList?.map((company: any) => this.transformToCompanyModel(company))
        };
      })
    );
  }

  assignCompanyToUser(param: Partial<AssociateToCompany>): Observable<any> {
    this.spinner.show();
    return this.http.post(
      `${this.apiBaseUrl}/assignCompanyToUser`,
      { ...param }
    ).pipe(
      hideSpinnerPostApiCall(this.spinner),
      this.httpErrorHandler.processError()
    );
  }

  createCompany(param: CreateCompanyInterface): Observable<any> {
    this.spinner.show();
    return this.http.post(
      `${this.apiBaseUrl}/createCompany`,
      { ...param }
    ).pipe(
      hideSpinnerPostApiCall(this.spinner),
      take(1),
      this.httpErrorHandler.processError()
    );
  }

  dissociate(param: Partial<{ companyId: number | null, userId: number | null }>): Observable<any> {
    this.spinner.show();
    return this.http.post<ApiResponseModelInterface>(
      `${this.apiBaseUrl}/removeCompanyAssocaition`,
      { ...param }
    ).pipe(
      hideSpinnerPostApiCall(this.spinner),
      this.httpErrorHandler.processError()
    );
  }

  getCompanyColleagues(p: { companyId: number }): Observable<any> {
    this.spinner.show();
    return this.http.get<ApiResponseModelInterface>(
      `${this.apiBaseUrl}/getCompanyColleaguesWithSegregation?companyId=${p.companyId}`
    ).pipe(
      hideSpinnerPostApiCall(this.spinner),
      take(1),
      this.httpErrorHandler.processError(),
      map(response => {
        return response.data;
      })
    );
  }

  approveDeclineJoinRequest(param: { companyId: any; userId: number; status: number }): Observable<any> {
    this.spinner.show();
    return this.http.post<ApiResponseModelInterface>(
      `${this.apiBaseUrl}/approveRejectCompanyJoinRequest`,
      { ...param }
    ).pipe(
      hideSpinnerPostApiCall(this.spinner),
      take(1),
      this.httpErrorHandler.processError(true)
    );
  }

  toggleAdmin(param: { companyId: any; isAdmin: number; userId: number }): Observable<any> {
    this.spinner.show();
    return this.http.post<ApiResponseModelInterface>(
      `${this.apiBaseUrl}/makeCompanyAdmin`,
      { ...param }
    ).pipe(
      hideSpinnerPostApiCall(this.spinner),
      take(1),
      this.httpErrorHandler.processError()
    );
  }

  saveColleaguePosition(param: { companyID: any; positionArray: { colleagueID: number; value: string }[] }): Observable<any> {
    this.spinner.show();
    return this.http.post<ApiResponseModelInterface>(
      `${this.apiBaseUrl}/saveColleaguePosition`,
      { ...param }
    ).pipe(
      hideSpinnerPostApiCall(this.spinner),
      take(1),
      this.httpErrorHandler.processError()
    );
  }

  inviteColleague(param: ColleagueInviteInterface): Observable<ApiResponseModelInterface> {
    this.spinner.show();
    return this.http.post<ApiResponseModelInterface>(
      `${this.apiBaseUrl}/inviteCompanyColleague`,
      { ...param }
    ).pipe(
      hideSpinnerPostApiCall(this.spinner),
      take(1),
      this.httpErrorHandler.processError()
    );
  }

  getConnections(param: { companyId: any; entityType: ConnectionType; pageNo: number; pageSize: number }): Observable<any> {
    this.spinner.show();
    return this.http.post<ApiResponseModelInterface>(
      `${this.apiBaseUrl}/listConnection`,
      { ...param },
    ).pipe(
      hideSpinnerPostApiCall(this.spinner),
      take(1),
      this.httpErrorHandler.processError(),
      map(response => {
        switch (param.entityType) {
          case ConnectionType.USER:
            return response.data?.userConnection || [];
          case ConnectionType.COMPANY:
            return response.data?.companyConnection || [];
          default:
            return response.data || [];
        }
      }),
      map(connections => {
        return (connections as Array<any>).map(conn => {
          if (!Array.isArray(conn)) {
            conn.isConnected = true;
          }
          return conn;
        });
      }));
  }


  searchOnPlatform(param: SearchGlobalPayload): Observable<any> {
    this.spinner.show();
    return this.http.post<ApiResponseModelInterface>(
      `${this.apiBaseUrl}/searchGlobalConnection`,
      { ...param }
    ).pipe(
      hideSpinnerPostApiCall(this.spinner),
      take(1),
      this.httpErrorHandler.processError(),
      map(response => {
        switch (param.entityType) {
          case ConnectionType.USER:
            return response.data?.userConnection || [];
          case ConnectionType.COMPANY:
            return response.data?.companyConnection || [];
          default:
            return response.data || [];
        }
      }),
      map(connections => {
        return (connections as Array<any>).map(conn => {
          if (!Array.isArray(conn)) {
            conn.isConnected = false;
          }
          return conn;
        });
      })
    );
  }

  searchOnPlatformNew(param: SearchGlobalPayload): Observable<any> {
    this.spinner.show();
    return this.http.post<ApiResponseModelInterface>(
      `${this.apiBaseUrl}/searchGlobalConnectionNew`,
      { ...param }
    ).pipe(
      hideSpinnerPostApiCall(this.spinner),
      take(1),
      this.httpErrorHandler.processError(),
      map(response => {
        switch (param.entityType) {
          case ConnectionType.USER:
            return response.data?.userConnection || [];
          case ConnectionType.COMPANY:
            return response.data?.companyConnection || [];
          default:
            return response.data || [];
        }
      }),
      map(connections => {
        return (connections as Array<any>).map(conn => {
          if (!Array.isArray(conn)) {
            conn.isConnected = false;
          }
          return conn;
        });
      })
    );
  }

  searchGlobalConnectionForCollection(param: SearchGlobalPayload): Observable<any> {
    this.spinner.show();
    return this.http.post<ApiResponseModelInterface>(
      `${this.apiBaseUrl}/searchGlobalConnectionForCollection`,
      { ...param }
    ).pipe(
      hideSpinnerPostApiCall(this.spinner),
      take(1),
      this.httpErrorHandler.processError(),
      map(response => {
        switch (param.entityType) {
          case ConnectionType.USER:
            return response.data?.userConnection || [];
          case ConnectionType.COMPANY:
            return response.data?.companyConnection || [];
          default:
            return response.data || [];
        }
      }),
      map(connections => {
        return (connections as Array<any>).map(conn => {
          if (!Array.isArray(conn)) {
            conn.isConnected = false;
          }
          return conn;
        });
      })
    );
  }

  addToConnection(param: { companyId: number; connectionId: number; connectionType: ConnectionType }): Observable<any> {
    this.spinner.show();
    return this.http.post<ApiResponseModelInterface>(
      `${this.apiBaseUrl}/addConnection`,
      { ...param }
    ).pipe(
      hideSpinnerPostApiCall(this.spinner),
      take(1),
      this.httpErrorHandler.processError()
    );
  }

  deleteConnection(param: { companyId: number; connectionId: number | null; connectionType: ConnectionType }): Observable<any> {
    this.spinner.show();
    return this.http.post<ApiResponseModelInterface>(
      `${this.apiBaseUrl}/deleteConnection`,
      { ...param }
    ).pipe(
      hideSpinnerPostApiCall(this.spinner),
      take(1),
      this.httpErrorHandler.processError()
    );

  }

  searchCmpContacts(param: { companyId: number, keyword: string, isCrew: any }, showSpinner = true): Observable<any> {
    if (showSpinner) {
      this.spinner.show();
    }
    return this.http.post<ApiResponseModelInterface>(
      `${this.apiBaseUrl}/searchCompanyContactsByKeyword`,
      { ...param }
    ).pipe(
      hideSpinnerPostApiCall(this.spinner),
      take(1),
      this.httpErrorHandler.processError()
    );
  }

  getCmpContacts(param: { companyId: any, isCrew: any }, showSpinner = true): Observable<any> {
    if (showSpinner) {
      this.spinner.show();
    }
    return this.http.post<ApiResponseModelInterface>(
      `${this.apiBaseUrl}/getCompanyContacts`,
      { ...param }
    ).pipe(
      hideSpinnerPostApiCall(this.spinner),
      take(1),
      this.httpErrorHandler.processError(),
      pluck('data', 'user'),
      map(users => {
        if (users && Array.isArray(users)) {
          users = users.map((user: { userId: any; email: any; firstName: any; headline: any; lastName: any; mobile: any; position: any; profileImage: any }) => ({
            userId: user.userId,
            email: user.email,
            firstName: user.firstName,
            headline: user.headline,
            lastName: user.lastName,
            mobile: user.mobile,
            position: user.position,
            profileImage: user.profileImage,
          }));
          users.unshift({
            userId: '',
            email: '',
            firstName: 'Select Contact',
            headline: '',
            lastName: '',
            mobile: '',
            position: '',
            profileImage: '',
          });
          return users;
        } else {
          return [{
            userId: '',
            email: '',
            firstName: 'Select Contact',
            headline: '',
            lastName: '',
            mobile: '',
            position: '',
            profileImage: '',
          }];
        }
      })
    );
  }

  getCompanyDetails(companyId: number): Observable<any> {
    console.log(companyId);
    this.spinner.show();
    return this.http.get<ApiResponseModelInterface>(
      `${this.apiBaseUrl}/getCompanyProfileDetails?companyId=${companyId}`
    ).pipe(
      hideSpinnerPostApiCall(this.spinner),
      take(1),
      this.httpErrorHandler.processError(),
      map(response => {
        return response.data;
      })
    );
  }

  updateCompanyProfile(param: any): Observable<any> {
    this.spinner.show();
    return this.http.post<ApiResponseModelInterface>(
      `${this.apiBaseUrl}/updateCompanyProfile`,
      { ...param }
    ).pipe(
      hideSpinnerPostApiCall(this.spinner),
      take(1),
      this.httpErrorHandler.processError()
    );
  }

  getCategoryList(): Observable<any> {
    this.spinner.show();
    return this.http.get<ApiResponseModelInterface>(
      `${this.apiBaseUrl}/getCategoryList`
    ).pipe(
      hideSpinnerPostApiCall(this.spinner),
      this.httpErrorHandler.processError(),
      map(response => {
        return response.data;
      })
    );
  }

  checkDomain(param: { companyId: any, userId: any }, showSpinner = true): Observable<any> {
    if (showSpinner) {
      this.spinner.show();
    }
    return this.http.post<ApiResponseModelInterface>(
      `${this.apiBaseUrl}/checkUserCompanyDomain`,
      { ...param }
    ).pipe(
      hideSpinnerPostApiCall(this.spinner),
      take(1),
      this.httpErrorHandler.processError()
    );
  }

}
