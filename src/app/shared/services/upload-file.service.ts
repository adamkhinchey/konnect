import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {HttpErrRespHandlerService} from "./http-err-resp-handler.service";
import {environment} from "../../../environments/environment";
import {Observable} from "rxjs";
import {ApiResponseModelInterface} from "../models";
import {v4 as uuidv4} from 'uuid';
import {map} from "rxjs/operators";
import {ToastrService} from "ngx-toastr";
import {devLogger} from "../utils";

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

  constructor(private http: HttpClient, private httpErrHandler: HttpErrRespHandlerService, private toaster: ToastrService) {
  }

  private fetchSignedUrl(fileName: string, fileType: string): Observable<{ signedRequest: string, url: string }> {
    return this.http.get<SignedURLApiResponseModel>(
      `${this.apiBaseUrl}/getS3BucketSignedURL`,
      {params: {fileName, fileType}}
    ).pipe(
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
    this.fetchSignedUrl(name, file.type)
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
          this.doUpload(signedUploadUrl, url, file, cb);
        }
      });
  }

  private doUpload(signedUploadUrl: string, url: string, file: File, cb: (url: string) => void): void {
    this.http.put(
      signedUploadUrl,
      file,
      {
        headers: {'Content-Type': file.type, 'NO-AUTH': 'true'}
      })
      .pipe(
        this.httpErrHandler.processError(true)
      )
      .subscribe(value => {
        cb(url);
      });
  }
}
