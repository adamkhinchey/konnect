import {Component, OnInit, ViewChild} from '@angular/core';
import {NgbModal, NgbModalRef, NgbNavChangeEvent} from '@ng-bootstrap/ng-bootstrap';
import {EventPanelNavComponent} from '../event-panel-nav/event-panel-nav.component';
import {Company} from '../../../users/models';
import {EventFunctionTypes} from '../../models/types';
import {InviteFnCmpInterface} from '../../models/interfaces';
import {InviteFnCmpClass} from '../../models/classes';
import {InviteFnCmpCntInterface} from "../../models/interfaces/invite-fn-cmp-cnt.interface";
import {SaveEventClass} from "../../models/classes/saveEvent.class";

@Component({
  selector: 'app-create-event',
  templateUrl: './create-event.component.html',
  styleUrls: ['./create-event.component.scss']
})
export class CreateEventComponent implements OnInit {
  @ViewChild('app-event-panel-nav') eventPanelNav: EventPanelNavComponent | undefined;
  saveEvent = new SaveEventClass();
  active = 1;
  disabled = true;
  modalReference: NgbModalRef | undefined;
  clientCompany: Company | InviteFnCmpInterface | undefined | null;
  private clientContactList: InviteFnCmpCntInterface[] | null = null;
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


  constructor(private modalService: NgbModal) {
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
      this.clientContactList = contactList;
    }
    this.searchInviteContactModalClosed();
  }
}
