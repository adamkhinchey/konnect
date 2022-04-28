import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {HttpErrRespHandlerService} from "./http-err-resp-handler.service";
import {environment} from "../../../environments/environment";
import {Observable} from "rxjs";
import {ApiResponseModelInterface} from "../models";
import {v4 as uuidv4} from 'uuid';
import {map, tap} from "rxjs/operators";
import {ToastrService} from "ngx-toastr";
import {devLogger, hideSpinnerPostApiCall} from "../utils";
import {NgxSpinnerService} from "ngx-spinner";

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
export class UploadFileService {
  private apiBaseUrl = environment.apiBaseURL;

  constructor(
    private http: HttpClient,
    private httpErrHandler: HttpErrRespHandlerService,
    private toaster: ToastrService,
    private spinner: NgxSpinnerService) {
  }

  private fetchSignedUrl(fileName: string, fileType: string): Observable<{ signedRequest: string, url: string }> {
    this.spinner.show();
    return this.http.get<SignedURLApiResponseModel>(
      `${this.apiBaseUrl}/getS3BucketSignedURL`,
      {params: {fileName, fileType}}
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

  private fetchSignedUrlCreateCompany(fileName: string, fileType: string): Observable<{ signedRequest: string, url: string }> {
    // this.spinner.show();
    return this.http.get<SignedURLApiResponseModel>(
      `${this.apiBaseUrl}/getS3BucketSignedURL`,
      {params: {fileName, fileType}}
    ).pipe(
      // hideSpinnerPostApiCall(this.spinner),
      this.httpErrHandler.processError(true),
      map(response => {
        return {
          signedRequest: response.data?.signedUrlObj?.signedRequest,
          url: response.data.signedUrlObj.url
        };
      })
    );
  }

  uploadFile(file: File, cb: (url: string) => void): void {
    const name = uuidv4() + '__' + file.name;
    let signedUploadUrl: string | null = null;
    let url: string | null = null;
    this.spinner.show();
    this.fetchSignedUrl(name, file.type)
      .pipe(hideSpinnerPostApiCall(this.spinner))
      .subscribe(value => {
        if (value) {
          signedUploadUrl = value.signedRequest;
          url = value.url;
        } else {
          this.toaster.error('Failed to upload file. Please try again!');
        }
      }, err => {
        this.toaster.error('Failed to upload file. Please try again!');
        devLogger('error', err);
      }, () => {
        if (signedUploadUrl && url) {
          this.doUpload(signedUploadUrl, url, file, cb);
        }
      });
  }

  uploadFileCreateCompany(file: File, cb: (url: string) => void): void {
    const name = uuidv4() + '__' + file.name;
    let signedUploadUrl: string | null = null;
    let url: string | null = null;
    this.fetchSignedUrlCreateCompany(name, file.type)
      .subscribe(value => {
        if (value) {
          signedUploadUrl = value.signedRequest;
          url = value.url;
        } else {
          this.toaster.error('Failed to upload profile image. Please try again!');
        }
      }, err => {
        this.toaster.error('Failed to upload profile image. Please try again!');
        devLogger('error', err);
      }, () => {
        if (signedUploadUrl && url) {
          this.doUploadCreateCompany(signedUploadUrl, url, file, cb);
        }
      });
  }

  private doUpload(signedUploadUrl: string, url: string, file: File, cb: (url: string) => void): void {
    this.spinner.show();
    this.http.put(
      signedUploadUrl,
      file,
      {
        headers: {'Content-Type': file.type, 'NO-AUTH': 'true'}
      })
      .pipe(
        hideSpinnerPostApiCall(this.spinner),
        this.httpErrHandler.processError(true)
      )
      .subscribe(value => {
        console.log('value...',value)
        cb(url);
      });
  }

  private doUploadCreateCompany(signedUploadUrl: string, url: string, file: File, cb: (url: string) => void): void {
    // this.spinner.show();
    this.http.put(
      signedUploadUrl,
      file,
      {
        headers: {'Content-Type': file.type, 'NO-AUTH': 'true'}
      })
      .pipe(
        // hideSpinnerPostApiCall(this.spinner),
        this.httpErrHandler.processError(true)
      )
      .subscribe(value => {
        cb(url);
      });
  }
}
