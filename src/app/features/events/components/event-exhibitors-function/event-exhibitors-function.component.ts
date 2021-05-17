import {Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild} from '@angular/core';
import {NgbAccordion, NgbPanelChangeEvent} from '@ng-bootstrap/ng-bootstrap';
import {SaveEventClass} from '../../models/classes/saveEvent.class';
import {Subscription} from 'rxjs';
import {Company} from '../../../users/models';
import {
  InviteFnCmpCntInterface,
  InviteFnCmpInterface,
  SuppExhTimeWindowFormatInterface,
  VenueListItemInterface
} from '../../models/interfaces';
import {EventService} from '../../services/event.service';
import {devLogger} from '../../../../shared/utils';
import {InviteFnCmpClass} from '../../models/classes';
import {EventTimeWindowTypes} from "../../models/types";

@Component({
  selector: 'app-event-exhibitors-function',
  templateUrl: './event-exhibitors-function.component.html',
  styleUrls: ['./event-exhibitors-function.component.scss']
})
export class EventExhibitorsFunctionComponent implements OnInit, OnDestroy {
  @ViewChild('ngbAccordion') ngbAccordion: NgbAccordion | undefined;
  @Input() eventToBeSaved = new SaveEventClass();
  @Output() saveAndInvite = new EventEmitter<{ venueIndex: number, exhibitorIndex: number, shouldInvite: boolean }>();
  @Input() searchInviteCmpModal: any;
  @Input() searchInviteFnCmpCntModal: any;
  @Input() setOpenedModalRef: any;
  @Input() content: any;
  activeExhibitorPanel = 0;
  private exhCompanyAddedSub: Subscription | undefined;
  private exhCmpCntAddedSub: Subscription | undefined;
  venuesExhCmpsMap = new Map<number, Map<number, Company | InviteFnCmpInterface>>();
  eventTimeWindowType = EventTimeWindowTypes.Exhibitor;
  eventTimeWindowForAllExh = EventTimeWindowTypes.ALL_EXHIBITORS;

  constructor(private eventService: EventService) {
  }

  ngOnInit(): void {
    this.exhCompanyAddedSub = this.eventService.exhibitorCompanyAddSubject
      .subscribe(value => {
        devLogger('log', 'exhCompanyAddedSub');
        devLogger('log', value);
        const isInvited = value.exhibitorCompany instanceof InviteFnCmpClass;
        const exhibitor = this.eventToBeSaved.venues?.list[value.venueIndex]
          .exhibitorList[0].exhibitors[value.exhibitorIndex];

        if (exhibitor) {
          exhibitor.companyId = isInvited ? null : (value.exhibitorCompany as Company).id;
          exhibitor.invited = isInvited ? (value.exhibitorCompany as InviteFnCmpClass) : null;
          exhibitor.contacts = isInvited ? null : [];
          if (this.venuesExhCmpsMap.has(value.venueIndex)) {
            this.venuesExhCmpsMap.get(value.venueIndex)?.set(value.exhibitorIndex, value.exhibitorCompany);
          } else {
            const exhibitorCmpMap = new Map([[value.exhibitorIndex, value.exhibitorCompany]]);
            this.venuesExhCmpsMap.set(value.venueIndex, exhibitorCmpMap);
          }

          devLogger('log', this.venuesExhCmpsMap);
        }
      });

    this.exhCmpCntAddedSub = this.eventService.exhibitorCmpCntAddSubject.subscribe(value => {
      this.setContacts(value);
    });
  }

  private setContacts(value: { venueIndex: number; exhibitorIndex: number; contactList: InviteFnCmpCntInterface[] }): void {
    const exhibitor = this.eventToBeSaved.venues?.list[value.venueIndex]
      .exhibitorList[0].exhibitors[value.exhibitorIndex];
    if (exhibitor) {
      if (exhibitor.contacts) {
        exhibitor.contacts = exhibitor.contacts.concat([...value.contactList]);
      } else {
        exhibitor.contacts = [...value.contactList];
      }
    }
  }

