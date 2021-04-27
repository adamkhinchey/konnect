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
import {SaveEventService} from '../../services/save-event.service';
import {EventAssignFunctionCmpComponent} from '../event-assign-function-cmp/event-assign-function-cmp.component';
import {EventVenueFunctionComponent} from '../event-venue-function/event-venue-function.component';
import {Router} from "@angular/router";

@Component({
  selector: 'app-create-event',
  templateUrl: './create-event.component.html',
  styleUrls: ['./create-event.component.scss']
})
export class CreateEventComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('app-event-panel-nav') eventPanelNav: EventPanelNavComponent | undefined;
  @ViewChild('venueFn') venueFn: EventVenueFunctionComponent | undefined;
  active = 1;
  disabled = true;
  modalReference: NgbModalRef | undefined;
  eventToBeSaved = new SaveEventClass();
  updateFnCmpToSelf: Map<EventFunctionTypes, boolean | boolean[] | null> = this.saveEventService.setIsFnOwnCompany.getValue();
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

  venueCompanies: Array<Company | InviteFnCmpInterface> | undefined | null = [];
  venueContactLists: Array<Array<FnCmpCntInterface>> = [];
  isEventVenuesInvalid = true;


  constructor(
    private modalService: NgbModal,
    private toaster: ToastrService,
    private userSettings: UserSettingsService,
    private authService: AuthService,
    private saveEventService: SaveEventService,
    private router: Router) {
  }

  ngOnInit(): void {
    this.userSettingsSub = this.userSettings.settings.subscribe((value: UserSettingsInterface) => {
      this.defaultCompany = value.defaultCompany;
      this.eventToBeSaved.createrUserId = this.authService.getUserInfo().id;
      this.eventToBeSaved.creatorFromCompanyId = this.defaultCompany.id;
      this.setFnCompanyToSelf(this.defaultCompany);
    });
    this.isOwnCompanySub = this.saveEventService.setIsFnOwnCompany.subscribe(status => {
      this.updateFnCmpToSelf = status;
      if (this.defaultCompany) {
        this.setFnCompanyToSelf(this.defaultCompany);
      }
    });

    this.saveOnlySub = this.saveEventService.triggerSaveOnly.subscribe(() => {
      switch (this.selectedFunction) {
        case EventFunctionTypes.CLIENT:
        case EventFunctionTypes.EVENT_MANAGER:
          this.saveToDb(false);
          break;
        case EventFunctionTypes.VENUE:
          this.saveToDb({index: null, shouldInvite: false});
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
      const tempMap = new Map(this.saveEventService.setIsFnOwnCompany.getValue());
      tempMap.set(this.selectedFunction, true);
      this.saveEventService.setIsFnOwnCompany.next(tempMap);
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
    devLogger('log', {status: company instanceof InviteFnCmpClass, [this.selectedFunction]: company})
    switch (this.selectedFunction) {
      case EventFunctionTypes.CLIENT:
        this.clientCompany = company;
        isInvitedCompany = company instanceof InviteFnCmpClass;
        this.eventToBeSaved.client = {
          id: !isInvitedCompany ? (this.clientCompany as Company).id : null,
          isOwnCompany: isInvitedCompany ? false : (this.clientCompany as Company).id === this.defaultCompany.id,
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
          isOwnCompany: isInvitedCompany ? false : (this.eventMgrCmp as Company).id === this.defaultCompany.id,
          invited: isInvitedCompany ? (company as InviteFnCmpClass) : null,
          shouldInvite: isInvitedCompany ? null : 1,
          contacts: null,
          requirements: ''
        };
        break;
      case EventFunctionTypes.VENUE:
        this.venueCompanies?.push(company);
        const activatedVenuePanelIndex = this.saveEventService.activeVenuePanelIndex;
        if (activatedVenuePanelIndex !== null && this.venueCompanies) {
          // @ts-ignore
          this.venueFn?.venueAssignCmp.get(activatedVenuePanelIndex).setSelectedCompany(company);
          this.setSelectedFnCompanyContacts([]);
        }
        break;
      case EventFunctionTypes.SUPPLIERS:
        break;
      case EventFunctionTypes.EXHIBITORS:
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
        const activatedVenuePanelIndex = this.saveEventService.activeVenuePanelIndex;
        if (activatedVenuePanelIndex !== null && this.venueCompanies) {
          return (this.venueCompanies[activatedVenuePanelIndex] as Company)?.id;
        } else {
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
        const activatedVenuePanelIndex = this.saveEventService.activeVenuePanelIndex;
        if (activatedVenuePanelIndex !== null && this.venueFn?.venueAssignCmp) {
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
        const activatedVenuePanelIndex = this.saveEventService.activeVenuePanelIndex;
        if (activatedVenuePanelIndex !== null && this.venueFn?.venueAssignCmp) {
          let venueAssignCmpCnt: EventAssignFunctionCmpComponent | undefined;
          venueAssignCmpCnt = this.venueFn?.venueAssignCmp.get(activatedVenuePanelIndex);
          if (venueAssignCmpCnt) {
            return this.venueContactLists[activatedVenuePanelIndex].slice(0);
          }
        }
        return [];
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

  unsetClientCompany(): void {
    const clientCompanyInstOfInviteFnCmp = this.clientCompany instanceof InviteFnCmpClass;
    const wasOwnCompany = !clientCompanyInstOfInviteFnCmp && (this.clientCompany as Company).id === this.defaultCompany.id;
    this.clientCompany = null;
    this.clientContactList = [];
    this.eventToBeSaved.client = null;
    if (wasOwnCompany) {
      const tempMap = new Map(this.saveEventService.setIsFnOwnCompany.getValue());
      tempMap.set(EventFunctionTypes.CLIENT, !tempMap.get(EventFunctionTypes.CLIENT));
      this.saveEventService.setIsFnOwnCompany.next(tempMap);
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
      const tempMap = new Map(this.saveEventService.setIsFnOwnCompany.getValue());
      tempMap.set(EventFunctionTypes.EVENT_MANAGER, !tempMap.get(EventFunctionTypes.EVENT_MANAGER));
      this.saveEventService.setIsFnOwnCompany.next(tempMap);
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
          id: (this.clientCompany as Company).id,
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
          invited: (this.clientCompany as InviteFnCmpClass),
          requirements: this.eventToBeSaved.eventManager?.requirements || ''
        };

      }
      devLogger('log', {event: this.eventToBeSaved});

    }
  }


  unsetVenueCmp(index: number): void {
    this.venueCompanies?.splice(index, 1);
    this.venueCompanies = this.venueCompanies?.slice(0);
    this.venueContactLists = this.venueContactLists.splice(index, 1);
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
            this.eventToBeSaved.venues!.list[i].invited = (this.clientCompany as InviteFnCmpClass);
          }
        }
        if (this.eventToBeSaved.venues) {
          this.eventToBeSaved.venues.list = this.eventToBeSaved.venues.list
            .filter(venueCmp => venueCmp.companyId !== null || venueCmp.invited !== null);
        }
      } else {
        this.eventToBeSaved.venues = null;
      }
      devLogger('log', {event: this.eventToBeSaved});
    }

  }

  saveToDb(param: { index: number | null, shouldInvite: boolean } | boolean = {
    index: null,
    shouldInvite: false
  }): void {

    switch (this.selectedFunction) {
      case EventFunctionTypes.CLIENT:
        this.saveClient(typeof param === 'boolean' ? param : false);
        this.saveEvMgr(false);
        this.saveVenueCmp({index: null, shouldInvite: false});
        break;
      case EventFunctionTypes.EVENT_MANAGER:
        this.saveClient(false);
        this.saveEvMgr(typeof param === 'boolean' ? param : false);
        this.saveVenueCmp({index: null, shouldInvite: false});
        break;
      case EventFunctionTypes.VENUE:
        this.saveClient(false);
        this.saveEvMgr(false);
        if (typeof param !== 'boolean') {
          this.saveVenueCmp({index: param.index, shouldInvite: param.shouldInvite});
        }
        break;
    }

    if (!this.isEventClientInvalid && !this.isEventMgrInvalid && !this.isEventVenuesInvalid) {
      this.saveEventSub = this.saveEventService.saveToDb(this.eventToBeSaved).subscribe(
        value => {
          if (value) {
            this.toaster.success('Event saved successfully');
            this.router.navigateByUrl('/home', {skipLocationChange: true}).then(() => {
              this.router.navigate(['/home/event/create']);
            });
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

  ngOnDestroy(): void {
    this.userSettingsSub?.unsubscribe();
    this.isOwnCompanySub?.unsubscribe();
    this.saveEventSub?.unsubscribe();
    this.saveOnlySub?.unsubscribe();
  }

}
