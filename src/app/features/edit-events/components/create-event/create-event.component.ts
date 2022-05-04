import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, OnInit, ViewChild, HostListener } from '@angular/core';
import { NgbModal, NgbModalRef, NgbNavChangeEvent } from '@ng-bootstrap/ng-bootstrap';
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
import { Router } from '@angular/router';
import { EventSuppliersFunctionComponent } from '../event-suppliers-function/event-suppliers-function.component';
import { EventExhibitorsFunctionComponent } from '../event-exhibitors-function/event-exhibitors-function.component';
import { EventTimelineService } from '../../services/event-timeline.service';
import { cloneDeep } from 'lodash-es';
import { ViewEventService } from '../../services/view-event.service';
import * as _ from 'lodash';
import * as moment from 'moment'

export interface VenuueCompany extends Company {
  venueId?: number;
  supplierId?: number;
  exhibitorId?: number;
}

@Component({
  selector: 'app-create-event',
  templateUrl: './create-event.component.html',
  styleUrls: ['./create-event.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default
})
export class CreateEventComponent implements OnInit, OnDestroy, AfterViewInit {
  @Input() eventId: any;
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

  venueCompanies: Array<Company | InviteFnCmpInterface | VenuueCompany | null> | undefined | null = [];
  venueContactLists: Array<Array<FnCmpCntInterface>> = [];
  isEventVenuesInvalid = true;

  isVenuesSuppliersInvalid = true;
  isVenuesExhibitorsInvalid = true;

  data: any = {};
  isEditEvents: boolean = false;
  isSaveDisable: boolean = false;

  permissionObj = { isCrew: false,isClient: false, isEventManager: false, isService: false, isVenue: false, isExhibitor: false };
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
  isEmailVerified:boolean|undefined =false;

  constructor(
    // public modalService: NgbModal,
    public toaster: ToastrService,
    public userSettings: UserSettingsService,
    public authService: AuthService,
    public eventService: EventService,
    public router: Router,
    public eventTimelineService: EventTimelineService,
    public viewEvSrvc: ViewEventService,
    public _cdr: ChangeDetectorRef,
  ) {
  }

  edit() {
    this.eventService.isEdit = true;
  }

  checkVenuePermission() {
    console.log(this.eventService.activeVenuePanelIndex)
  }

  @HostListener('window:scroll', ['$event'])
  checkScroll() {
    this.isSticky = window.pageYOffset >= 100;
  }


  ngOnInit(): void {
    this.eventService.reset();
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

    this.eventService.isEditChange.subscribe((value) => {
      this.isEditEvents = value;
    })
    this.eventService.isSaveDisabledChange.subscribe((value) => {
      console.log('isSaveDisableValue: ', value)
      this.isSaveDisable = value;
    })

    // this.saveOnlySub = this.eventService.triggerSaveOnly.subscribe(() => {
    //   switch (this.selectedFunction) {
    //     case EventFunctionTypes.CLIENT:
    //       this.saveToDb(false);
    //       break;
    //     case EventFunctionTypes.EVENT_MANAGER:
    //       this.saveToDb(false);
    //       break;
    //     case EventFunctionTypes.VENUE:
    //       this.saveToDb({ venueIndex: null, serviceIndex: null, shouldInvite: false });
    //       break;
    //     case EventFunctionTypes.SUPPLIERS:
    //       this.saveToDb({ venueIndex: null, serviceIndex: null, shouldInvite: false });
    //       break;
    //     case EventFunctionTypes.EXHIBITORS:
    //       this.saveToDb({ venueIndex: null, exhibitorIndex: null, shouldInvite: false });
    //       break;
    //   }
    // });
    if (this.eventId) {
      this.getEventsById(this.active);
    }
  }

  onlySave() {
    switch (this.selectedFunction) {
      case EventFunctionTypes.CLIENT:
        this.saveToDb(false);
        break;
      case EventFunctionTypes.EVENT_MANAGER:
        this.saveToDb(false);
        break;
      case EventFunctionTypes.VENUE:
        this.saveToDb({ venueIndex: null, serviceIndex: null, shouldInvite: false });
        break;
      case EventFunctionTypes.SUPPLIERS:
        this.saveToDb({ venueIndex: null, serviceIndex: null, shouldInvite: false });
        break;
      case EventFunctionTypes.EXHIBITORS:
        this.saveToDb({ venueIndex: null, exhibitorIndex: null, shouldInvite: false });
        break;
    }
  }

  getEventsById(tabType: any) {
    this.viewEvSrvc.getEventsByEventId(this.eventId, tabType).subscribe((res: any) => {
      console.log(res,'res tab type',tabType);
      if (res && res.eventData) {
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
          this.venueCompanies=[];
          this.venueContactLists=[];
          this.data.eventData = res.eventData;
          if (this.data && this.data.eventData && this.data.eventData.venues && this.data.eventData.venues.length) {
            this.eventService.activeVenuePanelIndex = 0;
            this.eventToBeSaved.venues = {
              notesToAll: this.data.eventData.venues[0].venueNotesToAll,
              list: (this.data.eventData.venues.map((venue: any) => {
                return {
                  companyId: venue.venueCompanyId,
                  venueId: venue.venueId,
                  status: venue.status,
                  isStaffOrAdmin: venue.isStaffOrAdmin,
                  isViewPermission: venue.isViewPermission,
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
                        console.log('contacts: ', cloneDeep(contacts));
                        this.eventService.addFetchedVenueSrvcCmpCnt({ contactList: contacts, serviceIndex, venueIndex });
                        return {
                          name: service.serviceName,
                          requirement: service.serviceRequirements,
                          internalCmpNotes: service.internalCmpNotes,
                          contacts,
                          companyId: service.serviceCompanyId,
                          supplierId: service.serviceId,
                          isViewPermission: service.isViewPermission,
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
            const venues = this.data.eventData.venues;
            for (let i = 0; i < venues.length; i++) {
              let venueId: number = venues[i].venueId;
              let findVenueId = _.find(this.venueCompanies, { venueId });
              console.log('find venue: ', findVenueId);
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
            console.log(this.eventToBeSaved);
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
        if (tabType === 7) {
          this.data.eventData = res.eventData;
          this.eventTimelineService.render.next();
        }
      }

      if (res && res.userPermission) {
        if (this.isEmailVerified){
          this.permissionObj.isClient = res.userPermission.isClient == 0 ? false : true;
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
    this.isClientEditable = false;
    this.isManagerEditable = false;
    this.isVenueEditable = false;
    this.isServiceEditable = false;
    this.isExhibitorEditable = false;
    this.eventService.isEdit = false;
    this.eventService.isSaveDisabled = false;
    this.getEventsById(changeEvent.nextId);
    this.active = changeEvent.nextId;
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
  getData(tabType: any): any {
    if (tabType == 5 && this.data.eventData?.venues && this.data.eventData?.venues.length) {
      // console.log('data in get data: ', cloneDeep(this.data.eventData.venues))
    }
    return this.data;
  }

  toggleDisabled(): void {
    this.disabled = !this.disabled;
    if (this.disabled) {
      this.active = 1;
    }
  }


  // openVerticallyCentered(content: any): void {
  //   this.modalReference = this.modalService.open(content, {
  //     centered: true,
  //     size: 'lg',
  //   });

  // }


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
          requirements: '',
          emInternalNotes: ''
        };
        break;
      case EventFunctionTypes.VENUE:
        const activatedVenuePanelIndex = this.eventService.activeVenuePanelIndex;
        if (activatedVenuePanelIndex !== null && this.venueCompanies) {
          devLogger('log', activatedVenuePanelIndex);
          devLogger('log', { venueCompanies: this.venueCompanies });
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
          devLogger('log', { venueCompanies: this.venueCompanies });
          // @ts-ignore
          this.venueFn?.venueAssignCmp.get(activatedVenuePanelIndex).setSelectedCompany(company);
          this.setSelectedFnCompanyContacts([]);
          devLogger('log', { venueCompaniesContactList: this.venueContactLists[activatedVenuePanelIndex] });
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

  setIsCrew(event: any) {
    console.log('is Crew on create event: ', event);
    this.emitedCrew = event;
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
          let venueCrewAssignCmpCnt: EventAssignFunctionCmpComponent | undefined;
          venueAssignCmpCnt = this.venueFn?.venueAssignCmp.get(activatedVenuePanelIndex);
          //@ts-ignore
          venueCrewAssignCmpCnt = this.venueFn?.venueCrewAssignCmp.get(activatedVenuePanelIndex);
          if (venueAssignCmpCnt) {
            venueAssignCmpCnt.setContactList(this.venueContactLists[activatedVenuePanelIndex]);
          }
          if (venueCrewAssignCmpCnt) {
            venueCrewAssignCmpCnt.setContactList(this.venueContactLists[activatedVenuePanelIndex]);
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
            contactLabelId: cnt.contactLabelId,
            mobile: cnt?.mobile
          };
        }) || null;
        this.eventToBeSaved.client = {
          id: (this.clientCompany as Company).id,
          contacts: contactList,
          shouldInvite: shouldInvite ? 1 : 0,
          isOwnCompany: !!this.eventToBeSaved.client?.isOwnCompany,
          invited: null,
          internalCmpNotes: this.eventToBeSaved.client?.internalCmpNotes
        };

      } else {
        this.eventToBeSaved.client = {
          id: null,
          contacts: null,
          shouldInvite: shouldInvite ? 1 : 0,
          isOwnCompany: false,
          invited: (this.clientCompany as InviteFnCmpClass),
          internalCmpNotes: null
        };

      }
      devLogger('log', { event: this.eventToBeSaved });
    }
  }

  unsetClientCompany(): void {
    const clientCompanyInstOfInviteFnCmp = this.clientCompany instanceof InviteFnCmpClass;
    const wasOwnCompany = !clientCompanyInstOfInviteFnCmp && (this.clientCompany as Company).id === this.defaultCompany.id;
    this.clientCompany = null;
    this.clientContactList = [];
    this.eventToBeSaved.client = {
      id: null,
      contacts: null,
      isOwnCompany: false,
      shouldInvite: null,
      invited: null,
      internalCmpNotes: this.eventToBeSaved.client!.internalCmpNotes
    };
    if (wasOwnCompany) {
      const tempMap = new Map(this.eventService.setIsFnOwnCompany.getValue());
      // tempMap.set(EventFunctionTypes.CLIENT, !tempMap.get(EventFunctionTypes.CLIENT));
      tempMap.set(EventFunctionTypes.CLIENT, false);
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
          console.log('before splice: ', cloneDeep(this.venueContactLists[index]));
          this.venueContactLists[index].splice(jIndex, 1);
          console.log('after splice: ', cloneDeep(this.venueContactLists[index]));
          // @ts-ignore
          const venueAssignCmpCnt = this.venueFn?.venueAssignCmp.get(index);
          // @ts-ignore
          const venueCrewAssignCmpCnt = this.venueFn?.venueCrewAssignCmp.get(index);
          console.log('Venue assign: ', venueAssignCmpCnt);
          if (venueAssignCmpCnt) {
            venueAssignCmpCnt.setContactList(this.venueContactLists[index]);
          }
          if (venueCrewAssignCmpCnt) {
            venueCrewAssignCmpCnt.setContactList(this.venueContactLists[index]);
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
    this.eventToBeSaved.eventManager = {
      id: null,
      contacts: null,
      isOwnCompany: false,
      shouldInvite: null,
      requirements: this.eventToBeSaved.eventManager!.requirements,
      invited: null,
      emInternalNotes: this.eventToBeSaved.eventManager!.emInternalNotes,
    };
    if (wasOwnCompany) {
      const tempMap = new Map(this.eventService.setIsFnOwnCompany.getValue());
      // tempMap.set(EventFunctionTypes.EVENT_MANAGER, !tempMap.get(EventFunctionTypes.EVENT_MANAGER));
      tempMap.set(EventFunctionTypes.EVENT_MANAGER, false);
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
            contactLabelId: cnt.contactLabelId,
            mobile: cnt?.mobile
          };
        }) || null;
        this.eventToBeSaved.eventManager = {
          id: (this.eventMgrCmp as Company).id,
          contacts: contactList,
          shouldInvite: shouldInvite ? 1 : 0,
          isOwnCompany: !!this.eventToBeSaved.eventManager?.isOwnCompany,
          invited: null,
          requirements: this.eventToBeSaved.eventManager?.requirements || '',
          emInternalNotes: this.eventToBeSaved.eventManager?.emInternalNotes || '',
        };

      } else {
        this.eventToBeSaved.eventManager = {
          id: null,
          contacts: null,
          shouldInvite: shouldInvite ? 1 : 0,
          isOwnCompany: false,
          invited: (this.eventMgrCmp as InviteFnCmpClass),
          requirements: this.eventToBeSaved.eventManager?.requirements || '',
          emInternalNotes: this.eventToBeSaved.eventManager?.emInternalNotes || '',
        };

      }
      devLogger('log', { event: this.eventToBeSaved });

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
      // @ts-ignore
      this.venueFn?.venueCrewAssignCmp.get(index)?.removeContactList();
    }
    // this.data.eventData.venues?.splice(index,1)
  }

  saveVenueCmp(event: { index: number | null; shouldInvite: boolean }): void {
    if (this.isVenuesValid()) {
      if (this.venueCompanies && this.venueCompanies.length > 0) {
        // @ts-ignore
        for (let i = 0; i < this.venueCompanies?.length; i++) {
          // @ts-ignore
          if (!(this.venueCompanies[i] instanceof InviteFnCmpClass) && (this.venueCompanies[i] as Company).id) {
            const contactList = this.venueContactLists[i]?.map(cnt => {
              console.log(cnt);
              return {
                id: cnt.id,
                email: cnt.email,
                firstName: cnt.firstName,
                contactLabelId: cnt.contactLabelId,
                isCrew: cnt.isCrew ? cnt.isCrew : 0,
                contactRole: cnt.contactRole || null,
                mobile: cnt?.mobile
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
        devLogger('log', { beforeFilterVenSupp: this.eventToBeSaved.venues?.list });
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

      devLogger('log', { eventAfterVenuesSupplier: this.eventToBeSaved });
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
        devLogger('log', { beforeFilterVenExh: this.eventToBeSaved.venues?.list });
        for (const venuesList of this.eventToBeSaved.venues?.list) {
          console.log('venues list...', venuesList)
          if(cloneDeep(venuesList.exhibitorList[0] && venuesList.exhibitorList[0]!.notesToAll)){
            console.log('in condition');
            venuesList.notesToAllExGlobal = venuesList.exhibitorList[0]?.notesToAll;
            venuesList.timeWindowsToAllExGlobal = venuesList.exhibitorList[0]?.timeWindowsToAll;
          }
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

      devLogger('log', { eventAfterVenuesExh: this.eventToBeSaved });
    }
  }

  private postProcessVenues(): void {
    devLogger('log', { preProcessingVenues: cloneDeep(this.eventToBeSaved.venues) });
    if (this.eventToBeSaved.venues) {
      this.eventToBeSaved.venues.list = this.eventToBeSaved.venues.list
        .filter(venueCmp => venueCmp.companyId !== null || venueCmp.invited !== null);
    }
    devLogger('log', { postProcessingVenues: cloneDeep(this.eventToBeSaved.venues) });
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

    console.log(param);

    switch (this.selectedFunction) {
      case EventFunctionTypes.CLIENT:
        this.saveClient(typeof param === 'boolean' ? param : false);
        // this.isEventClientInvalid = false;
        this.isEventMgrInvalid = false;
        this.isEventVenuesInvalid = false;
        this.isVenuesSuppliersInvalid = false;
        this.isVenuesExhibitorsInvalid = false;
        // this.saveEvMgr(false);
        // this.saveVenueCmp({ index: null, shouldInvite: false });
        // this.saveVenuesSuppliers({
        //   venueIndex: null, serviceIndex: null, shouldInvite: false
        // });
        // this.saveVenuesExhibitors({
        //   venueIndex: null, exhibitorIndex: null, shouldInvite: false
        // });
        break;
      case EventFunctionTypes.EVENT_MANAGER:
        // this.saveClient(false);
        this.saveEvMgr(typeof param === 'boolean' ? param : false);
        this.isEventClientInvalid = false;
        // this.isEventMgrInvalid = false;
        this.isEventVenuesInvalid = false;
        this.isVenuesSuppliersInvalid = false;
        this.isVenuesExhibitorsInvalid = false;
        // this.saveVenueCmp({ index: null, shouldInvite: false });
        // this.saveVenuesSuppliers({
        //   venueIndex: null, serviceIndex: null, shouldInvite: false
        // });
        // this.saveVenuesExhibitors({
        //   venueIndex: null, exhibitorIndex: null, shouldInvite: false
        // });
        break;
      case EventFunctionTypes.VENUE:
        console.log('contact list in venue: ', this.venueContactLists)
        // this.saveClient(false);
        // this.saveEvMgr(false);
        if (typeof param !== 'boolean') {
          this.saveVenueCmp({ index: param.venueIndex, shouldInvite: param.shouldInvite });
          this.isEventClientInvalid = false;
          this.isEventMgrInvalid = false;
          // this.isEventVenuesInvalid = false;
          this.isVenuesSuppliersInvalid = false;
          this.isVenuesExhibitorsInvalid = false;
        }
        // this.saveVenuesSuppliers({
        //   venueIndex: null, serviceIndex: null, shouldInvite: false
        // });
        // this.saveVenuesExhibitors({
        //   venueIndex: null, exhibitorIndex: null, shouldInvite: false
        // });
        break;
      case EventFunctionTypes.SUPPLIERS:
        // this.saveClient(false);
        // this.saveEvMgr(false);
        // this.saveVenueCmp({ index: null, shouldInvite: false });
        if (typeof param !== 'boolean') {
          this.saveVenuesSuppliers({
            venueIndex: param.venueIndex, serviceIndex: param.serviceIndex, shouldInvite: param.shouldInvite
          });
          this.isEventClientInvalid = false;
          this.isEventMgrInvalid = false;
          this.isEventVenuesInvalid = false;
          // this.isVenuesSuppliersInvalid = false;
          this.isVenuesExhibitorsInvalid = false;
        }
        // this.saveVenuesExhibitors({
        //   venueIndex: null, exhibitorIndex: null, shouldInvite: false
        // });
        break;
      case EventFunctionTypes.EXHIBITORS:
        // this.saveClient(false);
        // this.saveEvMgr(false);
        // this.saveVenueCmp({ index: null, shouldInvite: false });
        // this.saveVenuesSuppliers({
        //   venueIndex: null, serviceIndex: null, shouldInvite: false
        // });
        if (typeof param !== 'boolean') {
          this.saveVenuesExhibitors({
            venueIndex: param.venueIndex, exhibitorIndex: param.exhibitorIndex, shouldInvite: param.shouldInvite
          });
          this.isEventClientInvalid = false;
          this.isEventMgrInvalid = false;
          this.isEventVenuesInvalid = false;
          this.isVenuesSuppliersInvalid = false;
          // this.isVenuesExhibitorsInvalid = false;
        }
    }

    if (!this.isEventClientInvalid && !this.isEventMgrInvalid && !this.isEventVenuesInvalid &&
      !this.isVenuesSuppliersInvalid && !this.isVenuesExhibitorsInvalid) {
      this.postProcessVenues();
      this.eventService.updateToDb(this.eventToBeSaved, this.data.eventData.eventId).subscribe(
        value => {
          if (value) {
            this.toaster.success('Event updated successfully');
            this.savedEventId = this.data.eventData.eventId;
            /*this.router.navigateByUrl('/home', {skipLocationChange: true}).then(() => {
              this.router.navigate(['/home/event/create']);
            });*/
            // this.active = 6;
            this.eventService.fetchEventFilesSubject.next(this.savedEventId);
            this.eventService.hideInfoBar = false;
            // window.location.reload();
            // this.ngOnInit();
            if (EventFunctionTypes.CLIENT || EventFunctionTypes.EVENT_MANAGER || EventFunctionTypes.VENUE || EventFunctionTypes.SUPPLIERS || EventFunctionTypes.EXHIBITORS) {
              this.isClientEditable = false;
              this.isManagerEditable = false;
              this.eventService.isEdit = false;
            }
            if (EventFunctionTypes.VENUE) {
              this.eventService.reset();

              // this.router.navigate(['/home'], { replaceUrl: true });
            }
            this.ngOnInit();
          }
        },
        error => {
          devLogger('error', { saveEventError: error });
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
    devLogger('log', { clientComapny: this.clientCompany, contactList: this.clientContactList });

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
    devLogger('log', { eventMgrCmp: this.eventMgrCmp, contactList: this.eventMgrContactList });
    this.isEventMgrInvalid = false;
    return true;
  }

  private isVenuesValid(): boolean {
    this.venueCompanies = cloneDeep(this.venueCompanies);
    this.venueContactLists = cloneDeep(this.venueContactLists)
    if (this.venueCompanies && this.venueCompanies.length > 0) {
      console.log(cloneDeep(this.venueCompanies));
      console.log(cloneDeep(this.venueContactLists))
      /*
      * clean venue companies and there corresponding contacts
      * which are removed i.e venueCompany===null
       */
      console.log(this.venueContactLists);
      for (let i = 0; i < this.venueCompanies.length; i++) {
        if (this.venueCompanies[i] === null) {
          this.venueContactLists.splice(i, 1);
          devLogger('log', { [`eventToBeSaved.venues?.list[${i}]`]: cloneDeep(this.eventToBeSaved.venues?.list[i]) });
          this.eventToBeSaved.venues?.list.splice(i, 1);
        } else {
          // if (this.eventToBeSaved.venues?.list[i].contacts && this.eventToBeSaved.venues?.list[i].contacts?.length) {
          //   //@ts-ignore
          //   this.venueContactLists[i] = this.eventToBeSaved.venues?.list[i].contacts;
          // }
          devLogger('log', { [`eventToBeSaved.venues?.list[${i}]`]: cloneDeep(this.eventToBeSaved.venues?.list[i]) });
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
      // this.toaster.error('Please select venue company and contacts');
      // this.isEventVenuesInvalid = true;
      // return false;
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
              // this.toaster.error('Please select supplier company and contacts');
              // this.isVenuesSuppliersInvalid = true;
              // return false;
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
                // this.toaster.error('Please select exhibitor company and contacts');
                // this.isVenuesExhibitorsInvalid = true;
                // return false;
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

  getIsEdit() {
    if (this.active == 1) {
      return this.isClientEditable
    }
    else if (this.active == 2) {
      return this.isManagerEditable
    }
    return
  }

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
  }

}
