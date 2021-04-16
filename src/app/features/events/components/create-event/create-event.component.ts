import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
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
import {BehaviorSubject, Subject, Subscription} from 'rxjs';
import {AuthService} from "../../../../core/services/auth.service";

@Component({
  selector: 'app-create-event',
  templateUrl: './create-event.component.html',
  styleUrls: ['./create-event.component.scss']
})
export class CreateEventComponent implements OnInit, OnDestroy {
  @ViewChild('app-event-panel-nav') eventPanelNav: EventPanelNavComponent | undefined;
  active = 1;
  disabled = true;
  modalReference: NgbModalRef | undefined;
  eventToBeSaved = new SaveEventClass();
  updateFnCmpToSelf = true;
  selectedFunction: EventFunctionTypes = this.active;
  isFnCmpInvited: boolean | undefined;
  private userSettingsSub: Subscription | undefined;
  defaultCompany: any;


  clientCompany: Company | InviteFnCmpInterface | undefined | null;
  clientContactList: FnCmpCntInterface[] = [];
  updateClientCmpToSelf = new BehaviorSubject<boolean | null>(null);

  eventMgrCmp: Company | InviteFnCmpInterface | undefined | null;
  updateEvMgrCmpToSelf = new BehaviorSubject<boolean | null>(null);
  EvMgrContactList: FnCmpCntInterface[] = [];

  onNavChange(changeEvent: NgbNavChangeEvent): void {
    this.selectedFunction = changeEvent.nextId;
  }

  toggleDisabled(): void {
    this.disabled = !this.disabled;
    if (this.disabled) {
      this.active = 1;
    }
  }


  constructor(
    private modalService: NgbModal,
    private toaster: ToastrService,
    private userSettings: UserSettingsService,
    private authService: AuthService) {
  }


  openVerticallyCentered(content: any): void {
    this.modalReference = this.modalService.open(content, {
      centered: true,
      size: 'lg',
    });

  }

  openVerticallyCentered2(content: any): void {
    this.modalReference = this.modalService.open(content, {
      centered: true,
      size: 'lg',
    });

  }

  contentUpload(contentNew: any): void {
    this.modalReference = this.modalService.open(contentNew, {
      centered: true,
      size: 'md',
    });

  }


  ngOnInit(): void {
    this.userSettingsSub = this.userSettings.settings.subscribe((value: UserSettingsInterface) => {
      this.defaultCompany = value.defaultCompany;
      this.eventToBeSaved.createrUserId = this.authService.getUserInfo().id;
      this.eventToBeSaved.creatorFromCompanyId = this.defaultCompany.id;
      this.setFnCompanyToSelf(value);
    });
  }

  private setFnCompanyToSelf(value: UserSettingsInterface): void {
    if (value.defaultCompany && value.defaultCompany.id) {
      switch (this.selectedFunction) {
        case EventFunctionTypes.CLIENT:
          if (this.updateFnCmpToSelf) {
            this.clientCompany = value.defaultCompany;
            this.eventToBeSaved.client = {
              id: (this.clientCompany as Company).id,
              isOwnCompany: true,
              invited: null,
              shouldInvite: 1,
              contacts: null
            };

            this.updateClientCmpToSelf.next(true);
          }
          return;
        default:
          return;
      }
    }
  }

  searchInviteContactModalClosed(): void {
    this.modalReference?.close();
  }

  searchInviteCompanyClosed(): void {
    this.modalReference?.close();
  }

  setSelectedCompany(company: Company | InviteFnCmpClass): void {
    if (this.selectedFunction === EventFunctionTypes.CLIENT) {
      this.clientCompany = company;
      this.isFnCmpInvited = company instanceof InviteFnCmpClass;
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
      default:
        return null;
    }
  }

  setSelectedFnCompanyContacts(contactList: InviteFnCmpCntInterface[]): void {
    if (this.selectedFunction === EventFunctionTypes.CLIENT) {
      this.clientContactList = [...this.clientContactList, ...contactList];
    }
    this.searchInviteContactModalClosed();
  }

  saveClient(shouldInvite: boolean): void {
    if (!this.clientCompany) {
      this.toaster.error('Please select a client company');
      return;
    }
    if (this.clientCompany &&
      !(this.clientCompany instanceof InviteFnCmpClass) &&
      this.clientContactList?.length === 0) {
      this.toaster.error('Please select or invite at-least one contact');
      return;
    }
    devLogger('log', {clientComapny: this.clientCompany, contactList: this.clientContactList});

    if (this.eventToBeSaved.title.trim().length === 0) {
      this.toaster.error('Event title is required');
      return;
    }


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

  unsetClientCompany(): void {
    this.clientCompany = null;
    this.clientContactList = [];
    this.eventToBeSaved.client = null;
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


  toggleOwnCompany(status: boolean): void {
    this.updateFnCmpToSelf = status;
    switch (this.selectedFunction) {
      case EventFunctionTypes.CLIENT:
        this.clientContactList = [];
        if (this.eventToBeSaved && this.eventToBeSaved.client) {
          this.eventToBeSaved.client.isOwnCompany = status;
          if (status) {
            this.eventToBeSaved.client = {
              id: (this.defaultCompany as Company).id,
              isOwnCompany: true,
              invited: null,
              shouldInvite: 1,
              contacts: null
            };
            this.clientCompany = this.defaultCompany;
            this.updateClientCmpToSelf.next(true);
          } else if (!status) {
            this.clientCompany = null;
            this.updateClientCmpToSelf.next(false);
          }
        }
        return;
      default:
        return;
    }

  }

  ngOnDestroy(): void {
    this.userSettingsSub?.unsubscribe();
  }

  unsetEvMgrCmp() {

  }

  saveEvMgr() {

  }
}
