import {
  AfterContentInit, AfterViewInit,
  Component,
  ContentChildren,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  QueryList, SimpleChanges, ViewChild, ViewChildren
} from '@angular/core';
import { Company } from '../../../users/models';
import { InviteFnCmpClass } from '../../models/classes';
import { SaveEventClass } from '../../models/classes/saveEvent.class';
import { Subscription } from 'rxjs';
import { EventAssignFunctionCmpComponent } from '../event-assign-function-cmp/event-assign-function-cmp.component';
import { NgbAccordion, NgbPanelChangeEvent } from '@ng-bootstrap/ng-bootstrap';
import { EventService } from '../../services/event.service';
import { devLogger } from '../../../../shared/utils';
import { EventTimeWindowTypes } from "../../models/types";
import { FnCmpCntInterface } from '../../models/interfaces';
import { ViewEventService } from '../../services/view-event.service';
import { Router } from '@angular/router';


@Component({
  selector: 'app-event-venue-function',
  templateUrl: './event-venue-function.component.html',
  styleUrls: ['./event-venue-function.component.scss']
})
export class EventVenueFunctionComponent implements OnInit, AfterViewInit, OnChanges {

  @ViewChildren('venueAssignCmp') venueAssignCmp: QueryList<EventAssignFunctionCmpComponent> | undefined;
  @ViewChildren('venueCrewAssignCmp') venueCrewAssignCmp: QueryList<EventAssignFunctionCmpComponent> | undefined;
  // @ts-ignore
  @ViewChild('ngbAccordion') ngbAccordion: NgbAccordion;
  @Input() eventData: any;
  @Input() selectedCompanies: (Company | InviteFnCmpClass | null)[] | undefined | null;
  @Input() content: any;
  @Output() removeSelectedCompany = new EventEmitter<number>();
  @Input() eventToBeSaved = new SaveEventClass();
  @Output() saveAndInvite = new EventEmitter<{ venueIndex: number, shouldInvite: boolean }>();
  isOwnCompany = false;
  private subs1: Subscription | undefined;
  private subs2: Subscription | undefined;
  activeVenuePanel = 0;
  @Input() searchInviteCmpModal: any;
  @Input() searchInviteFnCmpCntModal: any;
  @Input() permissionObj: any;
  @Input() setOpenedModalRef: any;
  @Input() removeContact: any;
  eventTimeWindowType = EventTimeWindowTypes.Venue;
  @Output() editVenue = new EventEmitter<boolean>();
  isVenueEdit: boolean = false;
  public isVenueEditable: boolean = false;
  @Input() venueContactLists: Array<Array<FnCmpCntInterface>> = [];
  @Input() setIsCrew: any;


  constructor(
    private eventService: EventService,
    private viewEventService: ViewEventService,
    private router: Router
  ) {
  }

  ngOnChanges(changes: SimpleChanges) {
    this.isVenueEdit = this.eventService.isEdit;
    this.isVenueEditable = this.eventService.isEdit;
  }

  editVenueFn() {
    this.eventService.isEdit = true;
    this.isVenueEdit = true;
    this.isVenueEditable = true;
    // this.editVenue.emit(this.isVenueEdit);
  }

  ngAfterViewInit(): void {

  }

  ngOnInit(): void {
    if (this.eventData?.eventData?.isDeleted == 1) {
      this.eventService.isDeleted = true;
    }
    // console.log("permissionObj ** ", this.permissionObj); 
  }


  addVenue(): void {
    this.isVenueEditable = true;
    this.isVenueEdit = true;
    if (!this.eventToBeSaved.venues) {
      this.eventToBeSaved.venues = {
        list: [{
          companyId: null,
          requirements: '',
          eventAccessDateTimes: [],
          preEventAccessDateTimes: [],
          postEventAccessDateTimes: [],
          contacts: null,
          shouldInvite: 0,
          invited: null,
          suppliers: [],
          exhibitorList: []
        }],
        notesToAll: ''
      };
    } else {
      this.eventToBeSaved.venues.list.push({
        companyId: null,
        requirements: '',
        eventAccessDateTimes: [],
        preEventAccessDateTimes: [],
        postEventAccessDateTimes: [],
        contacts: null,
        shouldInvite: 0,
        invited: null,
        suppliers: [],
        exhibitorList: []
      });
    }
    this.ngbAccordion.collapseAll();
    this.activeVenuePanel = this.eventToBeSaved.venues.list.length - 1;
    this.eventService.activeVenuePanelIndex = this.activeVenuePanel;
    devLogger('log', { selectedCompanies: this.selectedCompanies });
  }

