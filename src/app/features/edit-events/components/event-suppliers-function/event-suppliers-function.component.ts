import {
  AfterViewChecked,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
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
import { SaveEventClass } from '../../models/classes/saveEvent.class';
import {
  NgbAccordion,
  NgbModal,
  NgbModalOptions,
  NgbPanelChangeEvent,
} from '@ng-bootstrap/ng-bootstrap';
import { devLogger } from '../../../../shared/utils';
import {
  InviteFnCmpCntInterface,
  InviteFnCmpInterface,
  SuppExhTimeWindowFormatInterface,
  VenueListItemInterface,
} from '../../models/interfaces';
import { EventService } from '../../services/event.service';
import { Subscription } from 'rxjs';
import { InviteFnCmpClass } from '../../models/classes';
import { Company } from '../../../users/models';
import { EventTimeWindowTypes } from '../../models/types';
import { ViewEventService } from '../../services/view-event.service';
import { ActivatedRoute, Router } from '@angular/router';
import { faAddressCard } from '@fortawesome/free-regular-svg-icons';
import { ConfirmationDialogComponent } from 'src/app/shared/components';
import { AngularEditorConfig } from '@kolkov/angular-editor';

@Component({
  selector: 'app-event-suppliers-function',
  templateUrl: './event-suppliers-function.component.html',
  styleUrls: ['./event-suppliers-function.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default,
})
export class EventSuppliersFunctionComponent
  implements OnInit, OnDestroy, OnChanges, AfterViewChecked
{
  addressCardIcon = faAddressCard;
  // @ts-ignore
  @ViewChild('ngbAccordion') ngbAccordion: NgbAccordion;
  @Input() eventData: any;
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
  @Input() permissionObj: any;
  @Input() content: any;
  activeServicePanel = 0;
  private supplierCompanyAddedSub: Subscription | undefined;
  private supplierCmpCntAddedSub: Subscription | undefined;
  venuesSuppCmpsMap = new Map<
    number,
    Map<number, Company | InviteFnCmpInterface>
  >();
  eventTimeWindowType = EventTimeWindowTypes.Supplier;
  isServiceEdit: boolean = false;
  isNotesEdit: boolean = false;
  public isServiceEditable: boolean = false;
  editServiceIndex: number = 0;
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
  isPreEventTimesSameAsVenue: boolean = false;
  isEventTimesSameAsVenue: boolean = false;
  isPostEventTimesSameAsVenue: boolean = false;
  preEventTimesCount = 1;
  eventTimesCount = 1;
  postEventTimesCount = 1;
  venueIndexLocal = 1;
  serviceIndexLocal = 1;
  constructor(
    public eventService: EventService,
    private viewEventService: ViewEventService,
    private router: Router,
    public _cdr: ChangeDetectorRef,
    public modalService: NgbModal,
    public aroute: ActivatedRoute
  ) {
    this.aroute.queryParams.subscribe((param) => {
      console.log('param...', param);
      this.isPast = param.isPast;
      console.log('is past...', this.isPast);
    });
  }

  listenTimeChange(event: Event, venueIndex: any, serviceIndex: any): void {
    this.venueIndexLocal = venueIndex;
    this.serviceIndexLocal = serviceIndex;
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

  editNotes() {
    this.isNotesEdit = true;
    // this.isServiceEdit = !this.isServiceEdit;
  }

  changeConfig() {
    if (!this.isServiceEdit && !this.isNotesEdit) this.config.editable = false;
    else this.config.editable = true;
  }
  changeConfigPermission() {
    if (
      (!this.isServiceEdit) &&
      !(this.permissionObj.isClient || this.permissionObj.isEventManager)
    )
      this.config.editable = false;
    else this.config.editable = true;
  }

  check() {
    if (!this.isServiceEdit && this.isPast == 'false') {
      return true;
    } else {
      return false;
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    this.isServiceEdit = this.eventService.isEdit;
    this.isServiceEditable = this.eventService.isEdit;
  }

  editServiceFn(editServiceFn: number) {
    this.eventService.isEdit = !this.isServiceEdit;
    this.isServiceEdit = !this.isServiceEdit;
    this.isServiceEditable = !this.isServiceEditable;
    this.isNotesEdit = true;
    this.editServiceIndex = editServiceFn;
  }

  ngOnInit(): void {
    if (this.eventData.eventData.isDeleted == 1) {
      this.eventService.isDeleted = true;
    }
    this.supplierCompanyAddedSub =
      this.eventService.supplierCompanyAddSubject.subscribe(
        (value) => {
          devLogger('log', 'supplierCompanyAddedSub');
          devLogger('log', value);
          const isInvited = value.supplierCompany instanceof InviteFnCmpClass;
          const service =
            this.eventToBeSaved.venues?.list[value.venueIndex].suppliers[0]
              ?.services[value.serviceIndex];

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
        },
        (err) => {
          devLogger('error', err);
        }
      );

    this.supplierCmpCntAddedSub =
      this.eventService.supplierCmpCntAddSubject.subscribe((value) => {
        this.setContacts(value);
      });

    this.eventService.navigatesToSuppliers.subscribe(() => {
      this.eventService.getFetchedVenueSrvcsCmp().forEach((param, index) => {
        this.eventService.activeServicePanel = {
          venueIndex: param.venueIndex,
          serviceIndex: param.serviceIndex,
        };
        if (param.company) {
          this.eventService.supplierCompanyAdded(param.company);
        }

        if (index === this.eventService.getFetchedVenueSrvcsCmp().length - 1) {
          this.eventService.activeServicePanel = {
            venueIndex: 0,
            serviceIndex: 0,
          };
        }
      });
      this.eventService.getFetchedVenueSrvcCmpCnts().forEach((param, index) => {
        this.eventService.activeServicePanel = {
          venueIndex: param.venueIndex,
          serviceIndex: param.serviceIndex,
        };
        if (param.contactList) {
          this.eventService.supplierContactsAdded(param.contactList);
        }
        if (
          index ===
          this.eventService.getFetchedVenueSrvcCmpCnts().length - 1
        ) {
          this.eventService.activeServicePanel = {
            venueIndex: 0,
            serviceIndex: 0,
          };
        }
      });
    });

    this.eventService.navigatesToSuppliers.next();
  }

  private setContacts(value: {
    venueIndex: number;
    serviceIndex: number;
    contactList: InviteFnCmpCntInterface[];
  }): void {
    const service =
      this.eventToBeSaved.venues?.list[value.venueIndex].suppliers[0]?.services[
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
    this.isServiceEdit = true;
    this.isServiceEditable = true;
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
            internalCmpNotes: null,
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
        internalCmpNotes: null,
        timeWindows,
      });
    }
    this.ngbAccordion.collapseAll();
    this.activeServicePanel = venue.suppliers[0].services.length - 1;
    this.eventService.activeServicePanel = {
      venueIndex,
      serviceIndex: this.activeServicePanel,
    };
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

  removeDeclineService(supplierId: any, isAccept: any) {
    let payload = {
      eventId: this.eventData.eventData.eventId,
      tabId: supplierId,
      tabType: 4,
      isAccept: isAccept,
    };
    this.viewEventService.removeDecline(payload).subscribe(
      (res: any) => {
        if (res.code == 200) this.router.navigate(['home']);
      },
      (err) => {
        devLogger('err', err);
      }
    );
  }

  confirmRemove(supplierId: any, isAccept: any) {
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
        if (result) {
          this.removeDeclineService(supplierId, isAccept);
        }
      })
      .catch((result) => {});
  }

  acceptDeclineService(tab: any, isAccept: any) {
    if (tab.supplierId && isAccept > 0) {
      let payload = {
        eventId: this.eventData.eventData.eventId,
        tabId: tab.supplierId,
        tabType: 4,
        isAccept: isAccept > 1 ? 0 : isAccept,
      };

      this.viewEventService.removeDecline(payload).subscribe(
        (res: any) => {},
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

  checkSelectedSupplierCompany(
    company: Company | InviteFnCmpClass | undefined
  ): boolean {
    if (!company) {
      this.eventService.isSaveDisabled = true;
      return true;
    } else {
      this.eventService.isSaveDisabled = false;
      return false;
    }
  }

  ngAfterViewChecked() {
    this._cdr.detectChanges();
  }

  checkPermission(isViewPermission: any) {
    if (
      this.eventData.userPermission.isClient == 1 ||
      this.eventData.userPermission.isEventManager == 1 ||
      isViewPermission == 1
    ) {
      return false;
    } else {
      return true;
    }
  }
}
