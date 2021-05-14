import {Injectable} from '@angular/core';
import {Observable, Subject} from "rxjs";
import {environment} from "../../../../environments/environment";
import {ApiResponseModelInterface} from "../../../shared/models";
import {hideSpinnerPostApiCall} from "../../../shared/utils";
import {map, take} from "rxjs/operators";
import {NgxSpinnerService} from "ngx-spinner";
import {HttpClient, HttpParams} from "@angular/common/http";
import {HttpErrRespHandlerService} from "../../../shared/services";

@Injectable({
  providedIn: 'root'
})
export class EventTimelineService {
  private apiBaseUrl = environment.apiBaseURL;
  render = new Subject<any>();

  constructor(
    private spinner: NgxSpinnerService,
    private http: HttpClient,
    private httpErrorHandler: HttpErrRespHandlerService
  ) {
  }

  fetchEventVenues(eventID: number): Observable<{ venueId: number; venueName: string; }[]> {
    this.spinner.show();
    return this.http.get<ApiResponseModelInterface>(
      `${this.apiBaseUrl}/getEvent?eventId=${eventID}&tabType=3`)
      .pipe(
        hideSpinnerPostApiCall(this.spinner),
        take(1),
        this.httpErrorHandler.processError(true, false),
        map((response) => {
          const venues = response?.data.eventData?.venues || [];
          return Array.isArray(venues) ? venues.map(venue => {
            return {venueId: venue.venueId, venueName: venue.venueCompanyName + ', ' + venue.companyCity};
          }) : [];
        })
      );
  }

  fetchServicesTimelineData(eventId: number | null, activeVenueId: number | undefined): Observable<ApiResponseModelInterface> {
    this.spinner.show();
    return this.http.get<ApiResponseModelInterface>(
      `${this.apiBaseUrl}/event/${eventId}/venue/${activeVenueId}/timeline?type=services`
    ).pipe(
      hideSpinnerPostApiCall(this.spinner),
      take(1),
      this.httpErrorHandler.processError(true, false)
    );
  }

  fetchExhibitorsTimelineData(eventId: number | null, activeVenueId: number | undefined): Observable<ApiResponseModelInterface> {
    this.spinner.show();
    return this.http.get<ApiResponseModelInterface>(
      `${this.apiBaseUrl}/event/${eventId}/venue/${activeVenueId}/timeline?type=exhibitors`
    ).pipe(
      hideSpinnerPostApiCall(this.spinner),
      take(1),
      this.httpErrorHandler.processError(true, false)
    );
  }
}
