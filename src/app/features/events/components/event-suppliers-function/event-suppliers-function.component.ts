import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { SaveEventClass } from '../../models/classes/saveEvent.class';
import {
  NgbAccordion,
  NgbNav,
  NgbPanelChangeEvent,
} from '@ng-bootstrap/ng-bootstrap';
import { devLogger } from '../../../../shared/utils';
import {
  EventSuppliersInterface,
  InviteFnCmpCntInterface,
  InviteFnCmpInterface,
  SuppExhTimeWindowFormatInterface,
  TimeWindowFormatInterface,
  VenueListItemInterface,
} from '../../models/interfaces';
import { EventService } from '../../services/event.service';
import { Subscription } from 'rxjs';
import { InviteFnCmpClass } from '../../models/classes';
import { Company } from '../../../users/models';
import { EventTimeWindowTypes } from '../../models/types';
import { AngularEditorConfig } from '@kolkov/angular-editor';

@Component({
  selector: 'app-event-suppliers-function',
  templateUrl: './event-suppliers-function.component.html',
  styleUrls: ['./event-suppliers-function.component.scss'],
})
export class EventSuppliersFunctionComponent implements OnInit, OnDestroy {
  // @ts-ignore
  @ViewChild('ngbAccordion') ngbAccordion: NgbAccordion;
  @Input() eventToBeSaved = new SaveEventClass();
  @Input() venueCompanies:
    | Array<Company | InviteFnCmpInterface | null>
    | undefined
    | null = [];
  @Output() saveAndInvite = new EventEmitter<{
    venueIndex: number;
    serviceIndex: number;
    shouldInvite: boolean;
  }>();
  @Input() searchInviteCmpModal: any;
  @Input() searchInviteFnCmpCntModal: any;
  @Input() setOpenedModalRef: any;
  @Input() content: any;
  activeServicePanel = 0;
  private supplierCompanyAddedSub: Subscription | undefined;
  private supplierCmpCntAddedSub: Subscription | undefined;
  venuesSuppCmpsMap = new Map<
    number,
    Map<number, Company | InviteFnCmpInterface>
  >();
  eventTimeWindowType = EventTimeWindowTypes.Supplier;
  config: AngularEditorConfig = {
    editable: true,
    spellcheck: true,
    // height: '15rem',
    minHeight: '5rem',
    placeholder: 'Enter text here...',
    translate: 'no',
    defaultParagraphSeparator: 'p',
    defaultFontName: 'Arial',
    toolbarHiddenButtons: [],
    customClasses: [
      {
        name: 'quote',
        class: 'quote',
      },
      {
        name: 'redText',
        class: 'redText',
      },
      {
        name: 'titleText',
        class: 'titleText',
        tag: 'h1',
      },
    ],
  };
  isUseVenueTime: boolean = false;
  isPreEventTimesSameAsVenue: boolean = false;
  isEventTimesSameAsVenue: boolean = false;
  isPostEventTimesSameAsVenue: boolean = false;
  preEventTimesCount = 1;
  eventTimesCount = 1;
  postEventTimesCount = 1;
  constructor(private eventService: EventService) {}

  // copyAssignVenueTime(
  //   slotsType: EventTimeSlotTypes,
  //   timeWindows: Partial<TimeWindowFormatInterface>[]
  // ): void {
  //   if (this.isVenueDependent) {
  //     if (slotsType === EventTimeSlotTypes.PRE_EVENT_ACCESS) {
  //       this.preEventTimesCount = timeWindows.length || 1;
  //       //this.preEventTimes = [];
  //       this.emptyPreEventTimes();
  //       timeWindows.forEach((timeSlot) => {
  //         this.preEventTimes.push({
  //           notes: timeSlot.notes,
  //           endDateTime: timeSlot.endDateTime,
  //           startDateTime: timeSlot.startDateTime,
  //         });
  //       });
  //     } else if (slotsType === EventTimeSlotTypes.EVENT_ACCESS) {
  //       this.eventTimesCount = timeWindows.length || 1;
  //       //this.eventTimes = [];
  //       this.emptyEventTimes();
  //       timeWindows.forEach((timeSlot) => {
  //         this.eventTimes.push({
  //           notes: timeSlot.notes,
  //           endDateTime: timeSlot.endDateTime,
  //           startDateTime: timeSlot.startDateTime,
  //         });
  //       });
  //     } else if (slotsType === EventTimeSlotTypes.POST_EVENT_ACCESS) {
  //       this.postEventTimesCount = timeWindows.length || 1;
  //       //this.postEventTimes = [];
  //       this.emptyPostEventTimes();
  //       timeWindows.forEach((timeSlot) => {
  //         this.postEventTimes.push({
  //           notes: timeSlot.notes,
  //           endDateTime: timeSlot.endDateTime,
  //           startDateTime: timeSlot.startDateTime,
  //         });
  //       });
  //     }
  //   }
  // }

