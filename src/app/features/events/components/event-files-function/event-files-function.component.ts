import {Component, Input, OnInit} from '@angular/core';
import {NgbModal, NgbModalRef} from "@ng-bootstrap/ng-bootstrap";

@Component({
  selector: 'app-event-files-function',
  templateUrl: './event-files-function.component.html',
  styleUrls: ['./event-files-function.component.scss']
})
export class EventFilesFunctionComponent implements OnInit {

  @Input() contentNew: any;

  modalReference: NgbModalRef | undefined;

  constructor(private modalService: NgbModal) {
  }

  ngOnInit(): void {
  }

  contentUpload(contentNew: any): void {
    this.modalReference = this.modalService.open(contentNew, {
      centered: true,
      size: 'md',
    });

  }

}
