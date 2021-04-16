import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Company} from "../../../users/models";
import {InviteFnCmpClass} from "../../models/classes";
import {SaveEventClass} from "../../models/classes/saveEvent.class";
import {BehaviorSubject, Subscription} from "rxjs";

@Component({
  selector: 'app-event-manager-function',
  templateUrl: './event-manager-function.component.html',
  styleUrls: ['./event-manager-function.component.scss']
})
export class EventManagerFunctionComponent implements OnInit {
  @Input() selectedCompany: Company | InviteFnCmpClass | undefined | null;
  @Input() content: any;
  @Output() removeSelectedCompany = new EventEmitter<any>();
  @Input() eventToBeSaved = new SaveEventClass();
  @Output() saveAndInvite = new EventEmitter<boolean>();
  @Output() toggleOwnCompany = new EventEmitter<boolean>();
  @Input() EvMgrCmpToSelfSub: BehaviorSubject<boolean | null> | undefined;
  isOwnCompany = false;
  private subs1: Subscription | undefined;

  constructor() {
  }

  ngOnInit(): void {
  }

  openVerticallyCentered(content: any):void {

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
