import { Component, Input, OnInit } from '@angular/core';
import { ViewEventService } from '../../services/view-event.service';
import { Subscription } from 'rxjs';
import { UserSettingsService } from 'src/app/shared/services';
import { UserSettingsInterface } from 'src/app/shared/models';
import { SaveEventClass } from '../../models/classes/saveEvent.class';
import { AuthService } from 'src/app/core/services/auth.service';
import { EventFunctionTypes } from '../../models/types';
import { EventService } from '../../services/event.service';
import { FnCmpCntInterface, InviteFnCmpInterface, VenueListItemInterface } from '../../models/interfaces';
import { Company } from '../../../users/models';
import { VenuueCompany } from '../create-event/create-event.component';
import * as _ from 'lodash';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { InviteFnCmpClass } from '../../models/classes';
import { devLogger } from '../../../../shared/utils';

@Component({
  selector: 'app-view-exhibitor-toggle',
  templateUrl: './view-exhibitor-toggle.component.html',
  styleUrls: ['./view-exhibitor-toggle.component.scss']
})
export class ViewexhibitorToggle implements OnInit{
  


  constructor(
 
    public viewEvSrvc: ViewEventService,
    public userSettings: UserSettingsService,
    public authService: AuthService,
    public eventService: EventService
  ) {
  
  }
  active = 1;
  eventToBeSaved = new SaveEventClass();
  @Input() isToggled : any=false;
  dataExihibitor: any = {};
  data: any = {};
  userId:any;
  defaultCompany: any;
  clientCompany: Company | InviteFnCmpInterface | undefined | null;
  @Input() eventData:any;
  public emitedCrew: number = 0;
  clientContactList: FnCmpCntInterface[] = [];
  private userSettingsSub: Subscription | undefined;
  isEmailVerified: boolean | undefined = false;
  selectedFunction: EventFunctionTypes = this.active;
  updateFnCmpToSelf: Map<EventFunctionTypes, boolean | boolean[] | null> = this.eventService.setIsFnOwnCompany.getValue();
  eventMgrCmp: Company | InviteFnCmpInterface | undefined | null;
  eventMgrContactList: FnCmpCntInterface[] = [];
  eventToBeSavedExhibitor = new SaveEventClass();
  venueCompanies: Array<Company | InviteFnCmpInterface | VenuueCompany | null> | undefined | null = [];
  venueContactLists: Array<Array<FnCmpCntInterface>> = [];
  @Input() permissionObj: any ;
  modalReference: NgbModalRef | undefined;

  ngOnInit() : void {

    this.userId = localStorage.getItem('userId');
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

  toggle() {
    this.isToggled = !this.isToggled;
    if(this.isToggled==true){
      this.getEventsById(5,this.eventData.eventData.eventId);
    }
    
  }

  setIsCrew(event: any) {
    this.emitedCrew = event;
  }
  
  getEventsById(tabType: any,eventId:any) {

    this.viewEvSrvc.getEventsByEventId(eventId,tabType, this.defaultCompany.id).subscribe((res: any) => {
  
      if (res && res.eventData) {

       
          this.eventService.resetVenueExhibitorData();
          this.dataExihibitor.eventData = res.eventData;
          // console.log("this.dataExihibitor.eventData+++++",this.dataExihibitor.eventData);
          if (this.dataExihibitor && this.dataExihibitor.eventData && this.dataExihibitor.eventData.venues && this.dataExihibitor.eventData.venues.length) {
            this.eventToBeSavedExhibitor.venues = {
              notesToAll: this.dataExihibitor.eventData.venues[0].venueNotesToAll,
              list: (this.dataExihibitor.eventData.venues.map((venue: any, venueIndex: number) => {
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


           
            const venues = this.dataExihibitor.eventData.venues;
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
              const contactsvenue: any = venues[i].contacts.map((contact: any) => {
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
                this.venueContactLists.push(contactsvenue);
              }
            }
            this.eventService.navigatesToExhibitors.next()
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
    });
  }

  setOpenedModalRef(event: NgbModalRef): void {
    this.modalReference = event;
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

console.log('this.selectedFunction',this.selectedFunction);

  }

  searchInviteCompanyClosed(): void {
    this.modalReference?.close();
  }

  setSelectedCompany(company: Company | InviteFnCmpClass): void {
    let isInvitedCompany = false;
    switch (this.selectedFunction) {
     
      case EventFunctionTypes.SUPPLIERS:
        this.eventService.supplierCompanyAdded(company);
        break;
      case EventFunctionTypes.EXHIBITORS:
        this.eventService.exhibitorCompanyAdded(company);
        break;
    
      default:
        break;
    }
    this.searchInviteCompanyClosed();
  }

}
