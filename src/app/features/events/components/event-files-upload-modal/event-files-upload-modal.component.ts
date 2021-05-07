import {Component, Input, OnInit, Output, EventEmitter, OnDestroy} from '@angular/core';
import {FileUploadConfigInterface} from '../../../../shared/models';
import {environment} from '../../../../../environments/environment';
import {EventService} from "../../services/event.service";
import {EventFileUploadService} from "../../services/event-file-upload.service";
import {EventFileTypes} from "../../models/types";
import {from, Subscription} from "rxjs";
import {EventFilesSignedURLReq, EventFileToDbReqInterface} from "../../models/interfaces";
import {finalize, tap} from "rxjs/operators";

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
  uploadStarted = false;


  constructor(
    private eventService: EventService,
    public eventFileUploadService: EventFileUploadService) {
  }

  ngOnInit(): void {
  }

  fileSelected(file: File): void {
    this.selectedFileList.push({displayName: ``, file});
  }

  removeFile(i: number): void {
    this.selectedFileList.splice(i, 1);
  }

  private saveFileToDB(fileIndex: number, params: EventFileToDbReqInterface): void {
    this.saveFileToDBSubs.forEach(sub => sub.unsubscribe());
    const subs = this.eventFileUploadService.saveFileToDB(fileIndex, params)
      .subscribe();
    this.saveFileToDBSubs.push(subs);
  }

  uploadSelectedFiles(): void {
    this.uploadStarted = true;
    const that = this;
    let i = 0;
    from(this.selectedFileList)
      .subscribe(selectedFile => {
        this.eventFileSignedURLReq.fileName = selectedFile.file.name;
        this.eventFileSignedURLReq.key = this.eventFileType;
        this.eventFileSignedURLReq.mimeType = selectedFile.file.type;
        this.eventFileUploadService.uploadFile(
          i,
          (this.eventFileSignedURLReq as EventFilesSignedURLReq),
          selectedFile.file,
          (url) => {
            that.saveFileToDB.call(that, i++, {
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

  toggleUploadStarted(): boolean {
    this.uploadStarted = false;
    return true;
  }

  ngOnDestroy(): void {
    this.saveFileToDBSubs.forEach(sub => sub.unsubscribe());
  }
}
