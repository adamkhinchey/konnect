import {Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges, TemplateRef, ViewChild} from '@angular/core';
import {NgbModal, NgbModalRef} from '@ng-bootstrap/ng-bootstrap';
import {EventService} from '../../services/event.service';
import {devLogger} from '../../../../shared/utils';
import {Subscription} from 'rxjs';
import {EventFiles} from '../../models/classes';
import {EventFileTypes} from '../../models/types';
import {EventFilesSignedURLReq} from '../../models/interfaces';

@Component({
  selector: 'app-event-files-function',
  templateUrl: './event-files-function.component.html',
  styleUrls: ['./event-files-function.component.scss']
})
export class EventFilesFunctionComponent implements OnInit, OnDestroy, OnChanges {

  @ViewChild('uploadFilesModal') uploadFilesModal: TemplateRef<any> | undefined;
  @Input() eventID: number | undefined;
  // parameter for check file permission
  @Input() permissionObj: any ;



  fileUploadModalReference: NgbModalRef | undefined;
  private fetchEventFilesSubs: Subscription | undefined;
  private fetchEventFilesTrigger: Subscription | undefined;
  eventFiles: EventFiles | undefined;
  fileType = EventFileTypes;
  uploadingFileType: EventFileTypes | undefined;
  eventFilesSignedURLReqPayload: Partial<EventFilesSignedURLReq> = {};
  existingFiles: {
    displayName: string;
    fileUrl: string;
    fileId: number;
    mimeType: string;
  }[] = [];

  constructor(
    private modalService: NgbModal,
    private eventService: EventService) {
  }

  ngOnChanges(changes: SimpleChanges): void {
    /*if (changes.eventID.currentValue) {
    }*/
  }

  ngOnInit(): void {


      if(!this.permissionObj){
        this.permissionObj= {isClient: true, isEventManager: true, isService: true, isVenue: true, isExhibitor: true};

      }

    this.fetchEventFilesTrigger = this.eventService.fetchEventFilesSubject.subscribe(eventID => {
      this.eventID = eventID;
      this.fetchEventFiles(this.eventID);
    });

  }

  fetchEventFiles(eventID: number): void {
    this.fetchEventFilesSubs = this.eventService.fetchEventFiles(eventID)
      .subscribe((value) => {
        this.eventFiles = new EventFiles(value.data.event);
        this.eventFilesSignedURLReqPayload.eventUid = this.eventFiles.data.eventUid;
        this.eventFilesSignedURLReqPayload.eventId = this.eventFiles.data.eventId;
        devLogger('log', {eventFiles: this.eventFiles});
      }, (err) => {
        devLogger('error', {err});
      });
  }

  contentUpload(
    content: any,
    fileType: EventFileTypes,
    fileFnIds?: { venueId?: number, serviceId?: number, exhibitorId?: number },
    index?: number): void {
    this.uploadingFileType = fileType;
    if (fileFnIds) {
      switch (this.uploadingFileType) {
        case EventFileTypes.VENUE_FLOOR_PLAN:
        case EventFileTypes.VENUE_SHARED_FILES:
        case EventFileTypes.VENUE_INTERNAL_FILES:
          this.eventFilesSignedURLReqPayload.venueId = fileFnIds.venueId;
          break;
        case EventFileTypes.SUPPLIER_SHARED_FILES:
        case EventFileTypes.SUPPLIER_INTERNAL_FILES:
          this.eventFilesSignedURLReqPayload.serviceId = fileFnIds.serviceId;
          break;
        case EventFileTypes.EXHIBITOR_SHARED_FILES:
        case EventFileTypes.EXHIBITOR_INTERNAL_FILES:
          this.eventFilesSignedURLReqPayload.exhibitorId = fileFnIds.exhibitorId;
          break;
      }
    }

    this.setExistingFiles(this.uploadingFileType, index);
    this.fileUploadModalReference = this.modalService.open(content, {
      centered: true,
      size: 'md',
      backdrop: 'static',
      keyboard: false,
    });
  }

