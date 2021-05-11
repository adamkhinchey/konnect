import { Component, OnInit } from '@angular/core';
import { NgbModal, NgbNavChangeEvent } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-event-view',
  templateUrl: './event-view.component.html',
  styleUrls: ['./event-view.component.scss']
})
export class EventViewComponent implements OnInit {
  active = 1;
  disabled = true;
  modalReference: any;




  onNavChange(changeEvent: NgbNavChangeEvent) {
    if (changeEvent.nextId === 3) {
      changeEvent.preventDefault();
    }
  }

  toggleDisabled() {
    this.disabled = !this.disabled;
    if (this.disabled) {
      this.active = 1;
    }
  }
  constructor(private modalService: NgbModal,) {
  }

  ngOnInit() {
  }


  openVerticallyCentered(content: any) {
    this.modalReference = this.modalService.open(content, {
      centered: true,
      size: "lg",
    });

  }
  openVerticallyCentered2(content: any) {
    this.modalReference = this.modalService.open(content, {
      centered: true,
      size: "lg",
    });

  }

  contentUpload(contentNew: any) {
    this.modalReference = this.modalService.open(contentNew, {
      centered: true,
      size: "md",
    });

  }

  addContactModal(contentNewContact: any) {
    this.modalReference = this.modalService.open(contentNewContact, {
      centered: true,
      size: "lg",
    });

  }
}
