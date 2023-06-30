import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, OnInit, ViewChild, HostListener } from '@angular/core';
import { NgbModal, NgbModalRef, NgbNavChangeEvent, NgbPanelChangeEvent } from '@ng-bootstrap/ng-bootstrap';
import { EventPanelNavComponent } from '../event-panel-nav/event-panel-nav.component';
import { Company } from '../../../users/models';
import { EventFunctionTypes } from '../../models/types';
import {
  FnCmpCntInterface,
  InviteFnCmpCntInterface,
  InviteFnCmpInterface,
  VenueListItemInterface
} from '../../models/interfaces';
import { InviteFnCmpClass } from '../../models/classes';
import { SaveEventClass } from '../../models/classes/saveEvent.class';
import { ToastrService } from 'ngx-toastr';
import { devLogger } from '../../../../shared/utils';
import { UserSettingsService } from '../../../../shared/services';
import { UserSettingsInterface } from '../../../../shared/models';
import { Subscription } from 'rxjs';
import { AuthService } from '../../../../core/services/auth.service';
import { EventService } from '../../services/event.service';
import { EventAssignFunctionCmpComponent } from '../event-assign-function-cmp/event-assign-function-cmp.component';
import { EventVenueFunctionComponent } from '../event-venue-function/event-venue-function.component';
import { ActivatedRoute, NavigationStart, Router } from '@angular/router';
import { EventSuppliersFunctionComponent } from '../event-suppliers-function/event-suppliers-function.component';
import { EventExhibitorsFunctionComponent } from '../event-exhibitors-function/event-exhibitors-function.component';
import { EventTimelineService } from '../../services/event-timeline.service';
import { cloneDeep } from 'lodash-es';
import { ViewEventService } from '../../services/view-event.service';
import * as _ from 'lodash';
import * as moment from 'moment'
import { analyzeAndValidateNgModules } from '@angular/compiler';
import { EventslistingService } from 'src/app/features/users/services/eventslisting.service';
import { VenuueCompany } from '../create-event/create-event.component';

@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.scss'],
})
export class OverviewComponent implements OnInit {
  events: any;
  eventsCopy: any;
  ngbAccordion:any;
  panels = ['First', 'Second', 'Third'];
  data: any;
  active = 1;
  isPast=false;
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
   eventId: any;
  eventMgrCmp: Company | InviteFnCmpInterface | undefined | null;
  eventMgrContactList: FnCmpCntInterface[] = [];
  isEventMgrInvalid = true;

  venueCompanies: Array<Company | InviteFnCmpInterface | VenuueCompany | null> | undefined | null = [];
  venueContactLists: Array<Array<FnCmpCntInterface>> = [];
  isEventVenuesInvalid = true;

  isVenuesSuppliersInvalid = true;
  isVenuesExhibitorsInvalid = true;

  isEditEvents: boolean = false;
  isSaveDisable: boolean = false;

  permissionObj = { isCrew: false, isClient: false, isEventManager: false, isService: false, isVenue: false, isExhibitor: false, clientAccessPermission: false };
  public isClientEditable = false;
  public isManagerEditable = false;
  public isVenueEditable = false;
  public isServiceEditable = false;
  public isExhibitorEditable = false;
  public eventDataCopy: Partial<SaveEventClass> = new SaveEventClass();
  public supplierCount: number = 0;
  public exhibitorCount: number = 0;
  public emitedCrew: number = 0;

