import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { Company } from "../../../users/models";
import { InviteFnCmpClass } from "../../models/classes";
import { SaveEventClass } from "../../models/classes/saveEvent.class";
import { Subscription } from "rxjs";
import { EventService } from "../../services/event.service";
import { EventFunctionTypes } from "../../models/types";
import { Router } from '@angular/router';
import { ViewEventService } from '../../services/view-event.service';
import { faAddressCard } from '@fortawesome/free-regular-svg-icons';

@Component({
  selector: 'app-event-client-function',
  templateUrl: './event-client-function.component.html',
  styleUrls: ['./event-client-function.component.scss'],
})
export class EventClientFunctionComponent implements OnInit, OnDestroy, OnChanges {
  addressCardIcon = faAddressCard;
  @Input() selectedCompany: Company | InviteFnCmpClass | undefined | null;
  @Input() content: any;
  @Output() removeSelectedCompany = new EventEmitter<any>();
  @Input() eventToBeSaved = new SaveEventClass();
  @Output() saveAndInvite = new EventEmitter<boolean>();
  @Input() isOwnCompany: boolean = false;
  private subs1: Subscription | undefined;
  private subs2: Subscription | undefined;
  private subs3: Subscription | undefined;
  @Input() eventData: any;
  @Output() editClient = new EventEmitter<boolean>();
  @Input() permissionObj: any;

  isSupplier: boolean = false;
  modalReference: any;
  isClientEdit: boolean = false;
  isEventEdit: boolean = false;
  isVenueEdit: boolean = false;
  isSupplierEdit: boolean = false;
  isExhibitorEdit: boolean = true;

  constructor(
    private eventService: EventService,
    private router: Router,
    private viewEvSrvc: ViewEventService
  ) {
    this.eventService.isEdit = false
  }

  ngOnChanges(changes: SimpleChanges) {

  }


  booleanFalse() {
    this.isClientEdit = false;
    this.isEventEdit = false;
    this.isVenueEdit = false;;
    this.isSupplierEdit = false;
    this.isExhibitorEdit = false;
  }

  editClientEvent() {
    this.eventService.isEdit = true;
    this.isClientEdit = true;
    this.editClient.emit(this.isClientEdit);
  }
  editEventManager() {
    this.isEventEdit = true;
  }
  editVenue() {
    this.isVenueEdit = true;
  }
  editSupplier() {
    this.isSupplierEdit = true;
  }
  editExhibitor() {
    this.isExhibitorEdit = true;
  }

  /*ngOnChanges(changes: SimpleChanges): void {
    if (changes && changes.eventToBeSaved && changes.eventToBeSaved.currentValue) {
      const eventData = changes.eventToBeSaved.currentValue;
      if (eventData.client && eventData.client.isOwnCompany) {
        this.isOwnCompany = eventData.client.isOwnCompany;
      }
    }
  }*/

  ngOnInit(): void {
    console.log(this.eventData);
    this.subs3 = this.eventService.isEditChange.subscribe((value) => {
      this.isClientEdit = value;
      this.editClient.emit(this.isClientEdit);
    })
    if (this.eventData.eventData.isDeleted == 1) {
      this.eventService.isDeleted = true;
    }
    /*this.subs1 = this.clientCmpToSelfSub?.subscribe(value => {
      if (value !== null) {
        this.isOwnCompany = value;
      }
    });*/

    this.subs2 = this.eventService.setIsFnOwnCompany.subscribe(status => {
      this.isOwnCompany = !!status.get(EventFunctionTypes.CLIENT);
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

  toggleClientOwnCompany(): void {
    const tempMap = new Map(this.eventService.setIsFnOwnCompany.getValue());
    tempMap.set(EventFunctionTypes.CLIENT, !tempMap.get(EventFunctionTypes.CLIENT));
    this.eventData.eventData.client.isOwnCompany = tempMap.get(EventFunctionTypes.CLIENT) ? 1 : 0;
    this.eventService.setIsFnOwnCompany.next(tempMap);

  }

  ngOnDestroy(): void {
    this.subs1?.unsubscribe();
    this.subs2?.unsubscribe();
    this.subs3?.unsubscribe();
  }

  deleteEvent(eventId: any) {
    this.viewEvSrvc.deleteEvent(eventId).subscribe((res: any) => {
      console.log(res);
      this.router.navigate(['/home']);
    }, (err: any) => {
      console.log(err);
    })
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

  getIsSeed(): any {
    if (this.selectedCompany instanceof InviteFnCmpClass) {
      return null;
    } else {
      return this.selectedCompany?.isSeed;
    }
  }

  goToCompanyProfile(companyId: any) {
    if (companyId) {
      localStorage.setItem('companyId', JSON.stringify(companyId));
      localStorage.setItem('isView', JSON.stringify(true));
      localStorage.setItem('isHeaderDisable', JSON.stringify(true));
      window.open('/home/company/manage-company?isView=' + true);
    }
  }

}
