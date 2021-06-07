import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { NgbAccordion, NgbPanelChangeEvent } from '@ng-bootstrap/ng-bootstrap';
import { SaveEventClass } from '../../models/classes/saveEvent.class';
import { Subscription } from 'rxjs';
import { Company } from '../../../users/models';
import {
  InviteFnCmpCntInterface,
  InviteFnCmpInterface,
  SuppExhTimeWindowFormatInterface,
  VenueListItemInterface
} from '../../models/interfaces';
import { EventService } from '../../services/event.service';
import { devLogger } from '../../../../shared/utils';
import { InviteFnCmpClass } from '../../models/classes';
import { EventTimeWindowTypes } from "../../models/types";
import { ViewEventService } from '../../services/view-event.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-event-exhibitors-function',
  templateUrl: './event-exhibitors-function.component.html',
  styleUrls: ['./event-exhibitors-function.component.scss']
})
export class EventExhibitorsFunctionComponent implements OnInit, OnDestroy, OnChanges{
  @ViewChild('ngbAccordion') ngbAccordion: NgbAccordion | undefined;
  @Input() eventData: any;
  @Input() eventToBeSaved = new SaveEventClass();
  @Output() saveAndInvite = new EventEmitter<{ venueIndex: number, exhibitorIndex: number, shouldInvite: boolean }>();
  @Input() searchInviteCmpModal: any;
  @Input() searchInviteFnCmpCntModal: any;
  @Input() setOpenedModalRef: any;
  @Input() content: any;
  @Input() permissionObj: any;
  @Input() venueCompanies: Array<Company | InviteFnCmpInterface | null> | undefined | null = [];
  activeExhibitorPanel = 0;
  private exhCompanyAddedSub: Subscription | undefined;
  private exhCmpCntAddedSub: Subscription | undefined;
  venuesExhCmpsMap = new Map<number, Map<number, Company | InviteFnCmpInterface>>();
  eventTimeWindowType = EventTimeWindowTypes.Exhibitor;
  eventTimeWindowForAllExh = EventTimeWindowTypes.ALL_EXHIBITORS;
  isExhibitorEdit: boolean = false;
  public isExhibitorEditable: boolean = false;
  @Input() setIsCrew: any;

  constructor(
    public eventService: EventService,
    private viewEventService: ViewEventService,
    private router: Router
  ) {
  }

  editExhibitorFn() {
    this.eventService.isEdit = !this.isExhibitorEdit;
    this.isExhibitorEdit = !this.isExhibitorEdit;
    this.isExhibitorEditable = !this.isExhibitorEditable;
    // this.editVenue.emit(this.isVenueEdit);
  }

  ngOnChanges(changes: SimpleChanges) {
    this.isExhibitorEdit = this.eventService.isEdit;
    this.isExhibitorEditable = this.eventService.isEdit;
  }

  ngOnInit(): void {
    this.exhCompanyAddedSub = this.eventService.exhibitorCompanyAddSubject
      .subscribe(value => {
        devLogger('log', 'exhCompanyAddedSub');
        devLogger('log', value);
        const isInvited = value.exhibitorCompany instanceof InviteFnCmpClass;
        const exhibitor = this.eventToBeSaved.venues?.list[value.venueIndex]
          .exhibitorList[0]?.exhibitors[value.exhibitorIndex];

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
    this.eventService.navigatesToExhibitors.subscribe(() => {
      this.eventService.getFetchedVenueExCmp().forEach((param, index) => {
        this.eventService.activeExhibitorPanel = { venueIndex: param.venueIndex, exhibitorIndex: param.exhibitorIndex };
        if (param.company) {
          this.eventService.exhibitorCompanyAdded(param.company);
        }

        if (index === this.eventService.getFetchedVenueExCmp().length - 1) {
          this.eventService.activeExhibitorPanel = { venueIndex: 0, exhibitorIndex: 0 };
        }
      });

      this.eventService.getFetchedVenueExCmpCnts().forEach((param, index) => {
        this.eventService.activeExhibitorPanel = { venueIndex: param.venueIndex, exhibitorIndex: param.exhibitorIndex };
        if (param.contactList) {
          this.eventService.exhibitorContactsAdded(param.contactList);
        }
        if (index === this.eventService.getFetchedVenueExCmpCnts().length - 1) {
          this.eventService.activeExhibitorPanel = { venueIndex: 0, exhibitorIndex: 0 };
        }
      });
    })

    this.eventService.navigatesToExhibitors.next()
  }

  private setContacts(value: { venueIndex: number; exhibitorIndex: number; contactList: InviteFnCmpCntInterface[] }): void {
    const exhibitor = this.eventToBeSaved.venues?.list[value.venueIndex]
      .exhibitorList[0]?.exhibitors[value.exhibitorIndex];
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
    this.isExhibitorEdit = true;
    this.isExhibitorEditable = true;
    if (!venue.exhibitorList[0]) {
      const timeWindowsToAll: SuppExhTimeWindowFormatInterface = {
        bumpIn: { sameAsVenue: null, timings: [] },
        bumpOut: { sameAsVenue: null, timings: [] },
        eventTime: { sameAsVenue: null, timings: [] }
      };
      const timeWindows: SuppExhTimeWindowFormatInterface = {
        bumpIn: { sameAsVenue: null, timings: [] },
        bumpOut: { sameAsVenue: null, timings: [] },
        eventTime: { sameAsVenue: null, timings: [] }
      };
      venue.exhibitorList[0] = {
        notesToAll: '',
        timeWindowsToAll,
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
        bumpIn: { sameAsVenue: null, timings: [] },
        bumpOut: { sameAsVenue: null, timings: [] },
        eventTime: { sameAsVenue: null, timings: [] }
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
    this.eventService.activeExhibitorPanel = { venueIndex, exhibitorIndex: this.activeExhibitorPanel };
    // devLogger('log', {selectedCompanies: this.selectedCompanies});
  }

  exhibitorPanelActivated(venueIndex: number, exhibitorIndex: number): void {
    this.activeExhibitorPanel = exhibitorIndex;
    this.eventService.activeExhibitorPanel = { venueIndex, exhibitorIndex };
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
      return (company as Company)?.website;
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

  removeDeclineExhibitor(exhibitorId: any, isAccept: any) {
    console.log(exhibitorId);
    let payload = {
      eventId: this.eventData.eventData.eventId,
      tabId: exhibitorId,
      tabType: 5,
      isAccept: isAccept
    }
    this.viewEventService.removeDecline(payload).subscribe((res: any) => {
      console.log(res);
      this.router.navigate(['home']);
    }, err => {
      devLogger('err', err)
    })
  }








  acceptDeclineService(tab: any, isAccept: any) {
    // console.log(tab.venueId);
    // console.log("isAccept", isAccept);
    if(tab.exhibitorId && isAccept> 0){
      let payload = {
        eventId: this.eventData.eventData.eventId,
        tabId: tab.exhibitorId,
        tabType: 5,
        isAccept: isAccept > 1 ? 0 : isAccept
      }
      console.log("payload ** ", payload );
      this.viewEventService.removeDecline(payload).subscribe((res: any) => {
        console.log(res);
        this.router.navigate(['home']);
      }, err => {
        devLogger('err', err)
      })
  }
  }






}
