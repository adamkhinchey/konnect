import { Component, Input, OnInit } from '@angular/core';
import { EventService } from "../../services/event.service";

@Component({
  selector: 'app-create-event-info-bar',
  templateUrl: './create-event-info-bar.component.html',
  styleUrls: ['./create-event-info-bar.component.scss']
})
export class CreateEventInfoBarComponent implements OnInit {
  @Input() isEdit: boolean = false;
  constructor(public eventService: EventService) { }

  ngOnInit(): void {
  }

  edit() {
    this.eventService.isEdit = true;
  }

}
