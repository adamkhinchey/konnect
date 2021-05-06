import {Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges, TemplateRef, ViewChild} from '@angular/core';
import {NgbModal, NgbModalRef} from "@ng-bootstrap/ng-bootstrap";
import {EventService} from "../../services/event.service";
import {devLogger} from "../../../../shared/utils";
import {Subscription} from "rxjs";
import {EventFiles} from "../../models/classes";

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
  private eventFiles: EventFiles | undefined;

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
          devLogger('log', {eventFiles: this.eventFiles});
        }, (err) => {
          devLogger('error', {err});
        });
    });

  }

  contentUpload(content: any): void {
    this.fileUploadModalReference = this.modalService.open(content, {
      centered: true,
      size: 'md',
      backdrop: 'static',
      keyboard: false,
    });

  }

  ngOnDestroy(): void {
    this.fetchEventFilesTrigger?.unsubscribe();
    this.fetchEventFilesSubs?.unsubscribe();
  }

}
