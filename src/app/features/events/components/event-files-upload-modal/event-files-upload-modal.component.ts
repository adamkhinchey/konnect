import {Component, Input, OnInit, Output, EventEmitter} from '@angular/core';
import {FileUploadConfigInterface} from '../../../../shared/models';
import {environment} from '../../../../../environments/environment';

@Component({
  selector: 'app-event-files-upload-modal',
  templateUrl: './event-files-upload-modal.component.html',
  styleUrls: ['./event-files-upload-modal.component.scss']
})
export class EventFilesUploadModalComponent implements OnInit {

  @Input() key: string | null = null;
  selectedFileList: { displayName: string, file: File }[] = [];
  fileConfig: FileUploadConfigInterface = {
    fileTypes: environment.eventFileAllowedFormat,
    size: environment.eventFileAllowedSize
  };
  @Output() closed = new EventEmitter();


  constructor() {
  }

  ngOnInit(): void {
  }

  fileSelected(file: File): void {
    this.selectedFileList.push({displayName: ``, file});
  }

  removeFile(i: number):void {
    this.selectedFileList.splice(i, 1);
  }
}
