import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { Company } from '../../../users/models';
import { InviteFnCmpClass } from '../../models/classes';
import { SaveEventClass } from '../../models/classes/saveEvent.class';
import { Subscription } from 'rxjs';
import { EventService } from '../../services/event.service';
import { EventFunctionTypes } from '../../models/types';

@Component({
  selector: 'app-event-manager-function',
  templateUrl: './event-manager-function.component.html',
  styleUrls: ['./event-manager-function.component.scss']
})
export class EventManagerFunctionComponent implements OnInit, OnDestroy, OnChanges {
  @Input() eventData: any;
  @Input() selectedCompany: Company | InviteFnCmpClass | undefined | null;
  @Input() content: any;
  @Output() removeSelectedCompany = new EventEmitter<any>();
  @Input() eventToBeSaved = new SaveEventClass();
  @Output() saveAndInvite = new EventEmitter<boolean>();
  @Input() isOwnCompany: boolean = false;
  private subs1: Subscription | undefined;
  private subs2: Subscription | undefined;
  @Output() editClient = new EventEmitter<boolean>();
  @Output() editManager = new EventEmitter<boolean>();
  @Output() editVenue = new EventEmitter<boolean>();
  @Output() editService = new EventEmitter<boolean>();
  @Output() editExhibitor = new EventEmitter<boolean>();
  isEventEdit: boolean = false;

  @Input() permissionObj: any;

  constructor(public eventService: EventService) {
  }

  ngOnChanges(changes: SimpleChanges) {
    // this.isEventEdit = this.eventService.isEdit;
    // this.editClient.emit(this.isEventEdit);
  }

  editEventManager() {
    this.eventService.isEdit = true;
    this.isEventEdit = true;
    this.editManager.emit(this.isEventEdit);
  }

  ngOnInit(): void {
    this.subs2 = this.eventService.isEditChange.subscribe((value) => {
      this.isEventEdit = value;
      this.editManager.emit(this.isEventEdit);
    })
    if (this.eventData.eventData.isDeleted == 1) {
      this.eventService.isDeleted = true;
    }

    this.subs1 = this.eventService.setIsFnOwnCompany.subscribe(status => {
      this.isOwnCompany = !!status.get(EventFunctionTypes.EVENT_MANAGER);
    });
  }

  openVerticallyCentered(content: any): void {

  }

  getCompanyProfileImage(): string | null | undefined {
    if (this.selectedCompany instanceof InviteFnCmpClass) {
      return null;
    } else {
      return this.selectedCompany?.companyProfileImage;
    }
  }

  getCompanyWebsite(): string | null | undefined {
    if (this.selectedCompany instanceof InviteFnCmpClass) {
      return null;
    } else {
      return this.selectedCompany?.website;
    }
  }

  getCompanyPhone(): string | null | undefined {
    if (this.selectedCompany instanceof InviteFnCmpClass) {
      return null;
    } else {
      return this.selectedCompany?.phone;
    }
  }

  toggleEvMgrOwnCompany(): void {
    const tempMap = new Map(this.eventService.setIsFnOwnCompany.getValue());
    tempMap.set(EventFunctionTypes.EVENT_MANAGER, !tempMap.get(EventFunctionTypes.EVENT_MANAGER));
    this.eventData.eventData.eventManager.isOwnCompany = tempMap.get(EventFunctionTypes.EVENT_MANAGER) ? 1 : 0;
    this.eventService.setIsFnOwnCompany.next(tempMap);

  }

  getCompanyId(): any {
    if (this.selectedCompany instanceof InviteFnCmpClass) {
      return null;
    } else {
      return this.selectedCompany?.id;
    }
  }

  getIsPrivate(): any {
    if (this.selectedCompany instanceof InviteFnCmpClass) {
      return null;
    } else {
      return this.selectedCompany?.isPrivate;
    }
  }

  goToCompanyProfile(companyId: any) {
    console.log(companyId);
    if (companyId && this.getIsPrivate() == 0) {
      localStorage.setItem('companyId', JSON.stringify(companyId));
      localStorage.setItem('isView', JSON.stringify(true));
      window.open('/home/company/manage-company?isView=' + true);
    }
  }

  ngOnDestroy(): void {
    this.subs1?.unsubscribe();
    this.subs2?.unsubscribe();
  }
}
