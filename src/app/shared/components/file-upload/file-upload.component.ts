import {Component, ElementRef, Input, OnInit, Output, EventEmitter, ViewChild} from '@angular/core';
import {FileUploadConfigInterface} from "../../models";
import {devLogger} from "../../utils";
import {ToastrService} from "ngx-toastr";

@Component({
  selector: 'app-file-upload',
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.scss']
})
export class FileUploadComponent implements OnInit {

  @Input() config: FileUploadConfigInterface | undefined;
  @Input() showValidFileTypeList = true;
  @ViewChild('fileInputForm') inputForm: ElementRef<HTMLFormElement> | undefined;
  @ViewChild('fileUploadInputElement') inputElement: ElementRef<HTMLElement> | undefined;
  @Output() fileChange = new EventEmitter<File>();

  constructor(private toaster: ToastrService) {
  }

  ngOnInit(): void {
  }

  onFileSelected(event: Event): void {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files.length > 0) {
      const file: File = target.files[0];
      if (this.satisfiesConfig(file)) {
        this.fileChange.emit(target.files[0]);
        this.inputForm?.nativeElement.reset();
      } else {
        const allowedFileTypesString = this.config?.fileTypes.map(type => {
          const index = type.indexOf('/');
          return type.slice(index + 1);
        }).join(', ');

        if (this.showValidFileTypeList) {
          this.toaster.error(`Only files in
        ${allowedFileTypesString} format(s)
        ${this.config?.size ? ` of upto ${this.config?.size / (1024 * 1024)} MB` : ''} are valid`
            , 'Invalid file type');
        } else {
          this.toaster.error(`Selected file type is not allowed
        ${this.config?.size ? `and file of upto ${this.config?.size / (1024 * 1024)} MB` : ''} is valid`
            , 'Invalid file type or file size');
        }

        this.inputForm?.nativeElement.reset();
      }

    }
  }

  satisfiesConfig(file: File): boolean {
    if (this.config && file.size > 0) {
      return this.config?.fileTypes.includes(file.type) && file.size <= this.config?.size;
    } else {
      return false;
    }
  }
}
