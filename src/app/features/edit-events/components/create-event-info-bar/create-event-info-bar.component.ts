import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/core/services/auth.service';
import { UserSettingsService } from 'src/app/shared/services';
import { EventTimelineService } from '../../services/event-timeline.service';
import { EventService } from "../../services/event.service";
import { ViewEventService } from '../../services/view-event.service';
import { CreateEventComponent } from '../create-event/create-event.component';

@Component({
  selector: 'app-create-event-info-bar',
  templateUrl: './create-event-info-bar.component.html',
  styleUrls: ['./create-event-info-bar.component.scss']
})
export class CreateEventInfoBarComponent implements OnInit {
  @Input() isEdit: boolean = false;
  isEditEvents: boolean = false;
  isSaveDisable: boolean = false;
  private subs1: Subscription | undefined;
  private subs2: Subscription | undefined;
  constructor(public eventService: EventService) { }

  ngOnInit(): void {
    this.eventService.isEditChange.subscribe((value) => {
      this.isEditEvents = value;
    })
    this.eventService.isSaveDisabledChange.subscribe((value) => {
      this.isSaveDisable = value;
    })
  }

  edit() {
    this.eventService.isEdit = true;
  }

  trigerSaveOnly() {
    // let createComp = new CreateEventComponent();
    // createComp.saveToDb();
    // this.eventService.triggerSaveOnly.next();
  }

}
