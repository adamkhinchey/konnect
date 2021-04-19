import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Company} from "../../../users/models";
import {InviteFnCmpClass} from "../../models/classes";
import {SaveEventClass} from "../../models/classes/saveEvent.class";
import {Subscription} from "rxjs";

@Component({
  selector: 'app-event-venue-function',
  templateUrl: './event-venue-function.component.html',
  styleUrls: ['./event-venue-function.component.scss']
})
export class EventVenueFunctionComponent implements OnInit {

  @Input() selectedCompanies: Company[] | InviteFnCmpClass[] | undefined | null;
  @Input() content: any;
  @Output() removeSelectedCompany = new EventEmitter<number>();
  @Input() eventToBeSaved = new SaveEventClass();
  @Output() saveAndInvite = new EventEmitter<{ index: number, shouldInvite: boolean }>();
  isOwnCompany = false;
  private subs1: Subscription | undefined;
  private subs2: Subscription | undefined;
  activeVenuePanel = 0;

  constructor() {
  }

  ngOnInit(): void {
  }

  addVenue(): void {
    if (!this.eventToBeSaved.venues) {
      this.eventToBeSaved.venues = {
        list: [{
          companyId: null,
          requirements: '',
          eventAccessDateTimes: [],
          preEventAccessDateTimes: [],
          postEventAccessDateTimes: [],
          contacts: null
        }],
        notesToAll: ''
      };
    }else {
      this.eventToBeSaved.venues.list.push({
        companyId: null,
        requirements: '',
        eventAccessDateTimes: [],
        preEventAccessDateTimes: [],
        postEventAccessDateTimes: [],
        contacts: null
      });
    }
    this.activeVenuePanel = this.eventToBeSaved.venues.list.length - 1;
  }
}
