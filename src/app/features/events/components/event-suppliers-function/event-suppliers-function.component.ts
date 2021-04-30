import {Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild} from '@angular/core';
import {SaveEventClass} from "../../models/classes/saveEvent.class";
import {NgbAccordion, NgbNav, NgbPanelChangeEvent} from "@ng-bootstrap/ng-bootstrap";
import {devLogger} from "../../../../shared/utils";
import {
  EventSuppliersInterface,
  InviteFnCmpCntInterface,
  InviteFnCmpInterface, SuppExhTimeWindowFormatInterface,
  TimeWindowFormatInterface, VenueListItemInterface
} from '../../models/interfaces';
import {SaveEventService} from "../../services/save-event.service";
import {Subscription} from "rxjs";
import {InviteFnCmpClass} from "../../models/classes";
import {Company} from "../../../users/models";

@Component({
  selector: 'app-event-suppliers-function',
  templateUrl: './event-suppliers-function.component.html',
  styleUrls: ['./event-suppliers-function.component.scss']
})
export class EventSuppliersFunctionComponent implements OnInit, OnDestroy {
  // @ts-ignore
  @ViewChild('ngbAccordion') ngbAccordion: NgbAccordion;
  /*@ViewChild('venueNav') venueNav: NgbNav | undefined;*/
  @Input() eventToBeSaved = new SaveEventClass();
  @Output() saveAndInvite = new EventEmitter<{ index: number, shouldInvite: boolean }>();
  @Input() searchInviteCmpModal: any;
  @Input() searchInviteFnCmpCntModal: any;
  @Input() setOpenedModalRef: any;
  @Input() content: any;
  activeServicePanel = 0;
  private supplierCompanyAddedSub: Subscription | undefined;
  venuesSuppCmpsMap = new Map<number, Map<number, Company | InviteFnCmpInterface>>();
  removeSelectedCompany = new EventEmitter();

  constructor(private saveEventService: SaveEventService) {
  }

  ngOnInit(): void {
    this.supplierCompanyAddedSub = this.saveEventService.supplierCompanyAddSubject
      .subscribe(value => {
        devLogger('log', 'supplierCompanyAddedSub');
        devLogger('log', value);
        const isInvited = value.supplierCompany instanceof InviteFnCmpClass;
        const service = this.eventToBeSaved.venues?.list[value.venueIndex]
          .suppliers[0].services[value.serviceIndex];

        if (service) {
          service.companyId = isInvited ? null : (value.supplierCompany as Company).id;
          service.invited = isInvited ? (value.supplierCompany as InviteFnCmpClass) : null;
          service.contacts = isInvited ? null : [];
          if (this.venuesSuppCmpsMap.has(value.venueIndex)) {
            this.venuesSuppCmpsMap.get(value.venueIndex)?.set(value.serviceIndex, value.supplierCompany);
          } else {
            const serviceSuppCmpMap = new Map([[value.serviceIndex, value.supplierCompany]]);
            this.venuesSuppCmpsMap.set(value.venueIndex, serviceSuppCmpMap);
          }

          devLogger('log', this.venuesSuppCmpsMap);
        }
      });
  }

  openVerticallyCentered(content: any): void {

  }

  panelChange($event: NgbPanelChangeEvent): void {

  }

  addService(venue: VenueListItemInterface, venueIndex: number): void {
    if (!venue.suppliers[0]) {
      const timeWindows: SuppExhTimeWindowFormatInterface = {
        bumpIn: {sameAsVenue: null, timings: []},
        bumpOut: {sameAsVenue: null, timings: []},
        eventTime: {sameAsVenue: null, timings: []}
      };
      venue.suppliers[0] = {
        notesToAll: '',
        services: [{
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
      venue.suppliers[0].services.push({
        name: '',
        shouldInvite: 0,
        invited: null,
        contacts: null,
        companyId: null,
        requirement: '',
        timeWindows
      });
    }
    this.ngbAccordion.collapseAll();
    this.activeServicePanel = venue.suppliers[0].services.length - 1;
    this.saveEventService.activeServicePanel = {venueIndex, serviceIndex: this.activeServicePanel};
    //devLogger('log', {selectedCompanies: this.selectedCompanies});

  }

  servicePanelActivated(venueIndex: number, serviceIndex: number): void {
    this.activeServicePanel = serviceIndex;
    this.saveEventService.activeServicePanel = {venueIndex, serviceIndex};
  }

  removeServiceContact(serviceIndex: number, $event: number): void {

  }

  ngOnDestroy(): void {
    this.supplierCompanyAddedSub?.unsubscribe();
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

}
