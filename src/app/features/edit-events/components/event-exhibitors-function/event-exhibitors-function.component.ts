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
import {
  ConfirmationDialogComponent,
  ImportExportComponent,
} from 'src/app/shared/components';
import { AngularEditorConfig } from '@kolkov/angular-editor';
import { UserInfoService, UserSettingsService } from 'src/app/shared/services';
import { ToastrService } from 'ngx-toastr';
import { DatePipe } from '@angular/common';

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
    private toasterDisplayed = false;
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
    sanitize: false,
    defaultFontSize: '2',
    showToolbar: false,
    toolbarHiddenButtons: [
      [
        // 'undo',
        // 'redo',
        // 'fontSize',
        // 'textColor',
        // 'backgroundColor',
        // 'bold',
        // 'italic',
        // 'underline',
        // 'strikeThrough',
        'subscript',
        'superscript',
        // 'justifyLeft',
        // 'justifyCenter',
        // 'justifyRight',
        'justifyFull',
        // 'indent',
        // 'outdent',
        // 'insertUnorderedList',
        // 'insertOrderedList',
        'heading',
        'fontName'
      ],
      [
        'customClasses',
        'link',
        'unlink',
        'insertImage',
        'insertVideo',
        'insertHorizontalRule',
        'removeFormat',
        'toggleEditorMode'
      ]
    ],
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
  config1: AngularEditorConfig = {
    editable: true,
    spellcheck: true,
    // height: '15rem',
    minHeight: '5rem',
    placeholder: 'Enter text here...',
    translate: 'no',
    defaultParagraphSeparator: 'p',
    defaultFontName: 'Arial',
    sanitize: false,
    defaultFontSize: '2',
    showToolbar: false,
    toolbarHiddenButtons: [
      [
        // 'undo',
        // 'redo',
        // 'fontSize',
        // 'textColor',
        // 'backgroundColor',
        // 'bold',
        // 'italic',
        // 'underline',
        // 'strikeThrough',
        'subscript',
        'superscript',
        // 'justifyLeft',
        // 'justifyCenter',
        // 'justifyRight',
        'justifyFull',
        // 'indent',
        // 'outdent',
        // 'insertUnorderedList',
        // 'insertOrderedList',
        'heading',
        'fontName'
      ],
      [
        'customClasses',
        'link',
        'unlink',
        'insertImage',
        'insertVideo',
        'insertHorizontalRule',
        'removeFormat',
        'toggleEditorMode'
      ]
    ],
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
  config2: AngularEditorConfig = {
    editable: true,
    spellcheck: true,
    // height: '15rem',
    minHeight: '5rem',
    placeholder: 'Enter text here...',
    translate: 'no',
    defaultParagraphSeparator: 'p',
    defaultFontName: 'Arial',
    sanitize: false,
    defaultFontSize: '2',
    showToolbar: false,
    toolbarHiddenButtons: [
      [
        // 'undo',
        // 'redo',
        // 'fontSize',
        // 'textColor',
        // 'backgroundColor',
        // 'bold',
        // 'italic',
        // 'underline',
        // 'strikeThrough',
        'subscript',
        'superscript',
        // 'justifyLeft',
        // 'justifyCenter',
        // 'justifyRight',
        'justifyFull',
        // 'indent',
        // 'outdent',
        // 'insertUnorderedList',
        // 'insertOrderedList',
        'heading',
        'fontName'
      ],
      [
        'customClasses',
        'link',
        'unlink',
        'insertImage',
        'insertVideo',
        'insertHorizontalRule',
        'removeFormat',
        'toggleEditorMode'
      ]
    ],
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
  userId:any;
  isSelectAll: any = false;
  isSelectAllSend: boolean = false;
  SendCheck:any;
  contactType:string="exhibitorTab";
  currentDateTimeStamp: any ;
  dateHistory:any=[];
  SendType : any ="contact";

  constructor(
    public eventService: EventService,
    private viewEventService: ViewEventService,
    private router: Router,
    public modalService: NgbModal,
    public aroute: ActivatedRoute,
    private datePipe: DatePipe,
    public userInfoService:UserInfoService,
    public eventSrvc: EventService,
    private toaster: ToastrService
  ) {
    this.aroute.queryParams.subscribe((param) => {
      console.log('param...', param);
      this.isPast = param.isPast;
    });
  }

  save(venueIndexLocal: any, exhibitorIndexLocal: any, shouldInvite: any) {
    this.isNotesEdit = false;
    this.eventService.isNotesEdit = false;
    this.saveAndInvite.emit({
      venueIndex: venueIndexLocal,
      exhibitorIndex: exhibitorIndexLocal,
      shouldInvite: shouldInvite,
    });
  }

  editNotes() {
    this.isNotesEdit = true;
    this.eventService.isNotesEdit = true;
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
      for (
        let i = 0;
        i <
        this.eventToBeSaved!.venues!.list[venueIndex].exhibitorList[0]
          .exhibitors[exhibitorIndex].timeWindows.bumpIn.timings.length;
        i++
      ) {
        this.eventToBeSaved!.venues!.list[
          venueIndex
        ].exhibitorList[0].exhibitors[
          exhibitorIndex
        ].timeWindows.bumpIn.timings[i].notes = '';
      }

      this.eventToBeSaved!.venues!.list[venueIndex].exhibitorList[0].exhibitors[
        exhibitorIndex
      ].timeWindows.bumpOut.timings =
        this.eventToBeSaved!.venues!.list[
          venueIndex
        ].exhibitorList[0].timeWindowsToAll.bumpOut.timings;
      for (
        let i = 0;
        i <
        this.eventToBeSaved!.venues!.list[venueIndex].exhibitorList[0]
          .exhibitors[exhibitorIndex].timeWindows.bumpOut.timings.length;
        i++
      ) {
        this.eventToBeSaved!.venues!.list[
          venueIndex
        ].exhibitorList[0].exhibitors[
          exhibitorIndex
        ].timeWindows.bumpOut.timings[i].notes = '';
      }

      this.eventToBeSaved!.venues!.list[venueIndex].exhibitorList[0].exhibitors[
        exhibitorIndex
      ].timeWindows.eventTime.timings =
        this.eventToBeSaved!.venues!.list[
          venueIndex
        ].exhibitorList[0].timeWindowsToAll.eventTime.timings;
      for (
        let i = 0;
        i <
        this.eventToBeSaved!.venues!.list[venueIndex].exhibitorList[0]
          .exhibitors[exhibitorIndex].timeWindows.eventTime.timings.length;
        i++
      ) {
        this.eventToBeSaved!.venues!.list[
          venueIndex
        ].exhibitorList[0].exhibitors[
          exhibitorIndex
        ].timeWindows.eventTime.timings[i].notes = '';
      }

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
    if (!this.isNotesEdit) {
      this.config.editable = false;
      this.config.showToolbar = false;
    } else {
      $('#editntle .angular-editor-textarea').css('border-top', 'none');
      this.config.editable = true;
      this.config.showToolbar = true;
    }
  }
  changeConfig1() {
    if (!this.isExhibitorEdit) {
      this.config1.editable = false;
      this.config1.showToolbar = false;
    } else {
      $('#editein .angular-editor-textarea').css('border-top', 'none');
      this.config1.editable = true;
      this.config1.showToolbar = true;
    }
  }
  changeConfigPermission(exhibitor:any) {
    
    if (!this.isExhibitorEdit ||
      !exhibitor?.isViewPermission || (this.permissionObj.isClient == false&&this.permissionObj.isExhibitor==true&& this.permissionObj.isEventManager==false) || (this.permissionObj.isVenue == false &&this.permissionObj.isClient == false &&this.permissionObj.isEventManager == false&&this.permissionObj.isExhibitor == false && this.permissionObj.isService == false && this.permissionObj.isCrew == false)) {
      this.config2.editable = false;
      this.config2.showToolbar = false;
    } else {
      $('#editntse .angular-editor-textarea').css('border-top', 'none');
      this.config2.editable = true;
      this.config2.showToolbar = true;
    }
  }

  check() {
    if (!this.isExhibitorEdit && this.isPast == 'false') {
      return true;
    } else {
      return false;
    }
  }

  importExport(venueIndex: any) {
    let ngbModalOptions: NgbModalOptions = {
      backdrop: 'static',
      keyboard: false,
    };
    const modalRef = this.modalService.open(
      ImportExportComponent,
      ngbModalOptions
    );
    modalRef.componentInstance.type = 'exhibitors';
    modalRef.result
      .then((result: any) => {
        if (result && result.url) {
          console.log('result...', result);
          let data = {
            eventId: this.eventData.eventData.eventId,
            tabType: 'exhibitors',
            actionType: 'import',
            venueId: this.eventToBeSaved!.venues!.list[venueIndex].venueId,
            url: result.url,
            userId:this.userId
          };
          this.eventService.importExport(data).subscribe(
            (res: any) => {
              console.log(res);
              if (res.code == 200) {
                this.router.navigate(['/']);
              }
            },
            (err) => {
              console.log(err);
            }
          );
        } else if (result) {
          console.log('result else...', result);
          console.log('event data...', this.eventData);
          let data = {
            eventId: this.eventData.eventData.eventId,
            tabType: 'exhibitors',
            actionType: 'export',
            venueId: this.eventToBeSaved!.venues!.list[venueIndex].venueId,
            url: '',
            userId:this.userId
          };
          this.eventService.importExport(data).subscribe(
            (res: any) => {
              console.log(res);
              if (res.code == 200) {
                window.open(res.data.uploadRes.Location, '_blank');
                setTimeout(() => {
                  this.eventService
                    .deleteBucketFile(res.data.uploadRes.key)
                    .subscribe(
                      (deleteRes: any) => {
                        console.log(deleteRes);
                      },
                      (err) => {
                        console.log(err);
                      }
                    );
                }, 10000);
              }
            },
            (err) => {
              console.log(err);
            }
          );
        }
      })
      .catch((result) => {});
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
    this.isNotesEdit = this.eventService.isNotesEdit;
  }

  private fetchUserInfo(): void {
    this.userInfoService.getInfo().subscribe(
      (value) => {
        console.log('value...', value)
        this.userId = value.id;
      },
      (err) => {
        devLogger('error', { err });
      }
    );
  }

  ngOnInit(): void {
    this.fetchUserInfo();
    if (this.eventData.eventData.isDeleted == 1) {
      this.eventService.isDeleted = true;
    }
    this.exhCompanyAddedSub =
      this.eventService.exhibitorCompanyAddSubject.subscribe((value) => {
        console.log("this has data ")
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
          console.log("param.company event++++++",param.company);
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

    console.log("eventToBeSaved+++++++ exhibitor",this.eventToBeSaved);
    console.log("venuesExhCmpsMap by me ++++++",this.venuesExhCmpsMap);
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
  ched:any;
  SendAllConfirmation( venues: any, venuesdsIndex: any){
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const day = String(currentDate.getDate()).padStart(2, '0');
    const hours = String(currentDate.getHours()).padStart(2, '0');
    const minutes = String(currentDate.getMinutes()).padStart(2, '0');
    const seconds = String(currentDate.getSeconds()).padStart(2, '0');
    
    const formattedDate = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

    
    var checkedValues;
    checkedValues = venues.exhibitorList[0].exhibitors.filter((checked: any) => {
     
      return checked.isCheckSend === true;
    });

    for (const [exhibitorIndex, venucxe] of venues.exhibitorList[0].exhibitors.entries()) {
      this.SendCheck=document.getElementById('send-' + exhibitorIndex + '_venue_' + venuesdsIndex);
     
      if(venucxe.isCheckSend==true){
       
        this.eventSrvc.SaveConfirmationDate(venucxe.contacts, this.contactType, formattedDate, venucxe, this.eventData.eventData.eventId,this.SendType).subscribe(
          (res: any) => {
            this.getLatestDate(this.contactType, venucxe, this.eventData.eventData.eventId,this.SendType);
            if ((exhibitorIndex == checkedValues.length - 1) && res.code == 200) {
              this.toaster.success("Confirmation Sent Successfully");
            }
            venucxe.isCheckSend=false;
            this.eventSrvc.letestDate.next("Send");
            this.ched=   document.getElementById('selectallForSend'+venuesdsIndex);
            this.ched.checked=false;
          },
          (err) => {
            console.log(err.error.message);
          }
        );
      
      }
       
      }
  }

  getLatestDate(tabName: any, selectedCompany: any, eventId: any,SendType:any) {
    this.eventSrvc.GetLatestDate(tabName, selectedCompany, eventId,SendType).subscribe(
      (res: any) => {
        if(res.data[0]==null){
          this.currentDateTimeStamp="None sent";
        }
        else{
          this.currentDateTimeStamp=res.data[0];
        }
      },
      (err) => {
        console.log(err.error.message);
      }
    );
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

  
  checkseldct: any;
  checkseldctSend: any;
  selectAllCheckboxes(event: Event, venues: any, venuesdsIndex: any): void {

    this.checkseldct = document.getElementById('selectall' + venuesdsIndex);

    if (this.checkseldct.checked == true) {
      this.isSelectAll = true;
    }
    else {
      this.isSelectAll = false;
    }

    for (const [exhibitorIndex, venucxe] of venues.exhibitorList[0].exhibitors.entries()) {
      venucxe.isCheck = this.isSelectAll;
      venucxe.isCheckDirect = this.isSelectAll;
      if (document.getElementById('times-' + exhibitorIndex + '_venue_' + venuesdsIndex)) {
        this.listenTimeChange(event, venuesdsIndex, exhibitorIndex)
      }

    }
  }

  selectAllForSendConfrm(event: any, venues: any, venuesdsIndex: any): void {


    this.checkseldctSend = document.getElementById('selectallForSend' + venuesdsIndex);
    if (this.checkseldctSend.checked == true) {
      this.isSelectAllSend = true;
    }
    else {
      this.isSelectAllSend = false;

    }
    for (const [serviceIndex, venucxe] of venues.exhibitorList[0].exhibitors.entries()) {
      venucxe.isCheckSend = this.isSelectAllSend;
      venucxe.isCheckDirectSend = this.isSelectAllSend;
    }
  }
  
}
