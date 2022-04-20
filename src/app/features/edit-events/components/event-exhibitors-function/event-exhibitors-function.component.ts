import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import {
  NgbAccordion,
  NgbModal,
  NgbModalOptions,
  NgbPanelChangeEvent,
} from '@ng-bootstrap/ng-bootstrap';
import { SaveEventClass } from '../../models/classes/saveEvent.class';
import { Subscription } from 'rxjs';
import { Company } from '../../../users/models';
import {
  InviteFnCmpCntInterface,
  InviteFnCmpInterface,
  SuppExhTimeWindowFormatInterface,
  VenueListItemInterface,
} from '../../models/interfaces';
import { EventService } from '../../services/event.service';
import { devLogger } from '../../../../shared/utils';
import { InviteFnCmpClass } from '../../models/classes';
import { EventTimeWindowTypes } from '../../models/types';
import { ViewEventService } from '../../services/view-event.service';
import { ActivatedRoute, Router } from '@angular/router';
import { faAddressCard } from '@fortawesome/free-regular-svg-icons';
import { ConfirmationDialogComponent } from 'src/app/shared/components';
import { AngularEditorConfig } from '@kolkov/angular-editor';

@Component({
  selector: 'app-event-exhibitors-function',
  templateUrl: './event-exhibitors-function.component.html',
  styleUrls: ['./event-exhibitors-function.component.scss'],
})
export class EventExhibitorsFunctionComponent
  implements OnInit, OnDestroy, OnChanges
{
  addressCardIcon = faAddressCard;
  @ViewChild('ngbAccordion') ngbAccordion: NgbAccordion | undefined;
  @Input() eventData: any;
  @Input() eventToBeSaved = new SaveEventClass();
  @Output() saveAndInvite = new EventEmitter<{
    venueIndex: number;
    exhibitorIndex: number;
    shouldInvite: boolean;
  }>();
  @Input() searchInviteCmpModal: any;
  @Input() searchInviteFnCmpCntModal: any;
  @Input() setOpenedModalRef: any;
  @Input() content: any;
  @Input() permissionObj: any;
  @Input() venueCompanies:
    | Array<Company | InviteFnCmpInterface | null>
    | undefined
    | null = [];
  activeExhibitorPanel = 0;
  private exhCompanyAddedSub: Subscription | undefined;
  private exhCmpCntAddedSub: Subscription | undefined;
  venuesExhCmpsMap = new Map<
    number,
    Map<number, Company | InviteFnCmpInterface>
  >();
  eventTimeWindowType = EventTimeWindowTypes.Exhibitor;
  eventTimeWindowForAllExh = EventTimeWindowTypes.ALL_EXHIBITORS;
  isExhibitorEdit: boolean = false;
  isNotesEdit: boolean = false;
  public isExhibitorEditable: boolean = false;
  @Input() setIsCrew: any;
  isPast: any;
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
  isPreEventTimesSameAsExhibition: boolean = false;
  isEventTimesSameAsExhibition: boolean = false;
  isPostEventTimesSameAsExhibition: boolean = false;
  preEventTimesCount = 1;
  eventTimesCount = 1;
  postEventTimesCount = 1;
  venueIndexLocal = 0;
  exhibitorIndexLocal = 0;
  constructor(
    public eventService: EventService,
    private viewEventService: ViewEventService,
    private router: Router,
    public modalService: NgbModal,
    public aroute: ActivatedRoute
  ) {
    this.aroute.queryParams.subscribe((param) => {
      console.log('param...', param);
      this.isPast = param.isPast;
    });
  }

  editNotes() {
    this.isNotesEdit = !this.isNotesEdit;
    // this.isExhibitorEdit = !this.isExhibitorEdit;
  }

  listenTimeChange(event: Event, venueIndex: any, exhibitorIndex: any): void {
    const target = event.target as HTMLInputElement;
    this.venueIndexLocal = venueIndex;
    this.exhibitorIndexLocal = exhibitorIndex;
    const { checked } = target;
    if (checked) {
      this.isUseVenueTime = true;
      this.isPreEventTimesSameAsExhibition = true;
      this.isEventTimesSameAsExhibition = true;
      this.isPostEventTimesSameAsExhibition = true;

      this.eventToBeSaved!.venues!.list[venueIndex].exhibitorList[0].exhibitors[
        exhibitorIndex
      ].timeWindows.bumpIn.timings =
        this.eventToBeSaved!.venues!.list[
          venueIndex
        ].exhibitorList[0].timeWindowsToAll.bumpIn.timings;
      this.eventToBeSaved!.venues!.list[venueIndex].exhibitorList[0].exhibitors[
        exhibitorIndex
      ].timeWindows.bumpOut.timings =
        this.eventToBeSaved!.venues!.list[
          venueIndex
        ].exhibitorList[0].timeWindowsToAll.bumpOut.timings;
      this.eventToBeSaved!.venues!.list[venueIndex].exhibitorList[0].exhibitors[
        exhibitorIndex
      ].timeWindows.eventTime.timings =
        this.eventToBeSaved!.venues!.list[
          venueIndex
        ].exhibitorList[0].timeWindowsToAll.eventTime.timings;

      this.preEventTimesCount =
        this.eventToBeSaved!.venues!.list[venueIndex].preEventAccessDateTimes
          .length || 1;
      this.eventTimesCount =
        this.eventToBeSaved!.venues!.list[venueIndex].eventAccessDateTimes
          .length || 1;
      this.postEventTimesCount =
        this.eventToBeSaved!.venues!.list[venueIndex].postEventAccessDateTimes
          .length || 1;
    } else {
      this.isUseVenueTime = false;
      this.isPreEventTimesSameAsExhibition = false;
      this.isEventTimesSameAsExhibition = false;
      this.isPostEventTimesSameAsExhibition = false;

      this.eventToBeSaved!.venues!.list[venueIndex].exhibitorList[0].exhibitors[
        exhibitorIndex
      ].timeWindows.bumpIn.timings = [];
      this.eventToBeSaved!.venues!.list[venueIndex].exhibitorList[0].exhibitors[
        exhibitorIndex
      ].timeWindows.bumpOut.timings = [];
      this.eventToBeSaved!.venues!.list[venueIndex].exhibitorList[0].exhibitors[
        exhibitorIndex
      ].timeWindows.eventTime.timings = [];

      this.preEventTimesCount = 1;
      this.eventTimesCount = 1;
      this.postEventTimesCount = 1;
    }
  }

  changeConfig() {
    if (!this.isExhibitorEdit && !this.isNotesEdit) this.config.editable = false;
    else this.config.editable = true;
  }
  changeConfigPermission() {
    if (
      (!this.isExhibitorEdit)
    )
      this.config.editable = false;
    else this.config.editable = true;
  }

  check() {
    if (!this.isExhibitorEdit && this.isPast == 'false') {
      return true;
    } else {
      return false;
    }
  }

  editExhibitorFn() {
    this.eventService.isEdit = !this.isExhibitorEdit;
    this.isExhibitorEdit = !this.isExhibitorEdit;
    this.isExhibitorEditable = !this.isExhibitorEditable;
    this.isNotesEdit = true;
    // this.editVenue.emit(this.isVenueEdit);
  }

  ngOnChanges(changes: SimpleChanges) {
    this.isExhibitorEdit = this.eventService.isEdit;
    this.isExhibitorEditable = this.eventService.isEdit;
  }

  ngOnInit(): void {
    if (this.eventData.eventData.isDeleted == 1) {
      this.eventService.isDeleted = true;
    }
    this.exhCompanyAddedSub =
      this.eventService.exhibitorCompanyAddSubject.subscribe((value) => {
        devLogger('log', 'exhCompanyAddedSub');
        devLogger('log', value);
        const isInvited = value.exhibitorCompany instanceof InviteFnCmpClass;
        const exhibitor =
          this.eventToBeSaved.venues?.list[value.venueIndex].exhibitorList[0]
            ?.exhibitors[value.exhibitorIndex];

        if (exhibitor) {
          exhibitor.companyId = isInvited
            ? null
            : (value.exhibitorCompany as Company).id;
          exhibitor.invited = isInvited
            ? (value.exhibitorCompany as InviteFnCmpClass)
            : null;
          exhibitor.contacts = isInvited ? null : [];
          if (this.venuesExhCmpsMap.has(value.venueIndex)) {
            this.venuesExhCmpsMap
              .get(value.venueIndex)
              ?.set(value.exhibitorIndex, value.exhibitorCompany);
          } else {
            const exhibitorCmpMap = new Map([
              [value.exhibitorIndex, value.exhibitorCompany],
            ]);
            this.venuesExhCmpsMap.set(value.venueIndex, exhibitorCmpMap);
          }

          devLogger('log', this.venuesExhCmpsMap);
        }
      });

    this.exhCmpCntAddedSub =
      this.eventService.exhibitorCmpCntAddSubject.subscribe((value) => {
        this.setContacts(value);
      });
    this.eventService.navigatesToExhibitors.subscribe(() => {
      this.eventService.getFetchedVenueExCmp().forEach((param, index) => {
        this.eventService.activeExhibitorPanel = {
          venueIndex: param.venueIndex,
          exhibitorIndex: param.exhibitorIndex,
        };
        if (param.company) {
          this.eventService.exhibitorCompanyAdded(param.company);
        }

        if (index === this.eventService.getFetchedVenueExCmp().length - 1) {
          this.eventService.activeExhibitorPanel = {
            venueIndex: 0,
            exhibitorIndex: 0,
          };
        }
      });

      this.eventService.getFetchedVenueExCmpCnts().forEach((param, index) => {
        this.eventService.activeExhibitorPanel = {
          venueIndex: param.venueIndex,
          exhibitorIndex: param.exhibitorIndex,
        };
        if (param.contactList) {
          this.eventService.exhibitorContactsAdded(param.contactList);
        }
        if (index === this.eventService.getFetchedVenueExCmpCnts().length - 1) {
          this.eventService.activeExhibitorPanel = {
            venueIndex: 0,
            exhibitorIndex: 0,
          };
        }
      });
    });

    this.eventService.navigatesToExhibitors.next();
  }

  private setContacts(value: {
    venueIndex: number;
    exhibitorIndex: number;
    contactList: InviteFnCmpCntInterface[];
  }): void {
    const exhibitor =
      this.eventToBeSaved.venues?.list[value.venueIndex].exhibitorList[0]
        ?.exhibitors[value.exhibitorIndex];
    if (exhibitor) {
      if (exhibitor.contacts) {
        exhibitor.contacts = exhibitor.contacts.concat([...value.contactList]);
      } else {
        exhibitor.contacts = [...value.contactList];
      }
    }
  }

  openVerticallyCentered(content: any): void {}

  panelChange($event: NgbPanelChangeEvent): void {}

  addExhibitor(venue: VenueListItemInterface, venueIndex: number): void {
    this.isExhibitorEdit = true;
    this.isExhibitorEditable = true;

    if (!venue.exhibitorList[0]) {
      const timeWindowsToAll: SuppExhTimeWindowFormatInterface = {
        bumpIn: { sameAsVenue: null, timings: [] },
        bumpOut: { sameAsVenue: null, timings: [] },
        eventTime: { sameAsVenue: null, timings: [] },
      };
      const timeWindows: SuppExhTimeWindowFormatInterface = {
        bumpIn: { sameAsVenue: null, timings: [] },
        bumpOut: { sameAsVenue: null, timings: [] },
        eventTime: { sameAsVenue: null, timings: [] },
      };
      venue.exhibitorList[0] = {
        notesToAll: '',
        timeWindowsToAll,
        exhibitors: [
          {
            standNumber: null,
            name: '',
            shouldInvite: 0,
            invited: null,
            contacts: null,
            companyId: null,
            requirement: '',
            internalCmpNotes: null,
            timeWindows,
          },
        ],
      };
    } else {
      console.log('in else condition');
      // const timeWindowsToAll: SuppExhTimeWindowFormatInterface = {
      //   bumpIn: { sameAsVenue: null, timings: [] },
      //   bumpOut: { sameAsVenue: null, timings: [] },
      //   eventTime: { sameAsVenue: null, timings: [] }
      // };

      const timeWindows: SuppExhTimeWindowFormatInterface = {
        bumpIn: { sameAsVenue: null, timings: [] },
        bumpOut: { sameAsVenue: null, timings: [] },
        eventTime: { sameAsVenue: null, timings: [] },
      };

      venue.exhibitorList[0] = {
        notesToAll: venue.exhibitorList[0].notesToAll,
        timeWindowsToAll: venue.exhibitorList[0].timeWindowsToAll,
        exhibitors: venue.exhibitorList[0].exhibitors,
      };

      if (venue.exhibitorList[0].timeWindowsToAll.bumpIn.timings == undefined) {
        venue.exhibitorList[0].timeWindowsToAll.bumpIn.timings = [];
      }
      if (
        venue.exhibitorList[0].timeWindowsToAll.bumpOut.timings == undefined
      ) {
        venue.exhibitorList[0].timeWindowsToAll.bumpOut.timings = [];
      }
      if (
        venue.exhibitorList[0].timeWindowsToAll.eventTime.timings == undefined
      ) {
        venue.exhibitorList[0].timeWindowsToAll.eventTime.timings = [];
      }

      venue.exhibitorList[0].exhibitors.push({
        standNumber: null,
        name: '',
        shouldInvite: 0,
        invited: null,
        contacts: null,
        companyId: null,
        requirement: '',
        internalCmpNotes: null,
        timeWindows,
      });
    }
    this.ngbAccordion?.collapseAll();
    this.activeExhibitorPanel = venue.exhibitorList[0].exhibitors.length - 1;
    this.eventService.activeExhibitorPanel = {
      venueIndex,
      exhibitorIndex: this.activeExhibitorPanel,
    };
  }

  exhibitorPanelActivated(venueIndex: number, exhibitorIndex: number): void {
    this.activeExhibitorPanel = exhibitorIndex;
    this.eventService.activeExhibitorPanel = { venueIndex, exhibitorIndex };
  }

  removeExhibitorContact(
    venueIndex: number,
    exhibitorIndex: number,
    event: number
  ): void {
    const exhibitor =
      this.eventToBeSaved.venues?.list[venueIndex].exhibitorList[0]?.exhibitors[
        exhibitorIndex
      ];
    if (exhibitor && exhibitor.contacts) {
      exhibitor.contacts.splice(event, 1);
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

  removeSelectedCompany(venueIndex: number, exhibitorIndex: number): void {
    const exhibitor =
      this.eventToBeSaved.venues?.list[venueIndex].exhibitorList[0].exhibitors[
        exhibitorIndex
      ];

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

  confirmRemove(exhibitorId: any, isAccept: any) {
    let ngbModalOptions: NgbModalOptions = {
      backdrop: 'static',
      keyboard: false,
    };
    const modalRef = this.modalService.open(
      ConfirmationDialogComponent,
      ngbModalOptions
    );
    modalRef.result
      .then((result: any) => {
        console.log(result);
        if (result) {
          this.removeDeclineExhibitor(exhibitorId, isAccept);
        }
      })
      .catch((result) => {
        console.log('cancelling');
      });
  }

  removeDeclineExhibitor(exhibitorId: any, isAccept: any) {
    console.log(exhibitorId);
    let payload = {
      eventId: this.eventData.eventData.eventId,
      tabId: exhibitorId,
      tabType: 5,
      isAccept: isAccept,
    };
    this.viewEventService.removeDecline(payload).subscribe(
      (res: any) => {
        console.log(res);
        this.router.navigate(['home']);
      },
      (err) => {
        devLogger('err', err);
      }
    );
  }

  acceptDeclineService(tab: any, isAccept: any) {
    // console.log(tab.venueId);
    // console.log("isAccept", isAccept);
    if (tab.exhibitorId && isAccept > 0) {
      let payload = {
        eventId: this.eventData.eventData.eventId,
        tabId: tab.exhibitorId,
        tabType: 5,
        isAccept: isAccept > 1 ? 0 : isAccept,
      };
      console.log('payload ** ', payload);
      this.viewEventService.removeDecline(payload).subscribe(
        (res: any) => {
          console.log(res);
          // this.router.navigate(['home']);
        },
        (err) => {
          devLogger('err', err);
        }
      );
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

  getIsPrivate(company: Company | InviteFnCmpClass | undefined): any {
    if (!company) {
      return null;
    }
    if (company instanceof InviteFnCmpClass) {
      return null;
    } else {
      return (company as Company)?.isPrivate;
    }
  }

  getIsSeed(company: Company | InviteFnCmpClass | undefined): any {
    if (!company) {
      return null;
    }
    if (company instanceof InviteFnCmpClass) {
      return null;
    } else {
      return (company as Company)?.isSeed;
    }
  }

  goToCompanyProfile(companyId: any, isPrivate: any, isSeed: any) {
    if (companyId) {
      localStorage.setItem('companyId', JSON.stringify(companyId));
      localStorage.setItem('isView', JSON.stringify(true));
      window.open('/home/company/manage-company?isView=' + true);
    }
  }

  checkSelectedCompany(
    company: Company | InviteFnCmpClass | undefined
  ): boolean {
    if (!company) {
      this.eventService.isSaveDisabled = true;
      return true;
    }
    if (company instanceof InviteFnCmpClass) {
      this.eventService.isSaveDisabled = true;
      return true;
    } else {
      this.eventService.isSaveDisabled = false;
      return false;
    }
  }

  checkPermission(isStaffOrAdmin: any) {
    if (
      this.eventData.userPermission.isClient == 1 ||
      this.eventData.userPermission.isEventManager == 1 ||
      isStaffOrAdmin == 1
    ) {
      return false;
    } else {
      return true;
    }
  }
}
