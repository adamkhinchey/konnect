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
  private subs2: Subscription | undefined;
  constructor(public eventService: EventService) { }

  ngOnInit(): void {
    this.subs2 = this.eventService.isEditChange.subscribe((value) => {
      this.isEditEvents = value;
    })
  }

  edit() {
    if (!this.eventService.isDeleted)
      this.eventService.isEdit = true;
  }

}