  openVerticallyCentered(content: any): void {

  }

  panelChange($event: NgbPanelChangeEvent): void {

  }

  addExhibitor(venue: VenueListItemInterface, venueIndex: number): void {
    if (!venue.exhibitorList[0]) {
      const timeWindows: SuppExhTimeWindowFormatInterface = {
        bumpIn: {sameAsVenue: null, timings: []},
        bumpOut: {sameAsVenue: null, timings: []},
        eventTime: {sameAsVenue: null, timings: []}
      };
      venue.exhibitorList[0] = {
        notesToAll: '',
        timeWindowsToAll: timeWindows,
        exhibitors: [{
          standNumber: null,
          name: '',
          shouldInvite: 0,
          invited: null,
          contacts: null,
          companyId: null,
          requirement: '',
          timeWindows
        }]
      };
    } else {
      const timeWindows: SuppExhTimeWindowFormatInterface = {
        bumpIn: {sameAsVenue: null, timings: []},
        bumpOut: {sameAsVenue: null, timings: []},
        eventTime: {sameAsVenue: null, timings: []}
      };
      venue.exhibitorList[0].exhibitors.push({
        standNumber: null,
        name: '',
        shouldInvite: 0,
        invited: null,
        contacts: null,
        companyId: null,
        requirement: '',
        timeWindows
      });
    }
    this.ngbAccordion?.collapseAll();
    this.activeExhibitorPanel = venue.exhibitorList[0].exhibitors.length - 1;
    this.eventService.activeExhibitorPanel = {venueIndex, exhibitorIndex: this.activeExhibitorPanel};
    // devLogger('log', {selectedCompanies: this.selectedCompanies});
  }

  exhibitorPanelActivated(venueIndex: number, exhibitorIndex: number): void {
    this.activeExhibitorPanel = exhibitorIndex;
    this.eventService.activeExhibitorPanel = {venueIndex, exhibitorIndex};
  }

  removeExhibitorContact(venueIndex: number, exhibitorIndex: number, event: number): void {
    const exhibitor = this.eventToBeSaved.venues?.list[venueIndex]
      .exhibitorList[0]?.exhibitors[exhibitorIndex];
    if (exhibitor && exhibitor.contacts) {
      exhibitor.contacts.splice(event, 1);
    }
  }

  getCompanyProfileImage(company: Company | InviteFnCmpClass | undefined): string | null | undefined {
    if (!company) {
      return null;
    }
    if (company instanceof InviteFnCmpClass) {
      return null;
    } else {
      return (company as Company)?.companyProfileImage;
    }
  }

  getCompanyWebsite(company: Company | InviteFnCmpClass | undefined): string | null | undefined {
    if (!company) {
      return null;
    }
    if (company instanceof InviteFnCmpClass) {
      return null;
    } else {
      return (company as Company)?.companyProfileImage;
    }
  }

  getCompanyPhone(company: Company | InviteFnCmpClass | undefined): string | null | undefined {
    if (!company) {
      return null;
    }
    if (company instanceof InviteFnCmpClass) {
      return null;
    } else {
      return (company as Company)?.phone;
    }
  }

  removeSelectedCompany(venueIndex: number, exhibitorIndex: number): void {
    const exhibitor = this.eventToBeSaved.venues?.list[venueIndex]
      .exhibitorList[0].exhibitors[exhibitorIndex];

    if (exhibitor) {
      exhibitor.companyId = null;
      exhibitor.contacts = null;
      exhibitor.shouldInvite = null;
      exhibitor.invited = null;
      this.venuesExhCmpsMap.get(venueIndex)?.delete(exhibitorIndex);
    }
  }

  ngOnDestroy(): void {
    this.exhCompanyAddedSub?.unsubscribe();
    this.exhCmpCntAddedSub?.unsubscribe();
  }
}