  setExistingFiles(uploadingFileType: EventFileTypes, index?: number): void {
    switch (uploadingFileType) {
      case EventFileTypes.CLIENT_EVENT_MANAGER_SHARED_FILES:
        this.existingFiles = this.eventFiles?.data?.files?.CEMSF?.list || [];
        return;
      case EventFileTypes.CLIENT_INTERNAL_FILES:
        this.existingFiles = this.eventFiles?.data?.files?.CIF?.list || [];
        return;
      case EventFileTypes.EVENT_FILES:
        this.existingFiles = this.eventFiles?.data?.files?.EF?.list || [];
        return;
      case EventFileTypes.EVENT_MANAGEMENT_INTERNAL_FILES:
        this.existingFiles = this.eventFiles?.data?.files?.EMIF?.list || [];
        return;
      case EventFileTypes.FILES_FOR_ALL_VENUES:
        this.existingFiles = this.eventFiles?.data?.files?.FFAV?.list || [];
        return;
      case EventFileTypes.FILES_FOR_ALL_SUPPLIERS:
        this.existingFiles = this.eventFiles?.data?.files?.FFAS?.list || [];
        return;
      case EventFileTypes.FILES_FOR_ALL_EXHIBITORS:
        this.existingFiles = this.eventFiles?.data?.files?.FFAE?.list || [];
        return;
      case EventFileTypes.VENUE_FLOOR_PLAN: {
        const venuesFiles = this.eventFiles?.data?.files?.FFAV?.venuesFiles;
        if (venuesFiles && typeof index === 'number' && venuesFiles[index]) {
          const venueFiles = venuesFiles[index];
          const FLOOR_PLAN = venueFiles?.FLOOR_PLAN;
          this.existingFiles = FLOOR_PLAN?.list || [];
        } else {
          this.existingFiles = [];
        }
        return;
      }
      case EventFileTypes.VENUE_SHARED_FILES: {
        const venuesFiles = this.eventFiles?.data?.files?.FFAV?.venuesFiles;
        if (venuesFiles && typeof index === 'number' && venuesFiles[index]) {
          const venueFiles = venuesFiles[index];
          const VSF = venueFiles?.VSF;
          this.existingFiles = VSF?.list || [];
        } else {
          this.existingFiles = [];
        }
        return;
      }
      case EventFileTypes.VENUE_INTERNAL_FILES: {
        const venuesFiles = this.eventFiles?.data?.files?.FFAV?.venuesFiles;
        if (venuesFiles && typeof index === 'number' && venuesFiles[index]) {
          const venueFiles = venuesFiles[index];
          const VIF = venueFiles?.VIF;
          this.existingFiles = VIF?.list || [];
        } else {
          this.existingFiles = [];
        }
        return;
      }
      case EventFileTypes.SUPPLIER_SHARED_FILES: {
        const suppliersFiles = this.eventFiles?.data?.files?.FFAS?.supplierFiles;
        if (suppliersFiles && typeof index === 'number' && suppliersFiles[index]) {
          const supplierFiles = suppliersFiles[index];
          const SSF = supplierFiles?.SSF;
          this.existingFiles = SSF?.list || [];
        } else {
          this.existingFiles = [];
        }
        return;
      }
      case EventFileTypes.SUPPLIER_INTERNAL_FILES: {
        const suppliersFiles = this.eventFiles?.data?.files?.FFAS?.supplierFiles;
        if (suppliersFiles && typeof index === 'number' && suppliersFiles[index]) {
          const supplierFiles = suppliersFiles[index];
          const SIF = supplierFiles?.SIF;
          this.existingFiles = SIF?.list || [];
        } else {
          this.existingFiles = [];
        }
        return;
      }
      case EventFileTypes.EXHIBITOR_SHARED_FILES: {
        const exhibitorsFiles = this.eventFiles?.data?.files?.FFAE?.exhibitorFiles;
        if (exhibitorsFiles && typeof index === 'number' && exhibitorsFiles[index]) {
          const exhibitorFiles = exhibitorsFiles[index];
          const EBSF = exhibitorFiles?.EBSF;
          this.existingFiles = EBSF?.list || [];
        } else {
          this.existingFiles = [];
        }
        return;
      }
      case EventFileTypes.EXHIBITOR_INTERNAL_FILES: {
        const exhibitorsFiles = this.eventFiles?.data?.files?.FFAE?.exhibitorFiles;
        if (exhibitorsFiles && typeof index === 'number' && exhibitorsFiles[index]) {
          const exhibitorFiles = exhibitorsFiles[index];
          const EBIF = exhibitorFiles?.EBIF;
          this.existingFiles = EBIF?.list || [];
        } else {
          this.existingFiles = [];
        }
        return;
      }
    }
  }

  closeFileUploadModal(modal: NgbModalRef): void {
    modal.close();
    if (this.eventID) {
      this.fetchEventFiles(this.eventID);
    }
  }

  showVenuesFilesSection(): boolean {
    return !!this.eventFiles?.data.files?.FFAV?.venuesFiles?.some(venueFile => venueFile.venueId);
  }

  showSuppliersFilesSection(): boolean {
    return !!this.eventFiles?.data.files?.FFAS?.supplierFiles?.some(supplierFile => supplierFile.serviceId);
  }

  showExhibitorsFilesSection(): boolean {
    return !!this.eventFiles?.data.files?.FFAE?.exhibitorFiles?.some(exhibitorFile => exhibitorFile.exhibitorId);
  }

  ngOnDestroy(): void {
    this.fetchEventFilesTrigger?.unsubscribe();
    this.fetchEventFilesSubs?.unsubscribe();
  }
}
