import {Component, Input, OnInit, TemplateRef} from '@angular/core';
import {NgbModal, NgbModalRef} from "@ng-bootstrap/ng-bootstrap";

@Component({
  selector: 'app-event-files-function',
  templateUrl: './event-files-function.component.html',
  styleUrls: ['./event-files-function.component.scss']
})
export class EventFilesFunctionComponent implements OnInit {

  @Input() uploadFilesModal: TemplateRef<any> | undefined;

  fileUploadModalReference: NgbModalRef | undefined;

  constructor(private modalService: NgbModal) {
  }

  ngOnInit(): void {
  }

  contentUpload(content: any): void {
    this.fileUploadModalReference = this.modalService.open(content, {
      centered: true,
      size: 'md',
      backdrop: 'static',
      keyboard: false,
    });

  }

}
