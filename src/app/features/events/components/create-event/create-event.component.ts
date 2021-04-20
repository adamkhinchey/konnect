import {AfterViewInit, Component, OnDestroy, OnInit, QueryList, ViewChild, ViewChildren} from '@angular/core';
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
import {EventVenueFunctionComponent} from "../event-venue-function/event-venue-function.component";

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


  clientCompany: Company | InviteFnCmpInterface | undefined | null;
  clientContactList: FnCmpCntInterface[] = [];

  eventMgrCmp: Company | InviteFnCmpInterface | undefined | null;
  eventMgrContactList: FnCmpCntInterface[] = [];

  venueCompanies: Array<Company | InviteFnCmpInterface> | undefined | null = [];
  venueContactLists: Array<Array<FnCmpCntInterface>> = [];

  constructor(
    private modalService: NgbModal,
    private toaster: ToastrService,
    private userSettings: UserSettingsService,
    private authService: AuthService,
    private saveEventService: SaveEventService) {
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
              id: (this.clientCompany as Company).id,
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
    switch (this.selectedFunction) {
      case EventFunctionTypes.CLIENT:
        this.clientCompany = company;
        // this.isFnCmpInvited = company instanceof InviteFnCmpClass;
        break;
      case EventFunctionTypes.EVENT_MANAGER:
        this.eventMgrCmp = company;
        break;
      case EventFunctionTypes.VENUE:
        this.venueCompanies?.push(company);
        const activatedVenuePanelIndex = this.saveEventService.activeVenuePanelIndex;
        if (activatedVenuePanelIndex !== null && this.venueCompanies) {
          // @ts-ignore
          this.venueFn?.venueAssignCmp.get(activatedVenuePanelIndex).setSelectedCompany(company);
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
        this.venueContactLists.push(contactList);
        this.venueContactLists = [...this.venueContactLists];
        const activatedVenuePanelIndex = this.saveEventService.activeVenuePanelIndex;
        let venueAssignCmpCnt: EventAssignFunctionCmpComponent | undefined;
        if (activatedVenuePanelIndex !== null && this.venueFn?.venueAssignCmp) {
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
      this.saveToDb();
    }
  }

  unsetClientCompany(): void {
    this.clientCompany = null;
    this.clientContactList = [];
    this.eventToBeSaved.client = null;
    const tempMap = new Map(this.saveEventService.setIsFnOwnCompany.getValue());
    tempMap.set(EventFunctionTypes.CLIENT, !tempMap.get(EventFunctionTypes.CLIENT));
    this.saveEventService.setIsFnOwnCompany.next(tempMap);
  }

  removeContact(index: number): void {
    switch (this.selectedFunction) {
      case EventFunctionTypes.CLIENT:
        this.clientContactList?.splice(index, 1);
        return;
      default:
        return;
    }
  }

  unsetEvMgrCmp(): void {
    this.eventMgrCmp = null;
    this.eventMgrContactList = [];
    this.eventToBeSaved.eventManager = null;
    const tempMap = new Map(this.saveEventService.setIsFnOwnCompany.getValue());
    tempMap.set(EventFunctionTypes.EVENT_MANAGER, !tempMap.get(EventFunctionTypes.EVENT_MANAGER));
    this.saveEventService.setIsFnOwnCompany.next(tempMap);
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
      this.saveToDb();
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

  saveVenueCmp(event: { index: number; shouldInvite: boolean }): void {

  }


  private saveToDb(): void {
    if (this.isEventClientValid() && this.isEventClientValid()) {

      this.saveEventService.saveToDb(this.eventToBeSaved).subscribe(
        value => {
          if (value) {
            this.toaster.success('Event saved successfully');
          }
        },
        error => {
          devLogger('error', {saveEventError: error});
          this.toaster.error('Failed to save event');
        }, () => {
        }
      );
    }
  }

  private isEventClientValid(): boolean {
    if (!this.clientCompany) {
      this.toaster.error('Please select a client company');
      return false;
    }
    if (this.clientCompany &&
      !(this.clientCompany instanceof InviteFnCmpClass) &&
      this.clientContactList?.length === 0) {
      this.toaster.error('Please select or invite at-least one contact for the client company');
      return false;
    }
    devLogger('log', {clientComapny: this.clientCompany, contactList: this.clientContactList});

    if (this.eventToBeSaved.title.trim().length === 0) {
      this.toaster.error('Event title is required');
      return false;
    }
    return true;
  }

  private isEventMangerValid(): boolean {
    if (!this.eventMgrCmp) {
      this.toaster.error('Please select event manager company');
      return false;
    }
    if (this.eventMgrCmp &&
      !(this.eventMgrCmp instanceof InviteFnCmpClass) &&
      this.eventMgrContactList?.length === 0) {
      this.toaster.error('Please select or invite at-least one contact for the event manager company');
      return false;
    }
    devLogger('log', {eventMgrCmp: this.eventMgrCmp, contactList: this.eventMgrContactList});
    return true;
  }

  ngOnDestroy(): void {
    this.userSettingsSub?.unsubscribe();
    this.isOwnCompanySub?.unsubscribe();
  }

}
