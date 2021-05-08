import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../../environments/environment';
import {Observable, Subject} from 'rxjs';
import {v4 as uuidv4} from 'uuid';
import {finalize, map, take, tap} from 'rxjs/operators';
import {ToastrService} from 'ngx-toastr';
import {NgxSpinnerService} from 'ngx-spinner';
import {HttpErrRespHandlerService} from '../../../shared/services';
import {devLogger, hideSpinnerPostApiCall} from '../../../shared/utils';
import {ApiResponseModelInterface} from '../../../shared/models';
import {EventFileTypes} from '../models/types';
import {EventFilesSignedURLReq, EventFileToDbReqInterface} from "../models/interfaces";

interface SignedURLApiResponseModel extends ApiResponseModelInterface {
  data: {
    signedUrlObj: {
      status: string;
      signedRequest: string;
      url: string;
    };
  };
}


@Injectable({
  providedIn: 'root'
})
export class EventFileUploadService {
  private apiBaseUrl = environment.apiBaseURL;
  public fileUploadStatus = new Map<number, { uploading: boolean; uploaded: boolean; failed: boolean }>();
  public uploadingStopped = new Subject<boolean>();

  constructor(
    private http: HttpClient,
    private httpErrHandler: HttpErrRespHandlerService,
    private toaster: ToastrService,
    private spinner: NgxSpinnerService) {
  }

  private fetchSignedUrl(params: EventFilesSignedURLReq): Observable<{ signedRequest: string, url: string }> {
    /*this.spinner.show();*/
    return this.http.post<SignedURLApiResponseModel>(
      `${this.apiBaseUrl}/getEventFileUploadS3SingnedUrl`,
      {
        ...params,
        serviceId: params.serviceId || null,
        venueId: params.venueId || null,
        exhibitorId: params.exhibitorId || null
      }
    ).pipe(
      hideSpinnerPostApiCall(this.spinner),
      this.httpErrHandler.processError(true),
      map(response => {
        return {
          signedRequest: response.data?.signedUrlObj?.signedRequest,
          url: response.data.signedUrlObj.url
        };
      })
    );
  }

  uploadFile(fileIndex: number,
             eventFilesSignedURLReq: EventFilesSignedURLReq,
             file: File,
             cb: (url: string, fileIndex: number) => void): void {
    const name = uuidv4() + '__' + file.name;
    let signedUploadUrl: string | null = null;
    let url: string | null = null;
    /*this.spinner.show();*/
    devLogger('log', {['fetching url for file ']: fileIndex});
    this.fileUploadStatus.set(fileIndex, {uploading: true, uploaded: false, failed: false});
    this.fetchSignedUrl(eventFilesSignedURLReq)
      .pipe(hideSpinnerPostApiCall(this.spinner))
      .subscribe(value => {
        if (value) {
          signedUploadUrl = value.signedRequest;
          url = value.url;
        } else {
          this.fileUploadStatus.set(fileIndex, {uploading: false, uploaded: false, failed: true});
        }
      }, err => {
        devLogger('error', err);
        this.fileUploadStatus.set(fileIndex, {uploading: false, uploaded: false, failed: true});
      }, () => {
        if (signedUploadUrl && url) {
          this.doUpload(fileIndex, signedUploadUrl, url, file, cb);
        }
      });
  }

  private doUpload(fileIndex: number,
                   signedUploadUrl: string,
                   url: string,
                   file: File,
                   cb: (url: string, fileIndex: number) => void): void {
    /*this.spinner.show();*/
    devLogger('log', {['uploading file ']: fileIndex});
    this.http.put(
      signedUploadUrl,
      file,
      {
        headers: {'Content-Type': file.type, 'NO-AUTH': 'true'}
      })
      .pipe(
        take(1),
        tap({
          next: (value) => {
            this.fileUploadStatus.set(fileIndex, {uploading: true, uploaded: false, failed: false});
          },
          error: (err) => {
            this.fileUploadStatus.set(fileIndex, {uploading: false, uploaded: false, failed: true});
          }
        }),
        hideSpinnerPostApiCall(this.spinner),
        this.httpErrHandler.processError(true)
      )
      .subscribe(value => {
        cb(url, fileIndex);
      });
  }

  saveFileToDB(fileIndex: number, param: EventFileToDbReqInterface): Observable<any> {
    devLogger('log', {['saving file ']: fileIndex});
    return this.http.post<ApiResponseModelInterface>(
      `${this.apiBaseUrl}/addEventFiles`,
      {...param}
    ).pipe(
      take(1),
      tap({
        next: (value) => {
          if (value.data && value.data.filesList[0].success) {
            this.fileUploadStatus.set(fileIndex, {uploading: false, uploaded: true, failed: false});
          } else {
            this.fileUploadStatus.set(fileIndex, {uploading: false, uploaded: false, failed: true});
          }
        },
        error: (err) => {
          this.fileUploadStatus.set(fileIndex, {uploading: false, uploaded: false, failed: true});
        }
      }),
      finalize(() => {
        let arr = [];
        const entries = this.fileUploadStatus.entries();
        for (const [key, value] of entries) {
          arr.push(value);
        }
        arr = arr.filter(val => {
          return (val.failed || val.uploaded) && !val.uploading;
        });
        if (arr.length === this.fileUploadStatus.size) {
          this.uploadingStopped.next(true);
        }
      }),
      hideSpinnerPostApiCall(this.spinner),
      this.httpErrHandler.processError(false)
    );
  }

  reset(): void {
    this.fileUploadStatus.clear();
  }
}
