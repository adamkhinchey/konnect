import {
  Component,
  Input,
  OnInit,
  Output,
  EventEmitter,
  OnDestroy,
  ViewChild,
  ElementRef,
  AfterViewChecked
} from '@angular/core';
import {FileUploadConfigInterface} from '../../../../shared/models';
import {environment} from '../../../../../environments/environment';
import {EventService} from "../../services/event.service";
import {EventFileUploadDeleteService} from "../../services/event-file-upload-delete.service";
import {EventFileTypes} from "../../models/types";
import {BehaviorSubject, from, Subscription} from "rxjs";
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
export class EventFilesUploadModalComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('fileContainer') private fileContainer: ElementRef | undefined;
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
  @Input() existingFiles: {
    displayName: string;
    fileUrl: string;
    fileId: number;
    mimeType: string;
  }[] = [];
  fileSelectedSubject = new BehaviorSubject<boolean>(true);
  private deleteFileSub: Subscription | undefined;


  constructor(
    private eventService: EventService,
    public eventFileUploadDeleteService: EventFileUploadDeleteService,
    private toaster: ToastrService) {
  }

  ngOnInit(): void {
    this.uploadingStoppedSub = this.eventFileUploadDeleteService.uploadingStopped.subscribe(() => {
      this.uploading = false;
      this.toaster.success('File upload completed');
    });
  }

  ngAfterViewChecked(): void {
    if (this.fileContainer && this.fileSelectedSubject.getValue()) {
      this.fileContainer.nativeElement.scrollTop = this.fileContainer.nativeElement.scrollHeight;
      this.fileSelectedSubject.next(false);
    }
  }

  fileSelected(file: File): void {
    this.selectedFileList.push({displayName: ``, file});
    this.fileSelectedSubject.next(true);
  }

  removeFile(i: number): void {
    this.selectedFileList.splice(i, 1);
  }

  private saveFileToDB(fileIndex: number, params: EventFileToDbReqInterface): void {
    const subs = this.eventFileUploadDeleteService.saveFileToDB(fileIndex, params).subscribe();
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
        this.eventFileUploadDeleteService.uploadFile(
          i,
          (this.eventFileSignedURLReq as EventFilesSignedURLReq),
          file,
          (url, fileIndex) => {
            that.saveFileToDB.call(that, fileIndex, {
              eventFileType: this.eventFileSignedURLReq.key,
              eventId: this.eventFileSignedURLReq.eventId,
              exhibitorId: this.eventFileSignedURLReq.exhibitorId,
              venueId: this.eventFileSignedURLReq.venueId,
              supplierId: this.eventFileSignedURLReq.serviceId,
              filesList: [{
                mimeType: this.eventFileSignedURLReq.mimeType,
                displayName: selectedFile.displayName != '' ? selectedFile.displayName : actualFileName,
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
      this.eventFileUploadDeleteService.reset();
      return true;
    }
  }

  deleteFile(existingFile: {
    displayName: string;
    fileUrl: string;
    fileId: number;
    mimeType: string
  }, index: number): void {
    this.deleteFileSub?.unsubscribe();
    this.deleteFileSub = this.eventFileUploadDeleteService.deleteFile({
      eventId: this.eventFileSignedURLReq.eventId,
      fileId: existingFile.fileId
    }).subscribe((result) => {
      if (result && result.code === 200) {
        this.toaster.success('File deleted successfully');
        this.existingFiles.splice(index, 1);
      }
    }, (err) => {
      devLogger('log', {['EVENT_FILE_DELETE_ERROR']: err});
    });
  }


  ngOnDestroy(): void {
    this.saveFileToDBSubs.forEach(sub => sub.unsubscribe());
    this.uploadingStoppedSub?.unsubscribe();
  }
}
