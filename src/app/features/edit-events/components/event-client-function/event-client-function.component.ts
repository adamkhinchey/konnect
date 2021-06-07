import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { Company } from "../../../users/models";
import { InviteFnCmpClass } from "../../models/classes";
import { SaveEventClass } from "../../models/classes/saveEvent.class";
import { Subscription } from "rxjs";
import { EventService } from "../../services/event.service";
import { EventFunctionTypes } from "../../models/types";
import { Router } from '@angular/router';
import { ViewEventService } from '../../services/view-event.service';

@Component({
  selector: 'app-event-client-function',
  templateUrl: './event-client-function.component.html',
  styleUrls: ['./event-client-function.component.scss'],
})
export class EventClientFunctionComponent implements OnInit, OnDestroy, OnChanges {
  @Input() selectedCompany: Company | InviteFnCmpClass | undefined | null;
  @Input() content: any;
  @Output() removeSelectedCompany = new EventEmitter<any>();
  @Input() eventToBeSaved = new SaveEventClass();
  @Output() saveAndInvite = new EventEmitter<boolean>();
  @Input() isOwnCompany: boolean = false;
  private subs1: Subscription | undefined;
  private subs2: Subscription | undefined;
  @Input() eventData: any;
  @Output() editClient = new EventEmitter<boolean>();


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
  }

  ngOnChanges(changes:SimpleChanges){
    this.isClientEdit = this.eventService.isEdit;
    this.editClient.emit(this.isClientEdit);
  }


  booleanFalse() {
    this.isClientEdit = false;
    this.isEventEdit = false;
    this.isVenueEdit = false;;
    this.isSupplierEdit = false;
    this.isExhibitorEdit = false;
  }

  editClientEvent() {
    this.eventService.isEdit = !this.isClientEdit;
    this.isClientEdit = !this.isClientEdit;
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
    console.log('before next in toggle: ', this.eventData.eventData.client.isOwnCompany);
    const tempMap = new Map(this.eventService.setIsFnOwnCompany.getValue());
    tempMap.set(EventFunctionTypes.CLIENT, !tempMap.get(EventFunctionTypes.CLIENT));
    this.eventData.eventData.client.isOwnCompany = tempMap.get(EventFunctionTypes.CLIENT) ? 1 : 0;
    this.eventService.setIsFnOwnCompany.next(tempMap);
    console.log('after next in toggle: ', this.eventData.eventData.client.isOwnCompany);

  }

  ngOnDestroy(): void {
    this.subs1?.unsubscribe();
    this.subs2?.unsubscribe();
  }

  deleteEvent(eventId: any) {
    this.viewEvSrvc.deleteEvent(eventId).subscribe((res: any) => {
      console.log(res);
      this.router.navigate(['/home']);
    }, (err: any) => {
      console.log(err);
    })
  }
}