  listenTimeChange(event: Event, venueIndex: any, serviceIndex: any): void {
    const target = event.target as HTMLInputElement;
    const { checked } = target;
    if (checked) {
      this.isUseVenueTime = true;
      this.isPreEventTimesSameAsVenue = true;
      this.isEventTimesSameAsVenue = true;
      this.isPostEventTimesSameAsVenue = true;
      this.eventToBeSaved!.venues!.list[venueIndex].suppliers[0].services[
        serviceIndex
      ].timeWindows.bumpIn.timings =
        this.eventToBeSaved!.venues!.list[venueIndex].preEventAccessDateTimes;
      this.eventToBeSaved!.venues!.list[venueIndex].suppliers[0].services[
        serviceIndex
      ].timeWindows.bumpOut.timings =
        this.eventToBeSaved!.venues!.list[venueIndex].postEventAccessDateTimes;
      this.eventToBeSaved!.venues!.list[venueIndex].suppliers[0].services[
        serviceIndex
      ].timeWindows.eventTime.timings =
        this.eventToBeSaved!.venues!.list[venueIndex].eventAccessDateTimes;
      this.preEventTimesCount =
        this.eventToBeSaved!.venues!.list[venueIndex].preEventAccessDateTimes
          .length || 1;
      this.eventTimesCount =
        this.eventToBeSaved!.venues!.list[venueIndex].eventAccessDateTimes
          .length || 1;
      this.postEventTimesCount =
        this.eventToBeSaved!.venues!.list[venueIndex].postEventAccessDateTimes
          .length || 1;
      // this.copyAssignVenueTime(this.eventTimeSlotTypes.PRE_EVENT_ACCESS, (this.venuePreEventTimes as TimeWindowFormatInterface[]));
      // this.isPreEventTimesSameAsVenue = true;
      // this.venuePreEventTimeChangeSub = this.eventService.venuePreEventTimeChange.subscribe((value: VenueTimeChangedSubjectInterface) => {
      //   if (this.venueIndex === value.venueIndex) {
      //     this.copyAssignVenueTime(this.eventTimeSlotTypes.PRE_EVENT_ACCESS, value.data);
      //   }
      // });
      // this.copyAssignVenueTime(this.eventTimeSlotTypes.EVENT_ACCESS, (this.venueEventTimes as TimeWindowFormatInterface[]));
      // this.isEventTimesSameAsVenue = true;
      // this.venueEventTimeChangeSub = this.eventService.venueEventTimeChange.subscribe((value: VenueTimeChangedSubjectInterface) => {
      //   if (this.venueIndex === value.venueIndex) {
      //     this.copyAssignVenueTime(this.eventTimeSlotTypes.EVENT_ACCESS, value.data);
      //   }
      // });
      // this.copyAssignVenueTime(this.eventTimeSlotTypes.POST_EVENT_ACCESS, (this.venuePostEventTimes as TimeWindowFormatInterface[]));
      // this.isPostEventTimesSameAsVenue = true;
      // this.venuePostEventTimeChangeSub = this.eventService.venuePostEventTimeChange.subscribe((value: VenueTimeChangedSubjectInterface) => {
      //   if (this.venueIndex === value.venueIndex) {
      //     this.copyAssignVenueTime(this.eventTimeSlotTypes.POST_EVENT_ACCESS, value.data);
      //   }
      // });
    } else {
      this.isUseVenueTime = false;
      this.isPreEventTimesSameAsVenue = false;
      this.isEventTimesSameAsVenue = false;
      this.isPostEventTimesSameAsVenue = false;
      this.eventToBeSaved!.venues!.list[venueIndex].suppliers[0].services[
        serviceIndex
      ].timeWindows.bumpIn.timings = [];
      this.eventToBeSaved!.venues!.list[venueIndex].suppliers[0].services[
        serviceIndex
      ].timeWindows.bumpOut.timings = [];
      this.eventToBeSaved!.venues!.list[venueIndex].suppliers[0].services[
        serviceIndex
      ].timeWindows.eventTime.timings = [];
      this.preEventTimesCount = 1;
      this.eventTimesCount = 1;
      this.postEventTimesCount = 1;
    }
  }

  ngOnInit(): void {
    this.supplierCompanyAddedSub =
      this.eventService.supplierCompanyAddSubject.subscribe((value) => {
        devLogger('log', 'supplierCompanyAddedSub');
        devLogger('log', value);
        const isInvited = value.supplierCompany instanceof InviteFnCmpClass;
        const service =
          this.eventToBeSaved.venues?.list[value.venueIndex].suppliers[0]
            .services[value.serviceIndex];

        if (service) {
          service.companyId = isInvited
            ? null
            : (value.supplierCompany as Company).id;
          service.invited = isInvited
            ? (value.supplierCompany as InviteFnCmpClass)
            : null;
          service.contacts = isInvited ? null : [];
          if (this.venuesSuppCmpsMap.has(value.venueIndex)) {
            this.venuesSuppCmpsMap
              .get(value.venueIndex)
              ?.set(value.serviceIndex, value.supplierCompany);
          } else {
            const serviceSuppCmpMap = new Map([
              [value.serviceIndex, value.supplierCompany],
            ]);
            this.venuesSuppCmpsMap.set(value.venueIndex, serviceSuppCmpMap);
          }

          devLogger('log', this.venuesSuppCmpsMap);
        }
      });

    this.supplierCmpCntAddedSub =
      this.eventService.supplierCmpCntAddSubject.subscribe((value) => {
        this.setContacts(value);
      });
  }

