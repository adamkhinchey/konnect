import {Injectable} from '@angular/core';
import {SharedModule} from '../shared.module';
import {HttpClient, HttpParams} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {HttpErrRespHandlerService} from './http-err-resp-handler.service';
import {catchError, map, pluck} from 'rxjs/operators';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: SharedModule
})
export class GetRegionAndCountriesService {

  private apiBaseURL = environment.apiBaseURL;

  constructor(private http: HttpClient, private httpErrRespHandler: HttpErrRespHandlerService) {
  }

  getAllCountriesOnly(): Observable<{ val: any; name: any; regionId: any; }[]> {
    return this.http.get<any>(`${this.apiBaseURL}/getRegionAndCountryList`, {
      params: new HttpParams().set('regionId', '0')
    }).pipe(
      catchError(this.httpErrRespHandler.handleError),
      pluck('data', 'countryList'),
      map(countryList => {
        console.log(countryList);
        if (countryList && Array.isArray(countryList)) {
          countryList = countryList.map((country: { id: any; name: any; regionId: any; }) => ({
            val: country.id,
            name: country.name,
            regionId: country.regionId
          }));
          countryList.unshift({val: '', name: 'Select Country', regionId: ''});
          return countryList;
        } else {
          return [{val: '', name: 'Select Country', regionId: ''}];
        }
      })
    );
  }
}
