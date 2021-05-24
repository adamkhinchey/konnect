import { AfterViewChecked, Component, Input, OnInit, Output, TemplateRef, EventEmitter, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal, NgbModalRef, NgbNavChangeEvent } from '@ng-bootstrap/ng-bootstrap';
import { Company } from 'src/app/features/users/models';
import { SaveEventClass } from '../../models/classes';
import { FnCmpCntInterface, InviteFnCmpCntInterface, InviteFnCmpInterface } from '../../models/interfaces';
import { EventFunctionTypes } from '../../models/types';
import { EventTimelineService } from '../../services/event-timeline.service';
import { EventService } from '../../services/event.service';
import { ViewEventService } from '../../services/view-event.service';
import { EventAssignFunctionCmpComponent } from '../event-assign-function-cmp/event-assign-function-cmp.component';
import { EventExhibitorsFunctionComponent } from '../event-exhibitors-function/event-exhibitors-function.component';
import { EventSuppliersFunctionComponent } from '../event-suppliers-function/event-suppliers-function.component';
import { EventVenueFunctionComponent } from '../event-venue-function/event-venue-function.component';

@Component({
  selector: 'app-event-view',
  templateUrl: './event-view.component.html',
  styleUrls: ['./event-view.component.scss']
})
export class EventViewComponent implements OnInit {
  @Input() contactModal: TemplateRef<any> | undefined;
  @Output() modalOpen = new EventEmitter<NgbModalRef>();
  @Input() eventId: any;
  data: any = {};
  active = 1;
  disabled = true;
  selectedFunction: EventFunctionTypes = this.active;
  clientCompany: Company | InviteFnCmpInterface | undefined | null;
  eventMgrCmp: Company | InviteFnCmpInterface | undefined | null;
  venueCompanies: Array<Company | InviteFnCmpInterface | null> | undefined | null = [];
  @ViewChild('suppliersFn') suppliersFn: EventSuppliersFunctionComponent | undefined;
  @ViewChild('exhibitorsFn') exhibitorsFn: EventExhibitorsFunctionComponent | undefined;
  @ViewChild('venueFn') venueFn: EventVenueFunctionComponent | undefined;
  clientContactList: FnCmpCntInterface[] = [];
  eventMgrContactList: FnCmpCntInterface[] = [];
  venueContactLists: Array<Array<FnCmpCntInterface>> = [];
  eventToBeSaved = new SaveEventClass();


  // isClient: boolean =  false; 
  // isEventManager: boolean =  false; 
  // isService: boolean =  false; 
  // isVenue: boolean =  false; 

  // isExhibitor: boolean = false;

  permissionObj = { isClient: false, isEventManager: false, isService: false, isVenue: false, isExhibitor: false };

  isSupplier: boolean = false;
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
    private eventService: EventService,
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
      if (res && res.eventData) {
        this.data.eventData = res.eventData;
      }
      if (res && res.userPermission) {
        this.data.userPermission = res.userPermission;
        this.permissionObj.isClient = res.userPermission.isClient == 0 ? false : true;
        this.permissionObj.isEventManager = res.userPermission.isEventManager == 0 ? false : true;
        this.permissionObj.isVenue = res.userPermission.isVenue == 0 ? false : true;
        this.permissionObj.isService = res.userPermission.isService == 0 ? false : true;
        this.permissionObj.isExhibitor = res.userPermission.isExhibitor == 0 ? false : true;
      }
      if (res && res.commonData) {
        this.data.commonData = res.commonData;
      }

      // console.log("permissionObj", this.permissionObj); 


