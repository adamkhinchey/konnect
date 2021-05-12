import { AfterViewChecked, Component, Input, OnInit } from '@angular/core';
import { NgbModal, NgbNavChangeEvent } from '@ng-bootstrap/ng-bootstrap';
import { ViewEventService } from '../../services/view-event.service';

@Component({
  selector: 'app-event-view',
  templateUrl: './event-view.component.html',
  styleUrls: ['./event-view.component.scss']
})
export class EventViewComponent implements OnInit {
  @Input() eventId: any
  data: any = {};
  active = 1;
  disabled = true;
  modalReference: any;


  onNavChange(changeEvent: NgbNavChangeEvent) {
    console.log(changeEvent);
    this.getEventsById(changeEvent.nextId);
  }

  toggleDisabled() {
    this.disabled = !this.disabled;
    if (this.disabled) {
      this.active = 1;
    }
  }
  constructor(private modalService: NgbModal, private viewEvSrvc: ViewEventService) {
  }

  ngOnInit() {
    console.log(this.eventId);
    if (this.eventId) {
      this.getEventsById(1);
    }
  }

  getEventsById(tabType: any) {
    this.viewEvSrvc.getEventsByEventId(this.eventId, tabType).subscribe((res: any) => {
      console.log(res);
      this.data.eventData = res.eventData;
      this.data.userPermission = res.userPermission;
      console.log(this.data);
      this.active = tabType
    }, err => {
      console.log(err);
    })
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
