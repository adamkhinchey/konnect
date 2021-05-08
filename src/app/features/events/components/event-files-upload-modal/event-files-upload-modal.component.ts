import {Component, Input, OnInit, Output, EventEmitter, OnDestroy} from '@angular/core';
import {FileUploadConfigInterface} from '../../../../shared/models';
import {environment} from '../../../../../environments/environment';
import {EventService} from "../../services/event.service";
import {EventFileUploadService} from "../../services/event-file-upload.service";
import {EventFileTypes} from "../../models/types";
import {from, Subscription} from "rxjs";
import {EventFilesSignedURLReq, EventFileToDbReqInterface} from "../../models/interfaces";
import {finalize, map, tap} from "rxjs/operators";
import {v4 as uuidV4} from 'uuid';
import {devLogger} from "../../../../shared/utils";
import {ToastrService} from "ngx-toastr";

@Component({
  selector: 'app-event-files-upload-modal',
  templateUrl: './event-files-upload-modal.component.html',
  styleUrls: ['./event-files-upload-modal.component.scss']
})
export class EventFilesUploadModalComponent implements OnInit, OnDestroy {

  @Input() key: string | null = null;
  @Input() eventFileType: EventFileTypes | undefined;
  @Input() eventFileSignedURLReq: Partial<EventFilesSignedURLReq> = {};
  selectedFileList: { displayName: string, file: File }[] = [];
  fileConfig: FileUploadConfigInterface = {
    fileTypes: environment.eventFileAllowedFormat,
    size: environment.eventFileAllowedSize
  };
  @Output() closed = new EventEmitter();
  private saveFileToDBSubs: Subscription[] = [];
  uploading = false;
  private uploadingStoppedSub: Subscription | undefined;
  uploadTriggered = false;


  constructor(
    private eventService: EventService,
    public eventFileUploadService: EventFileUploadService,
    private toaster: ToastrService) {
  }

  ngOnInit(): void {
    this.uploadingStoppedSub = this.eventFileUploadService.uploadingStopped.subscribe(() => {
      this.uploading = false;
      this.toaster.success('File upload completed');
    });
  }

  fileSelected(file: File): void {
    this.selectedFileList.push({displayName: ``, file});
  }

  removeFile(i: number): void {
    this.selectedFileList.splice(i, 1);
  }

  private saveFileToDB(fileIndex: number, params: EventFileToDbReqInterface): void {
    const subs = this.eventFileUploadService.saveFileToDB(fileIndex, params).subscribe();
    this.saveFileToDBSubs.push(subs);
  }

  uploadSelectedFiles(): void {
    this.saveFileToDBSubs.forEach(sub => sub.unsubscribe());
    this.uploading = true;
    this.uploadTriggered = true;
    const that = this;
    let i = -1;
    from(this.selectedFileList)
      .pipe(tap({
        next: (value) => {
          i++;
        }
      }))
      .subscribe(selectedFile => {
        const actualFileName = selectedFile.file.name;
        const extension = actualFileName.substring(actualFileName.lastIndexOf('.'));
        const uniqueFileName = uuidV4() + (actualFileName !== extension ? extension : '');
        const file = new File([selectedFile.file], uniqueFileName, {type: selectedFile.file.type});
        this.eventFileSignedURLReq.fileName = uniqueFileName;
        this.eventFileSignedURLReq.key = this.eventFileType;
        this.eventFileSignedURLReq.mimeType = selectedFile.file.type;
        this.eventFileUploadService.uploadFile(
          i,
          (this.eventFileSignedURLReq as EventFilesSignedURLReq),
          file,
          (url, fileIndex) => {
            that.saveFileToDB.call(that, fileIndex, {
              eventFileType: this.eventFileSignedURLReq.key,
              eventId: this.eventFileSignedURLReq.eventId,
              exhibitorId: this.eventFileSignedURLReq.exhibitorId,
              filesList: [{
                mimeType: this.eventFileSignedURLReq.mimeType,
                displayName: selectedFile.displayName,
                fileUrl: url
              }]
            });
          }
        );
      });
  }

  checkUploading(): boolean {
    if (this.uploading) {
      this.toaster.info('File upload is in progress', 'Please wait!');
      return false;
    } else {
      this.eventFileUploadService.reset();
      return true;
    }
  }

  ngOnDestroy(): void {
    this.saveFileToDBSubs.forEach(sub => sub.unsubscribe());
    this.uploadingStoppedSub?.unsubscribe();
  }
}
