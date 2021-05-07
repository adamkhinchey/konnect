import {Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges, TemplateRef, ViewChild} from '@angular/core';
import {NgbModal, NgbModalRef} from "@ng-bootstrap/ng-bootstrap";
import {EventService} from "../../services/event.service";
import {devLogger} from "../../../../shared/utils";
import {Subscription} from "rxjs";
import {EventFiles} from "../../models/classes";
import {EventFileTypes} from "../../models/types";
import {EventFilesSignedURLReq} from "../../models/interfaces";

@Component({
  selector: 'app-event-files-function',
  templateUrl: './event-files-function.component.html',
  styleUrls: ['./event-files-function.component.scss']
})
export class EventFilesFunctionComponent implements OnInit, OnDestroy, OnChanges {

  @ViewChild('uploadFilesModal') uploadFilesModal: TemplateRef<any> | undefined;
  @Input() eventID: number | undefined = 162;
  fileUploadModalReference: NgbModalRef | undefined;
  private fetchEventFilesSubs: Subscription | undefined;
  private fetchEventFilesTrigger: Subscription | undefined;
  eventFiles: EventFiles | undefined;
  fileType = EventFileTypes;
  uploadingFileType: EventFileTypes | undefined;
  eventFilesSignedURLReqPayload: Partial<EventFilesSignedURLReq> = {};

  constructor(
    private modalService: NgbModal,
    private eventService: EventService) {
  }

  ngOnChanges(changes: SimpleChanges): void {
    /*if (changes.eventID.currentValue) {
    }*/
  }

  ngOnInit(): void {
    this.fetchEventFilesTrigger = this.eventService.fetchEventFilesSubject.subscribe(eventID => {
      this.eventID = eventID;
      this.fetchEventFilesSubs = this.eventService.fetchEventFiles(this.eventID)
        .subscribe((value) => {
          this.eventFiles = new EventFiles(value.data.event);
          this.eventFilesSignedURLReqPayload.eventUid = this.eventFiles.data.eventUid;
          this.eventFilesSignedURLReqPayload.eventId = this.eventFiles.data.eventId;
          devLogger('log', {eventFiles: this.eventFiles});
        }, (err) => {
          devLogger('error', {err});
        });
    });

  }

  contentUpload(
    content: any,
    fileType: EventFileTypes,
    fileFnIds?: { venueId?: number, serviceId?: number, exhibitorId?: number }): void {
    this.fileUploadModalReference = this.modalService.open(content, {
      centered: true,
      size: 'md',
      backdrop: 'static',
      keyboard: false,
    });
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
  }

  ngOnDestroy(): void {
    this.fetchEventFilesTrigger?.unsubscribe();
    this.fetchEventFilesSubs?.unsubscribe();
  }

}
