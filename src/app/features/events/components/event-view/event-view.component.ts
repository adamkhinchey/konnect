import { AfterViewChecked, Component, Input, OnInit, Output, TemplateRef, EventEmitter, ViewChild, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal, NgbModalRef, NgbNavChangeEvent } from '@ng-bootstrap/ng-bootstrap';
import { cloneDeep } from 'lodash-es';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { Company } from 'src/app/features/users/models';
import { devLogger } from 'src/app/shared/utils';
import { InviteFnCmpClass, SaveEventClass } from '../../models/classes';
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
export class EventViewComponent implements OnInit, OnDestroy {
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
  private saveOnlySub: Subscription | undefined;
  isEventClientInvalid = true;
  isEventMgrInvalid = true;
  isEventVenuesInvalid = true;

  isVenuesSuppliersInvalid = true;
  isVenuesExhibitorsInvalid = true;
  savedEventId: number | undefined;
  private saveEventSub: Subscription | undefined;


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
    this.selectedFunction = changeEvent.nextId;
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
    private toaster: ToastrService,
  ) {
  }

  ngOnInit() {

    if (this.eventId) {
      this.getEventsById(1);
    }
    this.saveOnlySub = this.eventService.triggerSaveOnly.subscribe(() => {
      switch (this.selectedFunction) {
        case EventFunctionTypes.CLIENT:
        case EventFunctionTypes.EVENT_MANAGER:
          this.saveToDb(false);
          break;
        case EventFunctionTypes.VENUE:
          this.saveToDb({venueIndex: null, serviceIndex: null, shouldInvite: false});
          break;
        case EventFunctionTypes.SUPPLIERS:
          this.saveToDb({venueIndex: null, serviceIndex: null, shouldInvite: false});
          break;
        case EventFunctionTypes.EXHIBITORS:
          this.saveToDb({venueIndex: null, exhibitorIndex: null, shouldInvite: false});
          break;
      }
    });
  }

  getEventsById(tabType: any) {
    this.viewEvSrvc.getEventsByEventId(this.eventId, tabType).subscribe((res: any) => {

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





      if (tabType === 7) {
        this.eventTimelineSrvc.render.next();
      }
      if (tabType === 6) {
        this.eventService.fetchEventFilesSubject.next(this.data.eventData.eventId);
      }
    }, err => {

    })
  }

  deleteEvent(eventId: any) {
    this.viewEvSrvc.deleteEvent(eventId).subscribe((res: any) => {

      this.router.navigate(['/home']);
    }, err => {

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

  saveToDb(param: {
    venueIndex: number | null,
    serviceIndex?: number | null,
    exhibitorIndex?: number | null,
    shouldInvite: boolean
  } | boolean = {
    venueIndex: null,
    serviceIndex: null,
    exhibitorIndex: null,
    shouldInvite: false
  }): void {

    switch (this.selectedFunction) {
      case EventFunctionTypes.CLIENT:
        this.saveClient(typeof param === 'boolean' ? param : false);
        this.saveEvMgr(false);
        this.saveVenueCmp({index: null, shouldInvite: false});
        this.saveVenuesSuppliers({
          venueIndex: null, serviceIndex: null, shouldInvite: false
        });
        this.saveVenuesExhibitors({
          venueIndex: null, exhibitorIndex: null, shouldInvite: false
        });
        break;
      case EventFunctionTypes.EVENT_MANAGER:
        this.saveClient(false);
        this.saveEvMgr(typeof param === 'boolean' ? param : false);
        this.saveVenueCmp({index: null, shouldInvite: false});
        this.saveVenuesSuppliers({
          venueIndex: null, serviceIndex: null, shouldInvite: false
        });
        this.saveVenuesExhibitors({
          venueIndex: null, exhibitorIndex: null, shouldInvite: false
        });
        break;
      case EventFunctionTypes.VENUE:
        this.saveClient(false);
        this.saveEvMgr(false);
        if (typeof param !== 'boolean') {
          this.saveVenueCmp({index: param.venueIndex, shouldInvite: param.shouldInvite});
        }
        this.saveVenuesSuppliers({
          venueIndex: null, serviceIndex: null, shouldInvite: false
        });
        this.saveVenuesExhibitors({
          venueIndex: null, exhibitorIndex: null, shouldInvite: false
        });
        break;
      case EventFunctionTypes.SUPPLIERS:
        this.saveClient(false);
        this.saveEvMgr(false);
        this.saveVenueCmp({index: null, shouldInvite: false});
        if (typeof param !== 'boolean') {
          this.saveVenuesSuppliers({
            venueIndex: param.venueIndex, serviceIndex: param.serviceIndex, shouldInvite: param.shouldInvite
          });
        }
        this.saveVenuesExhibitors({
          venueIndex: null, exhibitorIndex: null, shouldInvite: false
        });
        break;
      case EventFunctionTypes.EXHIBITORS:
        this.saveClient(false);
        this.saveEvMgr(false);
        this.saveVenueCmp({index: null, shouldInvite: false});
        this.saveVenuesSuppliers({
          venueIndex: null, serviceIndex: null, shouldInvite: false
        });
        if (typeof param !== 'boolean') {
          this.saveVenuesExhibitors({
            venueIndex: param.venueIndex, exhibitorIndex: param.exhibitorIndex, shouldInvite: param.shouldInvite
          });
        }
    }

    if (!this.isEventClientInvalid && !this.isEventMgrInvalid && !this.isEventVenuesInvalid &&
      !this.isVenuesSuppliersInvalid && !this.isVenuesExhibitorsInvalid) {
      this.postProcessVenues();
      this.saveEventSub = this.eventService.saveToDb(this.eventToBeSaved).subscribe(
        value => {
          if (value) {
            this.toaster.success('Continue with saving event files', 'Event saved successfully');
            this.savedEventId = value.data.eventId;
            /*this.router.navigateByUrl('/home', {skipLocationChange: true}).then(() => {
              this.router.navigate(['/home/event/create']);
            });*/
            this.active = 6;
            this.eventService.fetchEventFilesSubject.next(this.savedEventId);
            this.eventService.hideInfoBar = true;
          }
        },
        error => {
          devLogger('error', {saveEventError: error});
        }, () => {
        }
      );
    }

  }

  saveClient(shouldInvite: boolean): void {
    if (this.isEventClientValid()) {
      if (!(this.clientCompany instanceof InviteFnCmpClass) && (this.clientCompany as Company).id) {
        const contactList = this.clientContactList?.map(cnt => {
          return {
            id: cnt.id,
            email: cnt.email,
            firstName: cnt.firstName,
            contactLabelId: cnt.contactLabelId
          };
        }) || null;
        this.eventToBeSaved.client = {
          id: (this.clientCompany as Company).id,
          contacts: contactList,
          shouldInvite: shouldInvite ? 1 : 0,
          isOwnCompany: false,
          invited: null,
        };

      } else {
        this.eventToBeSaved.client = {
          id: null,
          contacts: null,
          shouldInvite: shouldInvite ? 1 : 0,
          isOwnCompany: false,
          invited: (this.clientCompany as InviteFnCmpClass),
        };

      }
      devLogger('log', {event: this.eventToBeSaved});


    }
  }

  saveEvMgr(shouldInvite: boolean): void {
    if (this.isEventMangerValid()) {
      if (!(this.eventMgrCmp instanceof InviteFnCmpClass) && (this.eventMgrCmp as Company).id) {
        const contactList = this.eventMgrContactList?.map(cnt => {
          return {
            id: cnt.id,
            email: cnt.email,
            firstName: cnt.firstName,
            contactLabelId: cnt.contactLabelId
          };
        }) || null;
        this.eventToBeSaved.eventManager = {
          id: (this.eventMgrCmp as Company).id,
          contacts: contactList,
          shouldInvite: shouldInvite ? 1 : 0,
          isOwnCompany: false,
          invited: null,
          requirements: this.eventToBeSaved.eventManager?.requirements || ''
        };

      } else {
        this.eventToBeSaved.eventManager = {
          id: null,
          contacts: null,
          shouldInvite: shouldInvite ? 1 : 0,
          isOwnCompany: false,
          invited: (this.eventMgrCmp as InviteFnCmpClass),
          requirements: this.eventToBeSaved.eventManager?.requirements || ''
        };

      }
      devLogger('log', {event: this.eventToBeSaved});

    }
  }

  saveVenueCmp(event: { index: number | null; shouldInvite: boolean }): void {
    if (this.isVenuesValid()) {
      if (this.venueCompanies && this.venueCompanies.length > 0) {
        // @ts-ignore
        for (let i = 0; i < this.venueCompanies?.length; i++) {
          // @ts-ignore
          if (!(this.venueCompanies[i] instanceof InviteFnCmpClass) && (this.venueCompanies[i] as Company).id) {
            const contactList = this.venueContactLists[i]?.map(cnt => {
              return {
                id: cnt.id,
                email: cnt.email,
                firstName: cnt.firstName,
                contactLabelId: cnt.contactLabelId
              };
            }) || null;
            // @ts-ignore
            this.eventToBeSaved.venues.list[i].companyId = (this.venueCompanies[i] as Company).id;
            // tslint:disable-next-line:no-non-null-assertion
            this.eventToBeSaved.venues!.list[i].shouldInvite = event.index === i && event.shouldInvite ? 1 : 0;
            // tslint:disable-next-line:no-non-null-assertion
            this.eventToBeSaved.venues!.list[i].invited = null;
            // tslint:disable-next-line:no-non-null-assertion
            this.eventToBeSaved.venues!.list[i].contacts = contactList;

          } else {
            // tslint:disable-next-line:no-non-null-assertion
            this.eventToBeSaved.venues!.list[i].companyId = null;
            // tslint:disable-next-line:no-non-null-assertion
            this.eventToBeSaved.venues!.list[i].contacts = null;
            // tslint:disable-next-line:no-non-null-assertion
            this.eventToBeSaved.venues!.list[i].shouldInvite = event.index === i && event.shouldInvite ? 1 : 0;
            // tslint:disable-next-line:no-non-null-assertion
            this.eventToBeSaved.venues!.list[i].invited = (this.venueCompanies[i] as InviteFnCmpClass);
          }
        }
      } else {
        this.eventToBeSaved.venues = null;
      }
    }

  }

  saveVenuesSuppliers(param: { venueIndex: number | null, serviceIndex: number | null | undefined, shouldInvite: boolean }): void {
    if (this.isVenuesSuppliersValid()) {
      if (this.eventToBeSaved.venues?.list) {
        let i = 0;
        for (const venuesList of this.eventToBeSaved.venues?.list) {
          const services = venuesList.suppliers[0]?.services;
          let j = 0;
          if (!services || !Array.isArray(services)) {
            break;
          }
          for (const service of services) {
            if (param.venueIndex === i && param.serviceIndex === j && param.shouldInvite) {
              service.shouldInvite = 1;
            } else {
              service.shouldInvite = 0;
            }
            j++;
          }
          i++;
        }
        devLogger('log', {beforeFilterVenSupp: this.eventToBeSaved.venues?.list});
        for (const venuesList of this.eventToBeSaved.venues?.list) {
          const services = venuesList.suppliers[0]?.services;
          if (services) {
            venuesList.suppliers[0].services = venuesList.suppliers[0]?.services
              .filter(supplierCmp => supplierCmp.companyId !== null || supplierCmp.invited !== null);
          }
          if (venuesList.suppliers[0] &&
            (!venuesList.suppliers[0].services || venuesList.suppliers[0].services.length === 0)) {
            venuesList.suppliers = [];
          }
        }
      }

      devLogger('log', {eventAfterVenuesSupplier: this.eventToBeSaved});
    }
  }

  saveVenuesExhibitors(param: { venueIndex: number | null, exhibitorIndex: number | null | undefined, shouldInvite: boolean }): void {
    if (this.isVenuesExhibitorsValid()) {
      if (this.eventToBeSaved.venues?.list) {
        if (!this.eventToBeSaved.hasExhibitors) {
          for (const venuesList of this.eventToBeSaved.venues?.list) {
            venuesList.exhibitorList = [];
          }
          return;
        }
        let i = 0;
        for (const venuesList of this.eventToBeSaved.venues?.list) {
          const exhibitors = venuesList.exhibitorList[0]?.exhibitors;
          let j = 0;
          if (!exhibitors || !Array.isArray(exhibitors)) {
            break;
          }
          for (const exhibitor of exhibitors) {
            if (param.venueIndex === i && param.exhibitorIndex === j && param.shouldInvite) {
              exhibitor.shouldInvite = 1;
            } else {
              exhibitor.shouldInvite = 0;
            }
            j++;
          }
          i++;
        }
        devLogger('log', {beforeFilterVenExh: this.eventToBeSaved.venues?.list});
        for (const venuesList of this.eventToBeSaved.venues?.list) {
          const exhibitors = venuesList.exhibitorList[0]?.exhibitors;
          if (exhibitors) {
            venuesList.exhibitorList[0].exhibitors = venuesList.exhibitorList[0]?.exhibitors
              .filter(exhibitorCmp => exhibitorCmp.companyId !== null || exhibitorCmp.invited !== null);
          }
          if (venuesList.exhibitorList[0] &&
            (!venuesList.exhibitorList[0].exhibitors || venuesList.exhibitorList[0].exhibitors.length === 0)) {
            venuesList.exhibitorList = [];
          }
        }
      }

      devLogger('log', {eventAfterVenuesExh: this.eventToBeSaved});
    }
  }

  private postProcessVenues(): void {
    devLogger('log', {preProcessingVenues: cloneDeep(this.eventToBeSaved.venues)});
    if (this.eventToBeSaved.venues) {
      this.eventToBeSaved.venues.list = this.eventToBeSaved.venues.list
        .filter(venueCmp => venueCmp.companyId !== null || venueCmp.invited !== null);
    }
    devLogger('log', {postProcessingVenues: cloneDeep(this.eventToBeSaved.venues)});
  }


  private isEventClientValid(): boolean {
    if (!this.clientCompany) {
      this.toaster.error('Please select a client company');
      this.isEventClientInvalid = true;
      return false;
    }
    if (this.clientCompany &&
      !(this.clientCompany instanceof InviteFnCmpClass) &&
      this.clientContactList?.length === 0) {
      this.toaster.error('Please select or invite at-least one contact for the client company');
      this.isEventClientInvalid = true;
      return false;
    }
    devLogger('log', {clientComapny: this.clientCompany, contactList: this.clientContactList});

    if (this.eventToBeSaved.title.trim().length === 0) {
      this.toaster.error('Event title is required');
      this.isEventClientInvalid = true;
      return false;
    }
    this.isEventClientInvalid = false;
    return true;
  }

  private isEventMangerValid(): boolean {
    if (!this.eventMgrCmp) {
      this.toaster.error('Please select event manager company');
      this.isEventMgrInvalid = true;
      return false;
    }
    if (this.eventMgrCmp &&
      !(this.eventMgrCmp instanceof InviteFnCmpClass) &&
      this.eventMgrContactList.length === 0) {
      this.toaster.error('Please select or invite at-least one contact for the event manager company');
      this.isEventMgrInvalid = true;
      return false;
    }
    devLogger('log', {eventMgrCmp: this.eventMgrCmp, contactList: this.eventMgrContactList});
    this.isEventMgrInvalid = false;
    return true;
  }

  private isVenuesValid(): boolean {
    if (this.venueCompanies && this.venueCompanies.length > 0) {
      /*
      * clean venue companies and there corresponding contacts
      * which are removed i.e venueCompany===null
       */
      for (let i = 0; i < this.venueCompanies.length; i++) {
        if (this.venueCompanies[i] === null) {
          this.venueContactLists.splice(i, 1);
          devLogger('log', {[`eventToBeSaved.venues?.list[${i}]`]: cloneDeep(this.eventToBeSaved.venues?.list[i])});
          this.eventToBeSaved.venues?.list.splice(i, 1);
        }else{
          devLogger('log', {[`eventToBeSaved.venues?.list[${i}]`]: cloneDeep(this.eventToBeSaved.venues?.list[i])});
        }
      }
      this.venueCompanies = this.venueCompanies.filter(vc => vc !== null);
    }

    if (this.venueCompanies && this.venueCompanies.length > 0) {
      for (let i = 0; i < this.venueCompanies.length; i++) {
        if (this.venueCompanies[i] instanceof InviteFnCmpClass) {
          continue;
        }
        if (!this.venueContactLists[i] || (this.venueContactLists[i] && this.venueContactLists[i].length === 0)) {
          this.toaster.error('Please select contacts for assigned selected venue companies');
          this.isEventVenuesInvalid = true;
          return false;
        }
      }
    } else {
      this.isEventVenuesInvalid = false;
      return true;
    }
    this.isEventVenuesInvalid = false;
    return true;
  }

  private isVenuesSuppliersValid(): boolean {
    if (this.eventToBeSaved.venues && this.eventToBeSaved.venues.list.length > 0) {
      const venuesList = this.eventToBeSaved.venues.list;
      for (let i = 0; i < venuesList.length; i++) {
        const venueServices = venuesList[i].suppliers[0]?.services || null;
        if (venueServices && venueServices.length > 0) {
          let j = 0;
          for (const venueService of venueServices) {
            if (venueService.companyId === null) {
              continue;
            }
            if (!venueService.contacts || (venueService.contacts && venueService.contacts.length <= 0)) {
              this.toaster.error('Please select contacts for assigned selected supplier company',
                `Venue ${i + 1}, Service ${j + 1}: ${venueService.name}`);
              this.isVenuesSuppliersInvalid = true;
              return false;
            }
            j++;
          }
        }
      }
    } else {
      this.isVenuesSuppliersInvalid = false;
      return true;
    }
    this.isVenuesSuppliersInvalid = false;
    return true;
  }

  private isVenuesExhibitorsValid(): boolean {
    if (this.eventToBeSaved.hasExhibitors) {
      if (this.eventToBeSaved.venues && this.eventToBeSaved.venues.list.length > 0) {
        const venuesList = this.eventToBeSaved.venues.list;
        for (let i = 0; i < venuesList.length; i++) {
          const venueExhibitors = venuesList[i].exhibitorList[0]?.exhibitors || null;
          if (venueExhibitors && venueExhibitors.length > 0) {
            let j = 0;
            for (const venueExhibitor of venueExhibitors) {
              if (venueExhibitor.companyId === null) {
                continue;
              }
              if (!venueExhibitor.contacts || (venueExhibitor.contacts && venueExhibitor.contacts.length <= 0)) {
                this.toaster.error('Please select contacts for assigned selected exhibitor company',
                  `Venue ${i + 1}, Exhibitor ${j + 1}: ${venueExhibitor.name}`);
                this.isVenuesExhibitorsInvalid = true;
                return false;
              }
              j++;
            }
          }
        }
      } else {
        this.isVenuesExhibitorsInvalid = false;
        return true;
      }
    }
    this.isVenuesExhibitorsInvalid = false;
    return true;
  }

  ngOnDestroy(): void {
    // this.userSettingsSub?.unsubscribe();
    // this.isOwnCompanySub?.unsubscribe();
    this.saveEventSub?.unsubscribe();
    this.saveOnlySub?.unsubscribe();
  }

}
