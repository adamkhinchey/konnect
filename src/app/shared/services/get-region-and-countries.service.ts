import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { HttpErrRespHandlerService } from './http-err-resp-handler.service';
import { map, pluck, tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { NgxSpinnerService } from "ngx-spinner";
import { hideSpinnerPostApiCall } from "../utils";

@Injectable()
export class GetRegionAndCountriesService {

  private apiBaseURL = environment.apiBaseURL;

  constructor(
    private http: HttpClient,
    private httpErrRespHandler: HttpErrRespHandlerService,
    private spinner: NgxSpinnerService) {
  }

  getAllCountriesOnly(): Observable<{ val: any; name: any; regionId: any; }[]> {
    this.spinner.show();
    return this.http.get<any>(`${this.apiBaseURL}/getRegionAndCountryList`, {
      params: new HttpParams().set('regionId', '0')
    }).pipe(
      hideSpinnerPostApiCall(this.spinner),
      this.httpErrRespHandler.processError(false),
      pluck('data', 'countryList'),
      map(countryList => {
        if (countryList && Array.isArray(countryList)) {
          countryList = countryList.map((country: { id: any; name: any; regionId: any; }) => ({
            val: country.id,
            name: country.name,
            regionId: country.regionId
          }));
          countryList.unshift({ val: '', name: 'Select Country', regionId: '' });
          return countryList;
        } else {
          return [{ val: '', name: 'Select Country', regionId: '' }];
        }
      })
    );
  }

  getAllRegionsOnly(): Observable<{ val: any; name: any; regionId: any; }[]> {
    this.spinner.show();
    return this.http.get<any>(`${this.apiBaseURL}/getRegionAndCountryList`, {
      params: new HttpParams().set('regionId', '0')
    }).pipe(
      hideSpinnerPostApiCall(this.spinner),
      this.httpErrRespHandler.processError(false),
      pluck('data', 'regionList'),
      map(regionList => {
        if (regionList && Array.isArray(regionList)) {
          regionList = regionList.map((region: { id: any; name: any; }) => ({
            id: region.id,
            name: region.name,
          }));
          // regionList.unshift({ id: '', name: 'Select Region' });
          return regionList;
        } else {
          return [];
        }
      })
    );
  }

}