  getCompanyProfileImage(i: number): string | null | undefined {
    if (this.selectedCompanies && this.selectedCompanies[i]) {
      if (this.selectedCompanies[i] instanceof InviteFnCmpClass) {
        return null;
      } else {
        return (this.selectedCompanies[i] as Company)?.companyProfileImage;
      }
    } else {
      return null;
    }
  }

  getCompanyWebsite(i: number): string | null | undefined {
    if (this.selectedCompanies && this.selectedCompanies[i]) {
      if (this.selectedCompanies[i] instanceof InviteFnCmpClass) {
        return null;
      } else {
        return (this.selectedCompanies[i] as Company)?.website;
      }
    } else {
      return null;
    }
  }

  getCompanyPhone(i: number): string | null | undefined {
    if (this.selectedCompanies && this.selectedCompanies[i]) {
      if (this.selectedCompanies[i] instanceof InviteFnCmpClass) {
        return null;
      } else {
        return (this.selectedCompanies[i] as Company)?.phone;
      }
    } else {
      return null;
    }
  }

  panelChange(event: NgbPanelChangeEvent): void {
  }

  panelActivated(i: number): void {
    this.eventService.activeVenuePanelIndex = i;
  }

  removeVenueContact(rowIndex: number, columnIndex: number): any {
    this.removeContact(rowIndex, columnIndex);
  }

  testLogVenue(): void {
    devLogger('log', { EVENT_TO_BE_SAVE_VENUE: this.eventToBeSaved });
  }


  acceptDeclineService(tab: any, isAccept: any) {
    // console.log(tab.venueId);
    console.log("isAccept", isAccept);
    if (tab.venueId && isAccept > 0) {
      let payload = {
        eventId: this.eventData.eventData.eventId,
        tabId: tab.venueId,
        tabType: 3,
        isAccept: isAccept > 1 ? 0 : isAccept
      }
      console.log("payload ** ", payload);
      this.viewEventService.removeDecline(payload).subscribe((res: any) => {
        console.log(res);
        // this.router.navigate(['home']);
      }, err => {
        devLogger('err', err)
      })
    }
  }

  getCompanyId(i: number): any {
    if (this.selectedCompanies && this.selectedCompanies[i]) {
      if (this.selectedCompanies[i] instanceof InviteFnCmpClass) {
        return null;
      } else {
        return (this.selectedCompanies[i] as Company)?.id;
      }
    } else {
      return null;
    }
  }

  getIsPrivate(i: number): any {
    if (this.selectedCompanies && this.selectedCompanies[i]) {
      if (this.selectedCompanies[i] instanceof InviteFnCmpClass) {
        return null;
      } else {
        return (this.selectedCompanies[i] as Company)?.isPrivate;
      }
    } else {
      return null;
    }
  }

  goToCompanyProfile(companyId: any, isPrivate: any) {
    console.log(companyId);
    if (companyId && isPrivate == 0) {
      localStorage.setItem('companyId', JSON.stringify(companyId));
      localStorage.setItem('isView', JSON.stringify(true));
      window.open('/home/company/manage-company?isView=' + true);
    }
  }

  getSelectedCompany(index: any) {
    //@ts-ignore
    return this.selectedCompanies[index];
  }

  checkSelectedCompany(index: any) {
    //@ts-ignore
    if (this.selectedCompanies[index] != null) {
      this.eventService.isSaveDisabled = false;
      return false
    } else {
      this.eventService.isSaveDisabled = true;
      return true
    }
  }

}
