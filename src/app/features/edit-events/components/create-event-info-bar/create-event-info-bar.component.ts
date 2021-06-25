import { Component, Input, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { EventService } from "../../services/event.service";

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
      console.log('isSaveDisableValue: ', value)
      this.isSaveDisable = value;
    })
  }

  edit() {
    this.eventService.isEdit = true;
  }

}
