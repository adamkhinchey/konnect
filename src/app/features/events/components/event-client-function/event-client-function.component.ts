import {Component, Input, OnInit, EventEmitter, Output, OnChanges, SimpleChanges, OnDestroy} from '@angular/core';
import {NgbNav} from "@ng-bootstrap/ng-bootstrap";
import {Company} from "../../../users/models";
import {InviteFnCmpInterface} from "../../models/interfaces";
import {InviteFnCmpClass} from "../../models/classes";
import {SaveEventClass} from "../../models/classes/saveEvent.class";
import {BehaviorSubject, Subject, Subscription} from "rxjs";

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
  @Output() toggleOwnCompany = new EventEmitter<boolean>();
  @Input() clientCmpToSelfSub: BehaviorSubject<boolean | null> | undefined;
  isOwnCompany = false;
  private subs1: Subscription | undefined;

  constructor() {
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
    this.subs1 = this.clientCmpToSelfSub?.subscribe(value => {
      if (value !== null) {
        this.isOwnCompany = value;
      }
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

  ngOnDestroy(): void {
    this.subs1?.unsubscribe();
  }

}
