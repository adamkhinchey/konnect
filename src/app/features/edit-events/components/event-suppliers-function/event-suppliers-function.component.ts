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
import {
  ConfirmationDialogComponent,
  ImportExportComponent,
} from 'src/app/shared/components';
import { AngularEditorConfig } from '@kolkov/angular-editor';
import { UserInfoService } from 'src/app/shared/services';
import { entries } from 'lodash-es';
import { ToastrService } from 'ngx-toastr';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-event-suppliers-function',
  templateUrl: './event-suppliers-function.component.html',
  styleUrls: ['./event-suppliers-function.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default,
})
export class EventSuppliersFunctionComponent
  implements OnInit, OnDestroy, OnChanges, AfterViewChecked {
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
  isToggled:any;
  
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
  isPreEventTimesSameAsVenue: boolean = false;
  isEventTimesSameAsVenue: boolean = false;
  isPostEventTimesSameAsVenue: boolean = false;
  preEventTimesCount = 1;
  eventTimesCount = 1;
  postEventTimesCount = 1;
  venueIndexLocal = 1;
  serviceIndexLocal = 1;
  userId: any;
  isSelectAll: any = false;
  isSelectAllSend: boolean = false;
  SendCheck:any;
 contactType:string="servicesTab";
 currentDateTimeStamp: any ;
 dateHistory:any=[];

  constructor(
    public eventService: EventService,
    private viewEventService: ViewEventService,
    private router: Router,
    public _cdr: ChangeDetectorRef,
    public eventSrvc: EventService,
    private toaster: ToastrService,
    public modalService: NgbModal,
    public aroute: ActivatedRoute,
    public userInfoService: UserInfoService,
    private datePipe: DatePipe
  ) {
    this.aroute.queryParams.subscribe((param) => {
      console.log('param...', param);
      this.isPast = param.isPast;
      console.log('is past...', this.isPast);
    });
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


  checkbox: any = null;
  listenTimeChange(event: Event, venueIndex: any, serviceIndex: any): void {
    // console.log('event...', event)

    this.venueIndexLocal = venueIndex;
    this.serviceIndexLocal = serviceIndex;
    const target = event.target as HTMLInputElement;
    const { checked } = target;
    // console.log("checked+++++", checked);
    if (checked) {
      this.isUseVenueTime = true;
      this.isPreEventTimesSameAsVenue = true;
      this.isEventTimesSameAsVenue = true;
      this.isPostEventTimesSameAsVenue = true;
      this.eventToBeSaved!.venues!.list[venueIndex].suppliers[0].services[
        serviceIndex
      ].timeWindows.bumpIn.timings =
        this.eventToBeSaved!.venues!.list[venueIndex].preEventAccessDateTimes;
      for (
        let i = 0;
        i <
        this.eventToBeSaved!.venues!.list[venueIndex].suppliers[0].services[
          serviceIndex
        ].timeWindows.bumpIn.timings.length;
        i++
      ) {
        this.eventToBeSaved!.venues!.list[venueIndex].suppliers[0].services[
          serviceIndex
        ].timeWindows.bumpIn.timings[i].notes = '';
      }

      this.eventToBeSaved!.venues!.list[venueIndex].suppliers[0].services[
        serviceIndex
      ].timeWindows.bumpOut.timings =
        this.eventToBeSaved!.venues!.list[venueIndex].postEventAccessDateTimes;

      for (
        let i = 0;
        i <
        this.eventToBeSaved!.venues!.list[venueIndex].suppliers[0].services[
          serviceIndex
        ].timeWindows.bumpOut.timings.length;
        i++
      ) {
        this.eventToBeSaved!.venues!.list[venueIndex].suppliers[0].services[
          serviceIndex
        ].timeWindows.bumpOut.timings[i].notes = '';
      }

      this.eventToBeSaved!.venues!.list[venueIndex].suppliers[0].services[
        serviceIndex
      ].timeWindows.eventTime.timings =
        this.eventToBeSaved!.venues!.list[venueIndex].eventAccessDateTimes;

      for (
        let i = 0;
        i <
        this.eventToBeSaved!.venues!.list[venueIndex].suppliers[0].services[
          serviceIndex
        ].timeWindows.eventTime.timings.length;
        i++
      ) {
        this.eventToBeSaved!.venues!.list[venueIndex].suppliers[0].services[
          serviceIndex
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
  save(venueIndexLocal: any, serviceIndexLocal: any, shouldInvite: any) {
    this.isNotesEdit = false;
    this.eventService.isNotesEdit = false;
    this.saveAndInvite.emit({
      venueIndex: venueIndexLocal,
      serviceIndex: serviceIndexLocal,
      shouldInvite: shouldInvite,
    });
  }

  editNotes() {
    this.isNotesEdit = true;
    this.eventService.isNotesEdit = true;
    // this.isServiceEdit = !this.isServiceEdit;
  }

  changeConfig() {
    if (!this.isNotesEdit) {
      this.config.editable = false;
      this.config.showToolbar = false;
    } else {
      $('#editntas .angular-editor-textarea').css('border-top', 'none');
      this.config.editable = true;
      this.config.showToolbar = true;
    }
  }
  changeConfigPermission() {
    if (!this.isServiceEdit) {
      this.config2.editable = false;
      this.config2.showToolbar = false;
    } else {
      $('#editsin .angular-editor-textarea').css('border-top', 'none');
      this.config2.editable = true;
      this.config2.showToolbar = true;
    }
  }

  changeConfigPermission1(service: any) {
    console.log('this.isServiceEdit', this.isServiceEdit);
    console.log('service?.isViewPermission', service?.isViewPermission);
    console.log('this.permissionObj.isService', this.permissionObj);

    if (!this.isServiceEdit ||
      !service?.isViewPermission || (this.permissionObj.isClient == false && this.permissionObj.isService == true && this.permissionObj.isEventManager == false) || (this.permissionObj.isVenue == false && this.permissionObj.isClient == false && this.permissionObj.isEventManager == false && this.permissionObj.isExhibitor == false && this.permissionObj.isService == false && this.permissionObj.isCrew == false)) {
      this.config1.editable = false;
      this.config1.showToolbar = false;
    } else {
      $('#editsr .angular-editor-textarea').css('border-top', 'none');
      this.config1.editable = true;
      this.config1.showToolbar = true;
    }
  }

  check() {
    if (!this.isServiceEdit && this.isPast == 'false') {
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
    modalRef.componentInstance.type = 'services';

    modalRef.result
      .then((result: any) => {
        if (result && result.url) {
          console.log('result...', result);
          let data = {
            eventId: this.eventData.eventData.eventId,
            tabType: 'services',
            actionType: 'import',
            venueId: this.eventToBeSaved!.venues!.list[venueIndex].venueId,
            url: result.url,
            userId: this.userId
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
            tabType: 'services',
            actionType: 'export',
            venueId: this.eventToBeSaved!.venues!.list[venueIndex].venueId,
            url: '',
            userId: this.userId
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
      .catch((result) => { });
  }

  ngOnChanges(changes: SimpleChanges) {
    this.isServiceEdit = this.eventService.isEdit;
    this.isServiceEditable = this.eventService.isEdit;
    this.isNotesEdit = this.eventService.isNotesEdit;
  }

  editServiceFn(editServiceFn: number) {
    this.eventService.isEdit = !this.isServiceEdit;
    this.isServiceEdit = !this.isServiceEdit;
    this.isServiceEditable = !this.isServiceEditable;
   // this.isNotesEdit = true;
    this.editServiceIndex = editServiceFn;
  }
  checkseldcffft:any;
  ngOnInit(): void {
    this.fetchUserInfo();


    console.log('permission obj in init...', this.permissionObj);

    this.eventSrvc.GetViewExhibitor( this.eventToBeSaved.venues, this.eventData.eventData.eventId).subscribe(
      (res: any) => {
      
        res.data.map((item:any)=>{
          if(item!==null){
            console.log("res opf get vuiew service_id++++",item);
            console.log("res opf get vuiew venue_id++++",item.venue_id);
            this.isToggled=item.status ? true: false;
            console.log("toggle send************",this.isToggled);
          }
         
        })
        },
      (err) => {
        console.log(err.error.message);
      }
    );
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
    this.eventSrvc.letestDate.next(null);
    
    console.log("eventData+++++",this.eventData);
    console.log("eventToBeSaved+++++",this.eventToBeSaved);
   
     
    
  
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

    for (const [serviceIndex, venucxe] of venues.suppliers[0].services.entries()) {
      venucxe.isCheck = this.isSelectAll;
      venucxe.isCheckDirect = this.isSelectAll;
      if (document.getElementById('times-' + serviceIndex + '_venue_' + venuesdsIndex)) {
        this.listenTimeChange(event, venuesdsIndex, serviceIndex)
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
    for (const [serviceIndex, venucxe] of venues.suppliers[0].services.entries()) {
      venucxe.isCheckSend = this.isSelectAllSend;
      venucxe.isCheckDirectSend = this.isSelectAllSend;
    }
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

  openVerticallyCentered(content: any): void { }

  panelChange($event: NgbPanelChangeEvent): void { }

  addService(venue: VenueListItemInterface, venueIndex: number): void {
    this.isServiceEdit = true;
    this.isServiceEditable = true;
    // this.eventService.addsupplier.next(true);
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
    this.eventSrvc.letestDate.next(null);
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
      .catch((result) => { });
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
        (res: any) => { },
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

  ched:any;
  SendType : any ="contact";
  checkkddata:any=false;
  SendAllConfirmation( venues: any, venuesdsIndex: any){

    this.checkkddata=false;
    const currentDate = new Date();
    let messagecheck="";
    const day = currentDate.getDate().toString().padStart(2, '0');
    const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
    const year = currentDate.getFullYear().toString();

    const hours = currentDate.getHours().toString().padStart(2, '0');
    const minutes = currentDate.getMinutes().toString().padStart(2, '0');

    const formattedDate = `${day}-${month}-${year}`;
    const formattedTime = `${hours}:${minutes}`;

    this.currentDateTimeStamp = `${formattedDate}, ${formattedTime}`;

    for (const [serviceIndex, venucxe] of venues.suppliers[0].services.entries()) {
      this.SendCheck=document.getElementById('send-' + serviceIndex + '_venue_' + venuesdsIndex);
     
      venucxe.isCheckSend=this.SendCheck.checked;
  
      if(venucxe.isCheckSend==true){
       this.checkkddata=true;
        this.eventSrvc.SaveConfirmationDate(venucxe.contacts, this.contactType, this.currentDateTimeStamp, venucxe, this.eventData.eventData.eventId,this.SendType).subscribe(
          (res: any) => {
            this.getLatestDate(this.contactType, venucxe, this.eventData.eventData.eventId,this.SendType);
              this.toaster.success("Confirmation Sent Successfully");
              this.ched= document.getElementById('selectallForSend'+venuesdsIndex);
              this.ched.checked=false;
              venucxe.isCheckSend=false;
              this.eventSrvc.letestDate.next("Send");
              messagecheck="succesfull";
          },
          (err) => {
            console.log(err.error.message);
            messagecheck="error";
          }
        );
      
      }

    
       
      }

      if(this.checkkddata==false){

        this.toaster.error("error");
        
      }
  }

  getLatestDate(tabName: any, selectedCompany: any, eventId: any,SendType:any) {
    this.eventSrvc.GetLatestDate(tabName, selectedCompany, eventId,SendType).subscribe(
      (res: any) => {
        if (res.data[0].latest_date == null) {

          this.currentDateTimeStamp = "None sent";

        }
        else {
          const formattedDate = this.datePipe.transform(res.data[0].latest_date, 'dd-MM-yyyy HH:mm');

          this.currentDateTimeStamp = formattedDate;

        }

      },
      (err) => {
        console.log(err.error.message);
      }
    );
  }

 

}
