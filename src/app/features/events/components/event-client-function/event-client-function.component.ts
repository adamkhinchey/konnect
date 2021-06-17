import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {Company} from "../../../users/models";
import {InviteFnCmpClass} from "../../models/classes";
import {SaveEventClass} from "../../models/classes/saveEvent.class";
import {Subscription} from "rxjs";
import {EventService} from "../../services/event.service";
import {EventFunctionTypes} from "../../models/types";

@Component({
  selector: 'app-event-client-function',
  templateUrl: './event-client-function.component.html',
  styleUrls: ['./event-client-function.component.scss'],
})
export class EventClientFunctionComponent implements OnInit, OnDestroy {
  @Input() selectedCompany: Company | InviteFnCmpClass | undefined | null;
  @Input() content: any;
  @Output() removeSelectedCompany = new EventEmitter<any>();
  @Input() eventToBeSaved = new SaveEventClass();
  @Output() saveAndInvite = new EventEmitter<boolean>();
  isOwnCompany = false;
  private subs1: Subscription | undefined;
  private subs2: Subscription | undefined;

  constructor(private eventService: EventService) {
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
    this.eventService.setIsFnOwnCompany.next(tempMap);
  }

  ngOnDestroy(): void {
    this.subs1?.unsubscribe();
    this.subs2?.unsubscribe();
  }

  getCompanyId(): any {
    if (this.selectedCompany instanceof InviteFnCmpClass) {
      return null;
    } else {
      return this.selectedCompany?.id;
    }
  }

  goToCompanyProfile(companyId:any) {
    console.log(companyId);
    if (companyId) {
      localStorage.setItem('companyId', JSON.stringify(companyId));
      localStorage.setItem('isView', JSON.stringify(true));
      window.open('/home/company/manage-company', '_blank');
    }
  }

}
