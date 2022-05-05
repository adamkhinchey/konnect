import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { promises } from 'dns';
import { NgxSpinnerService } from 'ngx-spinner';
import { environment } from 'src/environments/environment';
import { FileUploadConfigInterface } from '../../models';
import { UploadFileService } from '../../services';
@Component({
  selector: 'app-import-export',
  templateUrl: './import-export.component.html',
  styleUrls: ['./import-export.component.scss'],
})
export class ImportExportComponent implements OnInit {
  @Input() type = '';
  fileName: any = '';
  fileConfig: FileUploadConfigInterface = {
    fileTypes: environment.eventXLSXAllowedFormat,
    size: environment.eventFileAllowedSize,
  };
  url:any;
  constructor(
    private activeModal: NgbActiveModal,
    public fileUploadService: UploadFileService,
    public spinner: NgxSpinnerService
  ) {}

  ngOnInit(): void {}

  public dismiss() {
    this.activeModal.dismiss();
  }

  fileSelected(event: File) {
    console.log('event: ', event);
    console.log(URL.createObjectURL(event));
    if (event) {
      // this.spinner.show();
      this.fileUploadService.uploadFile(event, (url) => {
        console.log('url...', url);
        // this.spinner.hide();
        let name = event.name;
        this.fileName = name.replace(/ /g, '_');
        this.url = url;
        // this.activeModal.close({url: url});
      });
    }
  }

  importData(){
    this.activeModal.close({url: this.url});
  }

  exportData(){
    this.activeModal.close(true);
  }

}