  private setContacts(value: {
    venueIndex: number;
    serviceIndex: number;
    contactList: InviteFnCmpCntInterface[];
  }): void {
    const service =
      this.eventToBeSaved.venues?.list[value.venueIndex].suppliers[0].services[
        value.serviceIndex
      ];
    if (service) {
      if (service.contacts) {
        service.contacts = service.contacts.concat([...value.contactList]);
      } else {
        service.contacts = [...value.contactList];
      }
    }
  }

  openVerticallyCentered(content: any): void {}

  panelChange($event: NgbPanelChangeEvent): void {}

  addService(venue: VenueListItemInterface, venueIndex: number): void {
    if (!venue.suppliers[0]) {
      const timeWindows: SuppExhTimeWindowFormatInterface = {
        bumpIn: { sameAsVenue: null, timings: [] },
        bumpOut: { sameAsVenue: null, timings: [] },
        eventTime: { sameAsVenue: null, timings: [] },
      };
      venue.suppliers[0] = {
        notesToAll: '',
        services: [
          {
            name: '',
            shouldInvite: 0,
            invited: null,
            contacts: null,
            companyId: null,
            requirement: '',
            timeWindows,
          },
        ],
      };
    } else {
      const timeWindows: SuppExhTimeWindowFormatInterface = {
        bumpIn: { sameAsVenue: null, timings: [] },
        bumpOut: { sameAsVenue: null, timings: [] },
        eventTime: { sameAsVenue: null, timings: [] },
      };
      venue.suppliers[0].services.push({
        name: '',
        shouldInvite: 0,
        invited: null,
        contacts: null,
        companyId: null,
        requirement: '',
        timeWindows,
      });
    }
    this.ngbAccordion.collapseAll();
    this.activeServicePanel = venue.suppliers[0].services.length - 1;
    this.eventService.activeServicePanel = {
      venueIndex,
      serviceIndex: this.activeServicePanel,
    };
    //devLogger('log', {selectedCompanies: this.selectedCompanies});
  }

  servicePanelActivated(venueIndex: number, serviceIndex: number): void {
    this.activeServicePanel = serviceIndex;
    this.eventService.activeServicePanel = { venueIndex, serviceIndex };
  }

  removeServiceContact(
    venueIndex: number,
    serviceIndex: number,
    event: number
  ): void {
    const service =
      this.eventToBeSaved.venues?.list[venueIndex].suppliers[0]?.services[
        serviceIndex
      ];
    if (service && service.contacts) {
      service.contacts.splice(event, 1);
    }
  }

  getCompanyProfileImage(
    company: Company | InviteFnCmpClass | undefined
  ): string | null | undefined {
    if (!company) {
      return null;
    }
    if (company instanceof InviteFnCmpClass) {
      return null;
    } else {
      return (company as Company)?.companyProfileImage;
    }
  }

  getCompanyWebsite(
    company: Company | InviteFnCmpClass | undefined
  ): string | null | undefined {
    if (!company) {
      return null;
    }
    if (company instanceof InviteFnCmpClass) {
      return null;
    } else {
      return (company as Company)?.website;
    }
  }

  getCompanyPhone(
    company: Company | InviteFnCmpClass | undefined
  ): string | null | undefined {
    if (!company) {
      return null;
    }
    if (company instanceof InviteFnCmpClass) {
      return null;
    } else {
      return (company as Company)?.phone;
    }
  }

  ngOnDestroy(): void {
    this.supplierCompanyAddedSub?.unsubscribe();
    this.supplierCmpCntAddedSub?.unsubscribe();
  }

  removeSelectedCompany(venueIndex: number, serviceIndex: number): void {
    const service =
      this.eventToBeSaved.venues?.list[venueIndex].suppliers[0].services[
        serviceIndex
      ];

    if (service) {
      service.companyId = null;
      service.contacts = null;
      service.shouldInvite = null;
      service.invited = null;
      this.venuesSuppCmpsMap.get(venueIndex)?.delete(serviceIndex);
    }
  }

  getCompanyId(company: Company | InviteFnCmpClass | undefined): any {
    if (!company) {
      return null;
    }
    if (company instanceof InviteFnCmpClass) {
      return null;
    } else {
      return (company as Company)?.id;
    }
  }

  goToCompanyProfile(companyId: any) {
    if (companyId) {
      localStorage.setItem('companyId', JSON.stringify(companyId));
      localStorage.setItem('isView', JSON.stringify(true));
      window.open('/home/company/manage-company?isView=' + true);
    }
  }
}
