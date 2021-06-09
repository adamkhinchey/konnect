import {AfterViewInit, Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {NgbModal, NgbModalRef, NgbNavChangeEvent} from '@ng-bootstrap/ng-bootstrap';
import {EventPanelNavComponent} from '../event-panel-nav/event-panel-nav.component';
import {Company} from '../../../users/models';
import {EventFunctionTypes} from '../../models/types';
import {FnCmpCntInterface, InviteFnCmpCntInterface, InviteFnCmpInterface} from '../../models/interfaces';
import {InviteFnCmpClass} from '../../models/classes';
import {SaveEventClass} from '../../models/classes/saveEvent.class';
import {ToastrService} from 'ngx-toastr';
import {devLogger} from '../../../../shared/utils';
import {UserSettingsService} from '../../../../shared/services';
import {UserSettingsInterface} from '../../../../shared/models';
import {Subscription} from 'rxjs';
import {AuthService} from '../../../../core/services/auth.service';
import {EventService} from '../../services/event.service';
import {EventAssignFunctionCmpComponent} from '../event-assign-function-cmp/event-assign-function-cmp.component';
import {EventVenueFunctionComponent} from '../event-venue-function/event-venue-function.component';
import {Router} from '@angular/router';
import {EventSuppliersFunctionComponent} from '../event-suppliers-function/event-suppliers-function.component';
import {EventExhibitorsFunctionComponent} from '../event-exhibitors-function/event-exhibitors-function.component';
import {EventTimelineService} from '../../services/event-timeline.service';
import {cloneDeep} from "lodash-es";

@Component({
  selector: 'app-create-event',
  templateUrl: './create-event.component.html',
  styleUrls: ['./create-event.component.scss']
})
export class CreateEventComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('app-event-panel-nav') eventPanelNav: EventPanelNavComponent | undefined;
  @ViewChild('venueFn') venueFn: EventVenueFunctionComponent | undefined;
  @ViewChild('suppliersFn') suppliersFn: EventSuppliersFunctionComponent | undefined;
  @ViewChild('exhibitorsFn') exhibitorsFn: EventExhibitorsFunctionComponent | undefined;
  active = 1;
  disabled = true;
  modalReference: NgbModalRef | undefined;
  eventToBeSaved = new SaveEventClass();
  // TODO remove this hard coded saved eventId
  savedEventId: number | undefined;
  updateFnCmpToSelf: Map<EventFunctionTypes, boolean | boolean[] | null> = this.eventService.setIsFnOwnCompany.getValue();
  selectedFunction: EventFunctionTypes = this.active;
  isFnCmpInvited: boolean | undefined;
  private userSettingsSub: Subscription | undefined;
  defaultCompany: any;
  private isOwnCompanySub: Subscription | undefined;
  private saveEventSub: Subscription | undefined;
  private saveOnlySub: Subscription | undefined;

  clientCompany: Company | InviteFnCmpInterface | undefined | null;
  clientContactList: FnCmpCntInterface[] = [];
  isEventClientInvalid = true;

  eventMgrCmp: Company | InviteFnCmpInterface | undefined | null;
  eventMgrContactList: FnCmpCntInterface[] = [];
  isEventMgrInvalid = true;

  venueCompanies: Array<Company | InviteFnCmpInterface | null> | undefined | null = [];
  venueContactLists: Array<Array<FnCmpCntInterface>> = [];
  isEventVenuesInvalid = true;

  isVenuesSuppliersInvalid = true;
  isVenuesExhibitorsInvalid = true;


  constructor(
    private modalService: NgbModal,
    private toaster: ToastrService,
    private userSettings: UserSettingsService,
    private authService: AuthService,
    private eventService: EventService,
    private router: Router,
    private eventTimelineService: EventTimelineService) {
  }

  ngOnInit(): void {
    this.eventService.reset();
    this.userSettingsSub = this.userSettings.settings.subscribe((value: UserSettingsInterface) => {
      this.defaultCompany = value.defaultCompany;
      this.eventToBeSaved.createrUserId = this.authService.getUserInfo().id;
      this.eventToBeSaved.creatorFromCompanyId = this.defaultCompany.id;
      this.setFnCompanyToSelf(this.defaultCompany);
    });
    this.isOwnCompanySub = this.eventService.setIsFnOwnCompany.subscribe(status => {
      this.updateFnCmpToSelf = status;
      devLogger('log', {createEvent: status});
      if (this.defaultCompany) {
        this.setFnCompanyToSelf(this.defaultCompany);
      }
    });

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

  ngAfterViewInit(): void {
    /*this.venueAssignCmp?.forEach((component, index) => {
      if (this.venueCompanies && this.venueCompanies.length > 0) {
        component.selectedCompany = this.venueCompanies[index];
      }
    });*/
  }


  onNavChange(changeEvent: NgbNavChangeEvent): void {
    this.selectedFunction = changeEvent.nextId;
    // null means navigated to first time
    if (this.updateFnCmpToSelf.get(this.selectedFunction) === null) {
      const tempMap = new Map(this.eventService.setIsFnOwnCompany.getValue());
      tempMap.set(this.selectedFunction, true);
      this.eventService.setIsFnOwnCompany.next(tempMap);
    }

    if (changeEvent.nextId === EventFunctionTypes.TIMELINE) {
      this.eventTimelineService.render.next();
    }

    if (changeEvent.nextId === EventFunctionTypes.TIMELINE || changeEvent.nextId === EventFunctionTypes.FILES) {
      this.eventService.hideInfoBar = true;
    } else {
      this.eventService.hideInfoBar = false;
    }

  }

  toggleDisabled(): void {
    this.disabled = !this.disabled;
    if (this.disabled) {
      this.active = 1;
    }
  }


  openVerticallyCentered(content: any): void {
    this.modalReference = this.modalService.open(content, {
      centered: true,
      size: 'lg',
    });

  }


  private setFnCompanyToSelf(defaultCompany: any): void {
    if (defaultCompany && defaultCompany.id) {
      switch (this.selectedFunction) {
        case EventFunctionTypes.CLIENT:
          if (this.updateFnCmpToSelf.get(EventFunctionTypes.CLIENT)) {
            this.clientContactList = [];
            this.clientCompany = defaultCompany;
            this.eventToBeSaved.client = {
              id: (this.clientCompany as Company).id,
              isOwnCompany: true,
              invited: null,
              shouldInvite: 1,
              contacts: null
            };
          } else if (!this.updateFnCmpToSelf.get(EventFunctionTypes.CLIENT)) {
            this.unsetFnCompanyToSelf();
          }
          return;
        case EventFunctionTypes.EVENT_MANAGER:
          if (this.updateFnCmpToSelf.get(EventFunctionTypes.EVENT_MANAGER)) {
            this.eventMgrContactList = [];
            this.eventMgrCmp = defaultCompany;
            this.eventToBeSaved.eventManager = {
              id: (this.eventMgrCmp as Company).id,
              isOwnCompany: true,
              invited: null,
              shouldInvite: 1,
              contacts: null,
              requirements: ''
            };
          } else {
            this.unsetFnCompanyToSelf();
          }
          return;
        default:
          return;
      }
    }
  }

  private unsetFnCompanyToSelf(): void {
    switch (this.selectedFunction) {
      case EventFunctionTypes.CLIENT:
        this.clientContactList = [];
        this.clientCompany = null;
        return;
      case EventFunctionTypes.EVENT_MANAGER:
        this.eventMgrCmp = null;
        this.eventMgrContactList = [];
        return;
    }
  }

  searchInviteContactModalClosed(): void {
    this.modalReference?.close();
  }

  searchInviteCompanyClosed(): void {
    this.modalReference?.close();
  }

  setSelectedCompany(company: Company | InviteFnCmpClass): void {
    let isInvitedCompany = false;
    switch (this.selectedFunction) {
      case EventFunctionTypes.CLIENT:
        this.clientCompany = company;
        isInvitedCompany = company instanceof InviteFnCmpClass;
        this.eventToBeSaved.client = {
          id: !isInvitedCompany ? (this.clientCompany as Company).id : null,
          isOwnCompany: isInvitedCompany ? false : (this.clientCompany as Company).id === this.defaultCompany.id || !!this.updateFnCmpToSelf.get(EventFunctionTypes.CLIENT),
          invited: isInvitedCompany ? (company as InviteFnCmpClass) : null,
          shouldInvite: isInvitedCompany ? null : 1,
          contacts: null,
        };
        break;
      case EventFunctionTypes.EVENT_MANAGER:
        this.eventMgrCmp = company;
        isInvitedCompany = company instanceof InviteFnCmpClass;
        this.eventToBeSaved.eventManager = {
          id: !isInvitedCompany ? (this.eventMgrCmp as Company).id : null,
          isOwnCompany: isInvitedCompany ? false : (this.eventMgrCmp as Company).id === this.defaultCompany.id || !!this.updateFnCmpToSelf.get(EventFunctionTypes.EVENT_MANAGER),
          invited: isInvitedCompany ? (company as InviteFnCmpClass) : null,
          shouldInvite: isInvitedCompany ? null : 1,
          contacts: null,
          requirements: ''
        };
        break;
      case EventFunctionTypes.VENUE:
        const activatedVenuePanelIndex = this.eventService.activeVenuePanelIndex;
        if (activatedVenuePanelIndex !== null && this.venueCompanies) {
          devLogger('log', activatedVenuePanelIndex);
          devLogger('log', {venueCompanies: this.venueCompanies});
          if (this.venueCompanies.length - 1 < activatedVenuePanelIndex) {
            for (let i = this.venueCompanies.length; i < activatedVenuePanelIndex; i++) {
              /*
               * fill the missing with null
               * example if venueCompanies=[0,1] && activeVenuePanelIndex=4
               * then after loop venuesCompanies=[0,1,null,null]
               */
              this.venueCompanies.push(null);
            }
          }

          this.venueCompanies?.splice(activatedVenuePanelIndex, 1, company);
          devLogger('log', {venueCompanies: this.venueCompanies});
          // @ts-ignore
          this.venueFn?.venueAssignCmp.get(activatedVenuePanelIndex).setSelectedCompany(company);
          this.setSelectedFnCompanyContacts([]);
          devLogger('log', {venueCompaniesContactList: this.venueContactLists[activatedVenuePanelIndex]});
        }
        break;
      case EventFunctionTypes.SUPPLIERS:
        this.eventService.supplierCompanyAdded(company);
        break;
      case EventFunctionTypes.EXHIBITORS:
        this.eventService.exhibitorCompanyAdded(company);
        break;
      case EventFunctionTypes.FILES:
        break;
      case EventFunctionTypes.TIMELINE:
        break;
      default:
        break;
    }
    this.searchInviteCompanyClosed();
  }

  setOpenedModalRef(event: NgbModalRef): void {
    this.modalReference = event;
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
          isOwnCompany: !!this.eventToBeSaved.client?.isOwnCompany,
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

  unsetClientCompany(): void {
    const clientCompanyInstOfInviteFnCmp = this.clientCompany instanceof InviteFnCmpClass;
    const wasOwnCompany = !clientCompanyInstOfInviteFnCmp && (this.clientCompany as Company).id === this.defaultCompany.id;
    this.clientCompany = null;
    this.clientContactList = [];
    this.eventToBeSaved.client = null;
    if (wasOwnCompany) {
      const tempMap = new Map(this.eventService.setIsFnOwnCompany.getValue());
      tempMap.set(EventFunctionTypes.CLIENT, !tempMap.get(EventFunctionTypes.CLIENT));
      this.eventService.setIsFnOwnCompany.next(tempMap);
    }
  }

  removeContact(index: number, jIndex: number | null = null): void {
    switch (this.selectedFunction) {
      case EventFunctionTypes.CLIENT:
        this.clientContactList?.splice(index, 1);
        return;
      case EventFunctionTypes.EVENT_MANAGER:
        this.eventMgrContactList.splice(index, 1);
        return;
      case EventFunctionTypes.VENUE:
        if (typeof jIndex === 'number') {
          this.venueContactLists[index].splice(jIndex, 1);
          // @ts-ignore
          const venueAssignCmpCnt = this.venueFn?.venueAssignCmp.get(index);
          if (venueAssignCmpCnt) {
            venueAssignCmpCnt.setContactList(this.venueContactLists[index]);
          }
        }
        return;
      default:
        return;
    }
  }

  unsetEvMgrCmp(): void {
    const eventMgrCmpInstOfInviteCmpCls = this.eventMgrCmp instanceof InviteFnCmpClass;
    const wasOwnCompany = !eventMgrCmpInstOfInviteCmpCls && (this.eventMgrCmp as Company).id === this.defaultCompany.id;
    this.eventMgrCmp = null;
    this.eventMgrContactList = [];
    this.eventToBeSaved.eventManager = null;
    if (wasOwnCompany) {
      const tempMap = new Map(this.eventService.setIsFnOwnCompany.getValue());
      tempMap.set(EventFunctionTypes.EVENT_MANAGER, !tempMap.get(EventFunctionTypes.EVENT_MANAGER));
      this.eventService.setIsFnOwnCompany.next(tempMap);
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
          isOwnCompany: !!this.eventToBeSaved.eventManager?.isOwnCompany,
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


  unsetVenueCmp(index: number): void {
    this.venueCompanies?.splice(index, 1, null);
    this.venueCompanies = this.venueCompanies?.slice(0);
    this.venueContactLists[index] = [];
    this.venueContactLists = this.venueContactLists.slice(0);
    if (this.venueFn?.venueAssignCmp && this.venueFn?.venueAssignCmp.get(index)) {
      // @ts-ignore
      this.venueFn?.venueAssignCmp.get(index)?.removeSelectedCompany();
      this.venueFn?.venueAssignCmp.get(index)?.removeContactList();
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
            this.toaster.success('Event saved successfully');
            this.savedEventId = value.data.eventId;
            this.router.navigateByUrl('/home');
            /* block below opens files tab and disabled other tabs after post event creation*/
            /*this.active = 6;
            this.eventService.fetchEventFilesSubject.next(this.savedEventId);
            this.eventService.hideInfoBar = true;*/
          }
        },
        error => {
          devLogger('error', {saveEventError: error});
        }, () => {
        }
      );
    }

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
        } else {
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
    this.userSettingsSub?.unsubscribe();
    this.isOwnCompanySub?.unsubscribe();
    this.saveEventSub?.unsubscribe();
    this.saveOnlySub?.unsubscribe();
  }

}
