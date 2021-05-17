import { AfterViewChecked, Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal, NgbNavChangeEvent } from '@ng-bootstrap/ng-bootstrap';
import { EventTimelineService } from '../../services/event-timeline.service';
import { EventService } from '../../services/event.service';
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

  isClient: boolean =  false; 
  isEventManager: boolean =  false; 
  isService: boolean =  false; 
  isVenue: boolean =  false; 

  isSupplier: boolean = false;
  isExhibitor: boolean = false;
  modalReference: any;
  isClientEdit: boolean = false;
  isEventEdit: boolean = false;
  isVenueEdit: boolean = false;
  isSupplierEdit: boolean = false;
  isExhibitorEdit: boolean = true;

  onNavChange(changeEvent: NgbNavChangeEvent) {
    this.booleanFalse();
    this.getEventsById(changeEvent.nextId);
    this.active = changeEvent.nextId;
  }

  booleanFalse() {
    this.isClientEdit = false;
    this.isEventEdit = false;
    this.isVenueEdit = false;;
    this.isSupplierEdit = false;
    this.isExhibitorEdit = false;
  }

  toggleDisabled() {
    this.disabled = !this.disabled;
    if (this.disabled) {
      this.active = 1;
    }
  }
  constructor(
    private modalService: NgbModal,
    private viewEvSrvc: ViewEventService,
    private router: Router,
    private eventTimelineSrvc: EventTimelineService,
    private eventSrvc: EventService
  ) {
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

      if(res.userPermission){
        this.isClient = true; //  res.userPermission.isClient == 0 ? false : true ; 
        this.isEventManager = true ; //  res.userPermission.isEventManager == 0 ? false : true  ; 
        this.isVenue = true; // res.userPermission.isVenue == 0 ? false : true  ; 
        this.isService = true; //  res.userPermission.isService == 0 ? false : true ; 
        this.isExhibitor = true; //  res.userPermission.isExhibitor == 0 ? false : true ; 

      }




      console.log(this.data);
      if (tabType === 7) {
        this.eventTimelineSrvc.render.next();
      }
      if (tabType === 6) {
        this.eventSrvc.fetchEventFilesSubject.next(this.data.eventData.eventId);
      }
    }, err => {
      console.log(err);
    })
  }

  deleteEvent(eventId: any) {
    this.viewEvSrvc.deleteEvent(eventId).subscribe((res: any) => {
      console.log(res);
      this.router.navigate(['/home']);
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
  editClientEvent() {
    this.isClientEdit = true;
  }
  editEventManager() {
    this.isEventEdit = true;
  }
  editVenue() {
    this.isVenueEdit = true;
  }
  editSupplier() {
    this.isSupplierEdit = true;
  }
  editExhibitor() {
    this.isExhibitorEdit = true;
  }
}
