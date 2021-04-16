import {Component, OnInit, ViewChild} from '@angular/core';
import {NgbModal, NgbModalRef, NgbNavChangeEvent} from '@ng-bootstrap/ng-bootstrap';
import {EventPanelNavComponent} from '../event-panel-nav/event-panel-nav.component';
import {Company} from '../../../users/models';
import {EventFunctionTypes} from '../../models/types';
import {FnCmpCntInterface, InviteFnCmpInterface} from '../../models/interfaces';
import {InviteFnCmpClass} from '../../models/classes';
import {InviteFnCmpCntInterface} from '../../models/interfaces';
import {SaveEventClass} from '../../models/classes/saveEvent.class';
import {ToastrService} from 'ngx-toastr';
import {devLogger} from '../../../../shared/utils';

@Component({
  selector: 'app-create-event',
  templateUrl: './create-event.component.html',
  styleUrls: ['./create-event.component.scss']
})
export class CreateEventComponent implements OnInit {
  @ViewChild('app-event-panel-nav') eventPanelNav: EventPanelNavComponent | undefined;
  eventToBeSaved = new SaveEventClass();
  active = 1;
  disabled = true;
  modalReference: NgbModalRef | undefined;
  clientCompany: Company | InviteFnCmpInterface | undefined | null;
  clientContactList: FnCmpCntInterface[] = [];
  selectedFunction: EventFunctionTypes = this.active;
  isFnCmpInvited: boolean | undefined;

  onNavChange(changeEvent: NgbNavChangeEvent): void {
    this.selectedFunction = changeEvent.nextId;
  }

  toggleDisabled(): void {
    this.disabled = !this.disabled;
    if (this.disabled) {
      this.active = 1;
    }
  }


  constructor(private modalService: NgbModal, private toaster: ToastrService) {
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
}
