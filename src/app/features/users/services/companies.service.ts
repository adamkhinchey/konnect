import {Injectable} from '@angular/core';
import {UsersModule} from '../users.module';
import {HttpClient} from '@angular/common/http';
import {Observable} from "rxjs";
import {environment} from "../../../../environments/environment";
import {catchError, map, take} from "rxjs/operators";
import {HttpErrRespHandlerService} from "../../../shared/services/http-err-resp-handler.service";
import {ApiResponseModelInterface, CreateCompanyInterface} from '../../../shared/models';
import {AssociateToCompany, Company} from '../models';
import {camelCase, mapKeys} from 'lodash-es';

@Injectable()
export class CompaniesService {

  apiBaseUrl = environment.apiBaseURL;

  constructor(private http: HttpClient, private httpErrorHandler: HttpErrRespHandlerService) {
  }

  transformToCompanyModel(data: any): Company | null {
    return data ? mapKeys(data, (v, k) => camelCase(k)) as Company : null;
  }

  search(param: { domain: string | null; searchKeyword: string | null }): Observable<any> {
    return this.http.post<ApiResponseModelInterface>(
      `${this.apiBaseUrl}/searchCompany`,
      {...param}
    ).pipe(
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
    return this.http.post(
      `${this.apiBaseUrl}/assignCompanyToUser`,
      {...param}
    ).pipe(
      this.httpErrorHandler.processError()
    );
  }

  createCompany(param: CreateCompanyInterface): Observable<any> {
    return this.http.post(
      `${this.apiBaseUrl}/createCompany`,
      {...param}
    ).pipe(
      take(1),
      this.httpErrorHandler.processError()
    );
  }

  dissociate(companyIdToDissociate: number | null): Observable<any> {
    return this.http.post<ApiResponseModelInterface>(
      `${this.apiBaseUrl}/removeCompanyAssocaition`,
      {companyId: companyIdToDissociate}
    ).pipe(
      this.httpErrorHandler.processError()
    );
  }
}