      console.log(this.data);
      if (tabType === 7) {
        this.eventTimelineSrvc.render.next();
      }
      if (tabType === 6) {
        this.eventService.fetchEventFilesSubject.next(this.data.eventData.eventId);
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

  openVerticallyCentered3(content: any): void {
    this.modalReference = this.modalService.open(content, {
      centered: true,
      size: 'lg',
      backdrop: 'static',
      keyboard: false
    });

    this.modalOpen.emit(this.modalReference);
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

  searchInviteContactModalClosed(): void {
    this.modalReference?.close();
  }

  getCompanyId(): number | null {
    switch (this.selectedFunction) {
      case EventFunctionTypes.CLIENT:
        return (this.clientCompany as Company)?.id;
      case EventFunctionTypes.EVENT_MANAGER:
        return (this.eventMgrCmp as Company)?.id;
      case EventFunctionTypes.VENUE:
        const activatedVenuePanelIndex = this.eventService.activeVenuePanelIndex;
        if (activatedVenuePanelIndex !== null && this.venueCompanies) {
          return (this.venueCompanies[activatedVenuePanelIndex] as Company)?.id;
        } else {
          return null;
        }
      case EventFunctionTypes.SUPPLIERS: {
        const activeVenueIndex = this.eventService.activeServicePanel?.venueIndex;
        const activeServiceIndex = this.eventService.activeServicePanel?.serviceIndex;
        if (typeof activeVenueIndex === 'number' && typeof activeServiceIndex === 'number') {
          const company = this.suppliersFn?.venuesSuppCmpsMap.get(activeVenueIndex)?.get(activeServiceIndex);
          if (company) {
            return (company as Company)?.id;
          }
        }
        return null;
      }
      case EventFunctionTypes.EXHIBITORS: {
        const activeVenueIndex = this.eventService.activeExhibitorPanel?.venueIndex;
        const activeExhibitorIndex = this.eventService.activeExhibitorPanel?.exhibitorIndex;
        if (typeof activeVenueIndex === 'number' && typeof activeExhibitorIndex === 'number') {
          const company = this.exhibitorsFn?.venuesExhCmpsMap.get(activeVenueIndex)?.get(activeExhibitorIndex);
          if (company) {
            return (company as Company)?.id;
          }
        }
        return null;
      }
      default:
        return null;
    }
  }

  setSelectedFnCompanyContacts(contactList: InviteFnCmpCntInterface[]): void {
    switch (this.selectedFunction) {
      case EventFunctionTypes.CLIENT:
        this.clientContactList = [...this.clientContactList, ...contactList];
        break;
      case EventFunctionTypes.EVENT_MANAGER:
        this.eventMgrContactList = [...this.eventMgrContactList, ...contactList];
        break;
      case EventFunctionTypes.VENUE:
        const activatedVenuePanelIndex = this.eventService.activeVenuePanelIndex;
        if (activatedVenuePanelIndex !== null && this.venueFn?.venueAssignCmp) {
          if (this.venueContactLists.length - 1 < activatedVenuePanelIndex) {
            for (let i = this.venueContactLists.length; i < activatedVenuePanelIndex; i++) {
              /*
               * fill the missing with null
               * example if venueContactLists=[[someVal, someVal],[someVal]] && activeVenuePanelIndex=4
               * then after loop venueContactLists=[[someVal, someVal],[someVal],[],[]]
               */
              this.venueContactLists.push([]);
            }
          }
          if (!this.venueContactLists[activatedVenuePanelIndex]) {
            this.venueContactLists[activatedVenuePanelIndex] = [];
          }
          this.venueContactLists[activatedVenuePanelIndex].push(...contactList);
          this.venueContactLists = [...this.venueContactLists];
          let venueAssignCmpCnt: EventAssignFunctionCmpComponent | undefined;
          venueAssignCmpCnt = this.venueFn?.venueAssignCmp.get(activatedVenuePanelIndex);
          if (venueAssignCmpCnt) {
            venueAssignCmpCnt.setContactList(this.venueContactLists[activatedVenuePanelIndex]);
          }
        }
        break;
      case EventFunctionTypes.SUPPLIERS:
        this.eventService.supplierContactsAdded(contactList);
        break;
      case EventFunctionTypes.EXHIBITORS:
        this.eventService.exhibitorContactsAdded(contactList);
        break;
      default:
        break;
    }
    this.searchInviteContactModalClosed();
  }

  getFnContactList(): FnCmpCntInterface[] {
    switch (this.selectedFunction) {
      case EventFunctionTypes.CLIENT:
        return this.clientContactList.slice(0);
      case EventFunctionTypes.EVENT_MANAGER:
        return this.eventMgrContactList.slice(0);
      case EventFunctionTypes.VENUE:
        const activatedVenuePanelIndex = this.eventService.activeVenuePanelIndex;
        if (activatedVenuePanelIndex !== null && this.venueFn?.venueAssignCmp) {
          let venueAssignCmpCnt: EventAssignFunctionCmpComponent | undefined;
          venueAssignCmpCnt = this.venueFn?.venueAssignCmp.get(activatedVenuePanelIndex);
          if (venueAssignCmpCnt) {
            return this.venueContactLists[activatedVenuePanelIndex].slice(0);
          }
        }
        return [];
      case EventFunctionTypes.SUPPLIERS: {
        const activeVenueIndex = this.eventService.activeServicePanel?.venueIndex;
        const activeServiceIndex = this.eventService.activeServicePanel?.serviceIndex;
        if (typeof activeVenueIndex === 'number' && typeof activeServiceIndex === 'number') {
          const service = this.eventToBeSaved.venues?.list[activeVenueIndex]
            .suppliers[0].services[activeServiceIndex];
          if (service && service.contacts) {
            return service.contacts;
          }
        }
        return [];
      }
      case EventFunctionTypes.EXHIBITORS: {
        const activeVenueIndex = this.eventService.activeExhibitorPanel?.venueIndex;
        const activeServiceIndex = this.eventService.activeExhibitorPanel?.exhibitorIndex;
        if (typeof activeVenueIndex === 'number' && typeof activeServiceIndex === 'number') {
          const exhibitor = this.eventToBeSaved.venues?.list[activeVenueIndex]
            .exhibitorList[0].exhibitors[activeServiceIndex];
          if (exhibitor && exhibitor.contacts) {
            return exhibitor.contacts;
          }
        }
        return [];
      }
      default:
        return [];
    }
  }

}
