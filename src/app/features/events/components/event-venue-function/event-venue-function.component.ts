import {
  AfterContentInit, AfterViewInit,
  Component,
  ContentChildren,
  EventEmitter,
  Input,
  OnInit,
  Output,
  QueryList, ViewChild, ViewChildren
} from '@angular/core';
import {Company} from "../../../users/models";
import {InviteFnCmpClass} from "../../models/classes";
import {SaveEventClass} from "../../models/classes/saveEvent.class";
import {Subscription} from "rxjs";
import {EventAssignFunctionCmpComponent} from "../event-assign-function-cmp/event-assign-function-cmp.component";
import {NgbAccordion, NgbPanelChangeEvent} from "@ng-bootstrap/ng-bootstrap";
import {SaveEventService} from "../../services/save-event.service";
import {devLogger} from "../../../../shared/utils";

@Component({
  selector: 'app-event-venue-function',
  templateUrl: './event-venue-function.component.html',
  styleUrls: ['./event-venue-function.component.scss']
})
export class EventVenueFunctionComponent implements OnInit, AfterViewInit {

  @ViewChildren('venueAssignCmp') venueAssignCmp: QueryList<EventAssignFunctionCmpComponent> | undefined;
  // @ts-ignore
  @ViewChild('ngbAccordion') ngbAccordion: NgbAccordion;
  @Input() selectedCompanies: (Company | InviteFnCmpClass)[] | undefined | null;
  @Input() content: any;
  @Output() removeSelectedCompany = new EventEmitter<number>();
  @Input() eventToBeSaved = new SaveEventClass();
  @Output() saveAndInvite = new EventEmitter<{ index: number, shouldInvite: boolean }>();
  isOwnCompany = false;
  private subs1: Subscription | undefined;
  private subs2: Subscription | undefined;
  activeVenuePanel = 0;
  @Input() searchInviteCmpModal: any;
  @Input() searchInviteFnCmpCntModal: any;
  @Input() setOpenedModalRef: any;
  @Input() removeContact: any;

  constructor(private saveEventService: SaveEventService) {
  }

  ngAfterViewInit(): void {
    this.venueAssignCmp?.changes.subscribe((value) => {
      devLogger('log', {Changessssss: value});
    });
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
    } else {
      this.eventToBeSaved.venues.list.push({
        companyId: null,
        requirements: '',
        eventAccessDateTimes: [],
        preEventAccessDateTimes: [],
        postEventAccessDateTimes: [],
        contacts: null
      });
    }
    this.ngbAccordion.collapseAll();
    this.activeVenuePanel = this.eventToBeSaved.venues.list.length - 1;
    this.saveEventService.activeVenuePanelIndex = this.activeVenuePanel;
    devLogger('log', {selectedCompanies: this.selectedCompanies});
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
        return (this.selectedCompanies[i] as Company)?.companyProfileImage;
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
    this.saveEventService.activeVenuePanelIndex = i;
  }

  removeVenueContact(rowIndex: number, columnIndex: number): any {
    this.removeContact(rowIndex, columnIndex);
  }
}