  isSticky: boolean = false;
  isEmailVerified: boolean | undefined = false;
  constructor(
    public evntSrvc: EventslistingService,
    public toaster: ToastrService,
    public userSettings: UserSettingsService,
    public authService: AuthService,
    public eventService: EventService,
    public router: Router,
    public route: ActivatedRoute,
    public eventTimelineService: EventTimelineService,
    public viewEvSrvc: ViewEventService,
    public _cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() : void{
  
    this.userSettingsSub = this.userSettings.settings.subscribe((value: UserSettingsInterface) => {
      this.defaultCompany = value.defaultCompany;
      this.eventToBeSaved.createrUserId = this.authService.getUserInfo().id;
      this.eventToBeSaved.creatorFromCompanyId = this.defaultCompany.id;
      this.isEmailVerified = value.isEmailVerified;
      switch (this.selectedFunction) {
        case EventFunctionTypes.CLIENT:
          if (this.defaultCompany && this.data?.eventData?.client?.isOwnCompany === 1 && this.updateFnCmpToSelf.get(EventFunctionTypes.CLIENT)) {
            this.setFnCompanyToSelf(this.defaultCompany);
          } else if (this.data?.eventData?.client?.isOwnCompany === 0 && this.updateFnCmpToSelf.get(EventFunctionTypes.CLIENT)) {
            this.unsetFnCompanyToSelf();
          }
          break;
        case EventFunctionTypes.EVENT_MANAGER:
          if (this.defaultCompany && this.data?.eventData?.eventManager?.isOwnCompany === 1 && this.updateFnCmpToSelf.get(EventFunctionTypes.EVENT_MANAGER)) {
            this.setFnCompanyToSelf(this.defaultCompany);
          } else if (this.data?.eventData?.eventManager?.isOwnCompany === 0 && this.updateFnCmpToSelf.get(EventFunctionTypes.EVENT_MANAGER)) {
            this.unsetFnCompanyToSelf();
          }
          break;
      }
    });


    this.isOwnCompanySub = this.eventService.setIsFnOwnCompany.subscribe(status => {
      this.updateFnCmpToSelf = status;
      switch (this.selectedFunction) {
        case EventFunctionTypes.CLIENT:
          if (this.defaultCompany && this.data?.eventData?.client?.isOwnCompany === 1) {
            this.setFnCompanyToSelf(this.defaultCompany);
          } else if (this.data?.eventData?.client?.isOwnCompany === 0) {
            this.unsetFnCompanyToSelf();
          }
          break;
        case EventFunctionTypes.EVENT_MANAGER:
          if (this.defaultCompany && this.data?.eventData?.eventManager?.isOwnCompany === 1) {
            this.setFnCompanyToSelf(this.defaultCompany);
          } else if (this.data?.eventData?.eventManager?.isOwnCompany === 0) {
            this.unsetFnCompanyToSelf();
          }
          break;
      }
    });
    this.getEvents();
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
              requirements: '',
              emInternalNotes: ''
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

  getEvents() {
    this.evntSrvc.getEventsList(0).subscribe((res: any) => {

      this.events = res;
      this.eventsCopy = this.events;
    }, err => {

    })
  };

  id:any="";



  checkIsSame(startDate: any, endDate: any) {
    if (startDate && endDate) {
      let StartDate = moment(startDate).format('YYYY-MM-DD');
      let EndDate = moment(endDate).format('YYYY-MM-DD');
      if (moment(StartDate).isSame(EndDate)) {
        return true;
      } else {
        return false;
      }
    }
    return;
  };

  aacordia(ids:any) {
    
    if(this.id==ids){
      this.id="";
    }
    else{
      this.id=ids;
     
    }
    this.eventId=ids;
    this.getEventsById(ids);
    this.selectedFunction = ids;
    this.isClientEditable = false;
    this.isManagerEditable = false;
    this.isVenueEditable = false;
    this.isServiceEditable = false;
    this.isExhibitorEditable = false;
    this.eventService.isEdit = false;
    this.eventService.isSaveDisabled = false;
    this.eventService.isNotesEdit = false;
   
    this.active = ids;
    // null means navigated to first time
    if (this.updateFnCmpToSelf.get(this.selectedFunction) === null) {
      const tempMap = new Map(this.eventService.setIsFnOwnCompany.getValue());
      tempMap.set(this.selectedFunction, true);
      this.eventService.setIsFnOwnCompany.next(tempMap);
    }
    if (ids === EventFunctionTypes.TIMELINE) {
      this.eventTimelineService.render.next();
    }
    if (ids === EventFunctionTypes.TIMELINE || ids.nextId === EventFunctionTypes.FILES) {
      this.eventService.hideInfoBar = true;

    } else {
      this.eventService.hideInfoBar = false;
    }
  };

  getEventsById(tabType: any) {
  
   
    this.viewEvSrvc.getEventsByEventId(this.eventId, tabType, this.defaultCompany.id).subscribe((res: any) => {
  
      if (res && res.eventData) {
        console.log("resfsfsf insiade+++++",res)
        if (tabType === 1) {
          this.data.eventData = res.eventData;
          if (this.data && this.data.eventData && this.data.eventData.client) {
            const tempMap = new Map<EventFunctionTypes, null | boolean | boolean[]>(this.eventService.setIsFnOwnCompany.getValue());
            tempMap.set(EventFunctionTypes.CLIENT, this.data.eventData.client.isOwnCompany === 1);
            this.eventService.setIsFnOwnCompany.next(tempMap);
            this.clientCompany = ({
              id: this.data.eventData.client.companyId,
              companyName: this.data.eventData.client.clientCompanyName,
              city: this.data.eventData.client.clientCompanyCity,
              phone: this.data.eventData.client.clientCompanyPhone,
              companyProfileImage: this.data.eventData.client.clientCompanyProfileImage,
              state: this.data.eventData.client.clientCompanyState || null,
              website: this.data.eventData.client.clientCompanyWebsite,
              companyTaxNumber: '',
              streetAddress1: this.data.eventData.client.streetAddress1 || null,
              streetAddress2: this.data.eventData.client.streetAddress2 || null,
              countryId: 0,
              postcode: '',
              description: '',
              createdDate: '',
              updatedDate: '',
              companyUID: '',
              companyType: '',
              canClaim: 0,
              canJoin: 0,
              isPrivate: this.data.eventData.client.isPrivate || 0,
              isSeed: this.data.eventData.client.isSeed || 0
            } as Company);
            this.eventToBeSaved = ({
              title: this.data.eventData.title,
              description: this.data.eventData.description,
              hasExhibitors: this.data.eventData.hasExhibitors,
              creatorCompanyName: this.data.eventData.creatorCompanyName,
              eventCreatedDate: this.data.eventData.eventCreatedDate,
              createrUserId: this.data.eventData.createrUserId,
              creatorFromCompanyId: this.data.eventData.creatorFromCompanyId,
              client: {
                isOwnCompany: this.data.eventData.client.isOwnCompany,
                internalCmpNotes: this.data.eventData.client.internalCmpNotes
              }
            } as SaveEventClass);
            const contacts: any = this.data.eventData.client.contacts;
            for (let i = 0; i < contacts.length; i++) {
              this.clientContactList.push({
                id: contacts[i].id,
                email: contacts[i].email,
                firstName: contacts[i].firstName,
                lastName: contacts[i].lastName || '',
                contactLabelId: contacts[i].contactLabelId || null,
                position: '',
                contactPosition: contacts[i].contactPosition,
                contactRole: contacts[i].contactRole,
                profileImage: contacts[i].profileImage,
                mobile: contacts[i].mobile,
                isCrew: contacts.isCrew || 0,
                isPrivate: contacts[i].isPrivate || 0
              });
            }
          }
        }
        if (tabType === 2) {
          this.data.eventData = res.eventData;
          if (this.data && this.data.eventData && this.data.eventData.eventManager) {
            const tempMap = new Map<EventFunctionTypes, null | boolean | boolean[]>(this.eventService.setIsFnOwnCompany.getValue());
            tempMap.set(EventFunctionTypes.EVENT_MANAGER, this.data.eventData.eventManager.isOwnCompany === 1);
            this.eventService.setIsFnOwnCompany.next(tempMap);
            this.eventMgrCmp = ({
              id: this.data.eventData.eventManager.companyId,
              companyName: this.data.eventData.eventManager.emCompanyName,
              city: this.data.eventData.eventManager.emCompanyCity,
              phone: this.data.eventData.eventManager.emCompanyPhone,
              companyProfileImage: this.data.eventData.eventManager.emCompanyProfileImage,
              state: this.data.eventData.eventManager.emCompanyState || null,
              website: this.data.eventData.eventManager.emCompanyWebsite,
              companyTaxNumber: '',
              streetAddress1: this.data.eventData.eventManager.streetAddress1 || null,
              streetAddress2: this.data.eventData.eventManager.streetAddress2 || null,
              countryId: 0,
              postcode: '',
              description: '',
              createdDate: '',
              updatedDate: '',
              companyUID: '',
              companyType: '',
              canClaim: 0,
              canJoin: 0,
              isPrivate: this.data.eventData.eventManager.isPrivate || 0,
              isSeed: this.data.eventData.eventManager.isSeed || 0
            } as Company);
            this.eventToBeSaved = ({
              title: this.data.eventData.title,
              description: this.data.eventData.description,
              hasExhibitors: this.data.eventData.hasExhibitors,
              creatorCompanyName: this.data.eventData.creatorCompanyName,
              eventCreatedDate: this.data.eventData.eventCreatedDate,
              createrUserId: this.data.eventData.createrUserId,
              creatorFromCompanyId: this.data.eventData.creatorFromCompanyId,
              eventManager: {
                requirements: this.data.eventData.eventManager.requirements,
                emInternalNotes: this.data.eventData.eventManager.emInternalNotes,
                isOwnCompany: this.data.eventData.eventManager.isOwnCompany
              }
            } as SaveEventClass);
            const contacts: any = this.data.eventData.eventManager.contacts;
            for (let i = 0; i < contacts.length; i++) {
              this.eventMgrContactList.push({
                id: contacts[i].id,
                email: contacts[i].email,
                firstName: contacts[i].firstName,
                lastName: contacts[i].lastName || '',
                contactLabelId: contacts[i].contactLabelId || null,
                position: '',
                contactPosition: contacts[i].contactPosition,
                contactRole: contacts[i].contactRole,
                profileImage: contacts[i].profileImage,
                mobile: contacts[i].mobile,
                isCrew: contacts[i].isCrew || 0,
                isPrivate: contacts[i].isPrivate || 0
              });
            }
          }
        }
        if (tabType === 3) {
          this.venueCompanies = [];
          this.venueContactLists = [];
          this.data.eventData = res.eventData;
          if (this.data && this.data.eventData && this.data.eventData.venues && this.data.eventData.venues.length) {
            this.eventService.activeVenuePanelIndex = 0;
            this.eventToBeSaved.venues = {
              notesToAll: this.data.eventData.venues[0].venueNotesToAll,
              list: (this.data.eventData.venues.map((venue: any) => {
                console.log('venue.preEventTime',venue.preEventTime);
                return {
                  companyId: venue.venueCompanyId,
                  venueId: venue.venueId,
                  status: venue.status,
                  isStaffOrAdmin: venue.isStaffOrAdmin,
                  isViewPermission: venue.isViewPermission,
                  isSelfIncludedInTab: venue.isSelfIncludedInTab,
                  isSelfIncludedInSection: venue.isSelfIncludedInSection,
                  isPrivate: venue.isPrivate || 0,
                  isSeed: venue.isSeed || 0,
                  contacts: venue.contacts.map((contact: any) => {
                    return {
                      id: contact.id,
                      email: contact.email,
                      firstName: contact.firstName,
                      lastName: contact.lastName || '',
                      contactLabelId: contact.contactLabelId || null,
                      position: '',
                      contactPosition: contact.contactPosition,
                      contactRole: contact.contactRole,
                      profileImage: contact.profileImage,
                      mobile: contact.mobile,
                      isCrew: contact.isCrew || 0,
                      isPrivate: contact.isPrivate || 0
                    };
                  }),
                  preEventAccessDateTimes: venue.preEventTime,
                  eventAccessDateTimes: venue.eventTime,
                  postEventAccessDateTimes: venue.postEventTime,
                  requirements: venue.venueRequirements,
                  internalCmpNotes: venue.internalCmpNotes,
                  streetAddress1: venue.streetAddress1 || null,
                  streetAddress2: venue.streetAddress2 || null,
                  state: venue.companyState || null,
                  shouldInvite: null,
                  invited: null,
                  suppliers: [],
                  exhibitorList: []
                };
               
              }) as VenueListItemInterface[])
            };
console.log('this.eventToBeSaved.venues 1',this.eventToBeSaved.venues);


            const venues = this.data.eventData.venues;
            for (let i = 0; i < venues.length; i++) {
              let venueId: number = venues[i].venueId;
              let findVenueId = _.find(this.venueCompanies, { venueId });
              if (!findVenueId && findVenueId == undefined) {
                this.venueCompanies?.push(({
                  venueId: venues[i].venueId,
                  id: venues[i].venueCompanyId,
                  companyName: venues[i].venueCompanyName,
                  city: venues[i].companyCity,
                  phone: venues[i].companyPhone,
                  companyProfileImage: venues[i].companyProfileImage,
                  state: venues[i].companyState || null,
                  website: venues[i].companyWebsite,
                  companyTaxNumber: '',
                  streetAddress1: venues[i].streetAddress1 || null,
                  streetAddress2: venues[i].streetAddress2 || null,
                  countryId: 0,
                  postcode: '',
                  description: '',
                  createdDate: '',
                  updatedDate: '',
                  companyUID: '',
                  companyType: '',
                  canClaim: 0,
                  canJoin: 0,
                  isPrivate: venues[i].isPrivate || 0,
                  isSeed: venues[i].isSeed || 0
                } as Company));
              }
              const contacts: any = venues[i].contacts.map((contact: any) => {
                return {
                  id: contact.id,
                  email: contact.email,
                  firstName: contact.firstName,
                  lastName: contact.lastName || '',
                  contactLabelId: contact.contactLabelId || null,
                  position: '',
                  contactPosition: contact.contactPosition,
                  contactRole: contact.contactRole,
                  profileImage: contact.profileImage,
                  mobile: contact.mobile,
                  isCrew: contact.isCrew || 0,
                  isPrivate: contact.isPrivate || 0
                };
              });
              if (!findVenueId && findVenueId == undefined) {
                this.venueContactLists.push(contacts);
              }

            }
          }
        }
        if (tabType === 4) {
          this.eventService.resetVenueSupplierData();
          this.data.eventData = res.eventData;
          if (this.data && this.data.eventData && this.data.eventData.venues && this.data.eventData.venues.length) {

            this.eventToBeSaved.venues = {
              notesToAll: this.data.eventData.venues[0].venueNotesToAll,
              list: (this.data.eventData.venues.map((venue: any, venueIndex: number) => {
                return {
                  companyId: venue.venueCompanyId,
                  venueId: venue.venueId,
                  isPrivate: venue.isPrivate || 0,
                  isSeed: venue.isSeed || 0,
                  contacts: venue.contacts.map((contact: any) => {
                    return {
                      id: contact.id,
                      email: contact.email,
                      firstName: contact.firstName,
                      lastName: contact.lastName || '',
                      contactLabelId: contact.contactLabelId || null,
                      position: '',
                      contactPosition: contact.contactPosition,
                      contactRole: contact.contactRole,
                      profileImage: contact.profileImage,
                      mobile: contact.mobile,
                      isCrew: contact.isCrew || 0,
                      isPrivate: contact.isPrivate || 0
                    };
                  }),
                  preEventAccessDateTimes: venue.preEventTime,
                  eventAccessDateTimes: venue.eventTime,
                  postEventAccessDateTimes: venue.postEventTime,
                  requirements: venue.venueRequirements,
                  internalCmpNotes: venue.internalCmpNotes,
                  streetAddress1: venue.streetAddress1 || null,
                  streetAddress2: venue.streetAddress2 || null,
                  state: venue.companyState || null,
                  shouldInvite: null,
                  invited: null,
                  suppliers: [{
                    notesToAll: venue?.services[0]?.notes,
                    services:
                      venue.services.map((service: any, serviceIndex: number) => {
                        const serviceCompany = ({
                          supplierId: service.serviceId,
                          id: service.serviceCompanyId,
                          companyName: service.serviceCompanyName,
                          city: service.companyCity,
                          phone: service.companyPhone,
                          companyProfileImage: service.companyProfileImage,
                          state: service.companyState || null,
                          website: service.companyWebsite,
                          isViewPermission: service.isViewPermission,
                          isSelfIncludedInTab: service.isSelfIncludedInTab,
                          isSelfIncludedInSection: service.isSelfIncludedInSection,
                          companyTaxNumber: '',
                          streetAddress1: service.streetAddress1 || null,
                          streetAddress2: service.streetAddress2 || null,
                          countryId: 0,
                          postcode: '',
                          description: '',
                          createdDate: '',
                          updatedDate: '',
                          companyUID: '',
                          companyType: '',
                          canClaim: 0,
                          canJoin: 0,
                          isPrivate: service.isPrivate || 0,
                          isSeed: service.isSeed || 0
                        } as Company);
                        this.eventService.addFetchedVenueSrvcCmp({ venueIndex, serviceIndex, company: serviceCompany });
                        const contacts = service.contacts.map((contact: any) => {
                          return {
                            id: contact.id,
                            email: contact.email,
                            firstName: contact.firstName,
                            lastName: contact.lastName || '',
                            contactLabelId: contact.contactLabelId || null,
                            position: '',
                            contactPosition: contact.contactPosition,
                            contactRole: contact.contactRole,
                            profileImage: contact.profileImage,
                            mobile: contact.mobile,
                            isCrew: contact.isCrew || 0,
                            isPrivate: contact.isPrivate || 0
                          };
                        });
                        this.eventService.addFetchedVenueSrvcCmpCnt({ contactList: contacts, serviceIndex, venueIndex });
                        return {
                          name: service.serviceName,
                          requirement: service.serviceRequirements,
                          internalCmpNotes: service.internalCmpNotes,
                          contacts,
                          companyId: service.serviceCompanyId,
                          supplierId: service.serviceId,
                          isViewPermission: service.isViewPermission,
                          isSelfIncludedInTab: service.isSelfIncludedInTab,
                          isSelfIncludedInSection: service.isSelfIncludedInSection,
                          status: service.status,
                          isStaffOrAdmin: service.isStaffOrAdmin,
                          isPrivate: service.isPrivate || 0,
                          isSeed: service.isSeed || 0,
                          timeWindows: {
                            bumpIn: {
                              sameAsVenue: 0,
                              timings: service.preEventTime
                            },
                            eventTime: {
                              sameAsVenue: 0,
                              timings: service.eventTime
                            },
                            bumpOut: {
                              sameAsVenue: 0,
                              timings: service.postEventTime
                            },
                          }
                        };
                      }),
                  }
                  ],
                  exhibitorList: []
                };
              }) as VenueListItemInterface[])
            };
            console.log('this.eventToBeSaved.venues 2',this.eventToBeSaved.venues);
            const venues = this.data.eventData.venues;
            for (let i = 0; i < venues.length; i++) {
              let venueId: number = venues[i].venueId;
              let findVenueId = _.find(this.venueCompanies, { venueId });
              if (!findVenueId && findVenueId == undefined) {
                this.venueCompanies?.push(({
                  venueId: venues[i].venueId,
                  id: venues[i].venueCompanyId,
                  companyName: venues[i].venueCompanyName,
                  city: venues[i].companyCity,
                  phone: venues[i].companyPhone,
                  companyProfileImage: venues[i].companyProfileImage,
                  state: venues[i].companyState || null,
                  website: venues[i].companyWebsite,
                  companyTaxNumber: '',
                  streetAddress1: venues[i].streetAddress1 || null,
                  streetAddress2: venues[i].streetAddress2 || null,
                  countryId: 0,
                  postcode: '',
                  description: '',
                  createdDate: '',
                  updatedDate: '',
                  companyUID: '',
                  companyType: '',
                  canClaim: 0,
                  canJoin: 0,
                  isPrivate: venues[i].isPrivate || 0,
                  isSeed: venues[i].isSeed || 0
                } as Company));
              }
              const contacts: any = venues[i].contacts.map((contact: any) => {
                return {
                  id: contact.id,
                  email: contact.email,
                  firstName: contact.firstName,
                  lastName: contact.lastName || '',
                  contactLabelId: contact.contactLabelId || null,
                  position: '',
                  contactPosition: contact.contactPosition,
                  contactRole: contact.contactRole,
                  profileImage: contact.profileImage,
                  mobile: contact.mobile,
                  isCrew: contact.isCrew || 0,
                  isPrivate: contact.isPrivate || 0
                };
              });
              if (!findVenueId && findVenueId == undefined) {
                this.venueContactLists.push(contacts);
              }
            }
            // if (venue.services.length - 1 === serviceIndex) {
            this.eventService.navigatesToSuppliers.next()
            // }
          }
        }
        if (tabType === 5) {
          this.eventService.resetVenueExhibitorData();
          this.data.eventData = res.eventData;
          if (this.data && this.data.eventData && this.data.eventData.venues && this.data.eventData.venues.length) {
            this.eventToBeSaved.venues = {
              notesToAll: this.data.eventData.venues[0].venueNotesToAll,
              list: (this.data.eventData.venues.map((venue: any, venueIndex: number) => {
                return {
                  companyId: venue.venueCompanyId,
                  venueId: venue.venueId,
                  isPrivate: venue.isPrivate || 0,
                  isSeed: venue.isSeed || 0,
                  contacts: venue.contacts.map((contact: any) => {
                    return {
                      id: contact.id,
                      email: contact.email,
                      firstName: contact.firstName,
                      lastName: contact.lastName || '',
                      contactLabelId: contact.contactLabelId || null,
                      position: '',
                      contactPosition: contact.contactPosition,
                      contactRole: contact.contactRole,
                      profileImage: contact.profileImage,
                      mobile: contact.mobile,
                      isCrew: contact.isCrew || 0,
                      isPrivate: contact.isPrivate || 0
                    };
                  }),
                  preEventAccessDateTimes: venue.preEventTime,
                  eventAccessDateTimes: venue.eventTime,
                  postEventAccessDateTimes: venue.postEventTime,
                  requirements: venue.venueRequirements,
                  internalCmpNotes: venue.internalCmpNotes,
                  streetAddress1: venue.streetAddress1 || null,
                  streetAddress2: venue.streetAddress2 || null,
                  state: venue.companyState || null,
                  shouldInvite: null,
                  invited: null,
                  suppliers: [],
                  exhibitorList:
                    [{
                      notesToAll: venue?.exhibitorData?.exhibitors[0]?.notes,
                      timeWindowsToAll: {
                        bumpIn: {
                          sameAsVenue: 0,
                          timings: venue?.exhibitorData?.timeWindowsToAll?.preEventTime
                        },
                        eventTime: {
                          sameAsVenue: 0,
                          timings: venue?.exhibitorData?.timeWindowsToAll?.eventTime
                        },
                        bumpOut: {
                          sameAsVenue: 0,
                          timings: venue?.exhibitorData?.timeWindowsToAll?.postEventTime
                        },
                      },
                      exhibitors:
                        venue?.exhibitorData?.exhibitors?.map((exhibitor: any, exhibitorIndex: number) => {
                          const exhibitorCompany = ({
                            exhibitorId: exhibitor.exhibitorId,
                            id: exhibitor.exhibitorCompanyId,
                            companyName: exhibitor.exhibitorCompanyName,
                            city: exhibitor.companyCity,
                            phone: exhibitor.companyPhone,
                            companyProfileImage: exhibitor.companyProfileImage,
                            state: exhibitor.companyState || null,
                            website: exhibitor.companyWebsite,
                            isViewPermission: exhibitor.isViewPermission,
                            isSelfIncludedInTab: exhibitor.isSelfIncludedInTab,
                            isSelfIncludedInSection: exhibitor.isSelfIncludedInSection,
                            companyTaxNumber: '',
                            streetAddress1: exhibitor.streetAddress1 || null,
                            streetAddress2: exhibitor.streetAddress2 || null,
                            countryId: 0,
                            postcode: '',
                            description: '',
                            createdDate: '',
                            updatedDate: '',
                            companyUID: '',
                            companyType: '',
                            canClaim: 0,
                            canJoin: 0,
                            isPrivate: exhibitor.isPrivate || 0,
                            isSeed: exhibitor.isSeed || 0
                          } as Company);
                          this.eventService.addFetchedVenueExCmp({ venueIndex, exhibitorIndex, company: exhibitorCompany });

                          const contacts = exhibitor.contacts.map((contact: any) => {
                            return {
                              id: contact.id,
                              email: contact.email,
                              firstName: contact.firstName,
                              lastName: contact.lastName || '',
                              contactLabelId: contact.contactLabelId || null,
                              position: '',
                              contactPosition: contact.contactPosition,
                              contactRole: contact.contactRole,
                              profileImage: contact.profileImage,
                              mobile: contact.mobile,
                              isCrew: contact.isCrew || 0,
                              isPrivate: contact.isPrivate || 0
                            };
                          });
                          this.eventService.addFetchedVenueExCmpCnt({ contactList: contacts, exhibitorIndex, venueIndex });
                          return {
                            name: exhibitor.exhibitorName,
                            requirement: exhibitor.exhibitorRequirements,
                            internalCmpNotes: exhibitor.internalCmpNotes,
                            companyId: exhibitor.exhibitorCompanyId,
                            standNumber: exhibitor.standNumber,
                            isViewPermission: exhibitor.isViewPermission,
                            isSelfIncludedInTab: exhibitor.isSelfIncludedInTab,
                            isSelfIncludedInSection: exhibitor.isSelfIncludedInSection,
                            contacts,
                            exhibitorId: exhibitor.exhibitorId,
                            status: exhibitor.status,
                            isStaffOrAdmin: exhibitor.isStaffOrAdmin,
                            isPrivate: exhibitor.isPrivate || 0,
                            isSeed: exhibitor.isSeed || 0,
                            timeWindows: {
                              bumpIn: {
                                sameAsVenue: 0,
                                timings: exhibitor.preEventTime
                              },
                              eventTime: {
                                sameAsVenue: 0,
                                timings: exhibitor.eventTime
                              },
                              bumpOut: {
                                sameAsVenue: 0,
                                timings: exhibitor.postEventTime
                              },
                            }
                          };
                        }),
                    }
                    ],
                };
              }) as VenueListItemInterface[])
            };

            console.log('this.eventToBeSaved.venues 3',this.eventToBeSaved.venues);

           
            const venues = this.data.eventData.venues;
            for (let i = 0; i < venues.length; i++) {
              let venueId: number = venues[i].venueId;
              let findVenueId = _.find(this.venueCompanies, { venueId });
              if (!findVenueId && findVenueId == undefined) {
                this.venueCompanies?.push(({
                  venueId: venues[i].venueId,
                  id: venues[i].venueCompanyId,
                  companyName: venues[i].venueCompanyName,
                  city: venues[i].companyCity,
                  phone: venues[i].companyPhone,
                  companyProfileImage: venues[i].companyProfileImage,
                  state: venues[i].companyState,
                  website: venues[i].companyWebsite || null,
                  companyTaxNumber: '',
                  streetAddress1: venues[i].streetAddress1 || null,
                  streetAddress2: venues[i].streetAddress2 || null,
                  countryId: 0,
                  postcode: '',
                  description: '',
                  createdDate: '',
                  updatedDate: '',
                  companyUID: '',
                  companyType: '',
                  canClaim: 0,
                  canJoin: 0,
                  isPrivate: venues[i].isPrivate || 0,
                  isSeed: venues[i].isSeed || 0
                } as Company));
              }
              const contacts: any = venues[i].contacts.map((contact: any) => {
                return {
                  id: contact.id,
                  email: contact.email,
                  firstName: contact.firstName,
                  lastName: contact.lastName || '',
                  contactLabelId: contact.contactLabelId || null,
                  position: '',
                  contactPosition: contact.contactPosition,
                  contactRole: contact.contactRole,
                  profileImage: contact.profileImage,
                  mobile: contact.mobile,
                  isCrew: contact.isCrew || 0,
                  isPrivate: contact.isPrivate || 0
                };
              });
              if (!findVenueId && findVenueId == undefined) {
                this.venueContactLists.push(contacts);
              }
            }
            this.eventService.navigatesToExhibitors.next()
          }
        }
        if (tabType === 6) {
          this.data.eventData = res.eventData;
          this.eventService.fetchEventFilesSubject.next(this.data.eventData.eventId);
        }
        if (tabType === '7') {
          this.data.eventData = res.eventData;
          this.eventTimelineService.render.next();
        }
        if (tabType === '8') {
        

          this.data = res.eventData;
          console.log("this.data.eventData++++++",this.data)
        }
        if (tabType === 9) {
          
          this.data.eventData = res.eventData;
        }
      }

      if (res && res.userPermission) {
        if (this.isEmailVerified) {
          this.permissionObj.isClient = res.userPermission.isClient == 0 ? false : true;
          this.permissionObj.clientAccessPermission = res.userPermission.clientAccessPermission;
          this.permissionObj.isEventManager = res.userPermission.isEventManager == 0 ? false : true;
          this.permissionObj.isVenue = res.userPermission.isVenue == 0 ? false : true;
          this.permissionObj.isService = res.userPermission.isService == 0 ? false : true;
          this.permissionObj.isExhibitor = res.userPermission.isExhibitor == 0 ? false : true;
        }
        this.permissionObj.isCrew = res.userPermission.isCrew == 0 ? false : true;
        this.data.userPermission = this.permissionObj;
      }
      if (res && res.commonData) {
        this.data.commonData = res.commonData;
      }
    }, err => {
      console.log(err);
      console.log("hdhhd");
    });
  }



}
