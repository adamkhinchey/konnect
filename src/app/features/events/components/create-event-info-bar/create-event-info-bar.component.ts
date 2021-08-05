import { Component, OnInit, HostListener } from '@angular/core';
import {EventService} from "../../services/event.service";

@Component({
  selector: 'app-create-event-info-bar',
  templateUrl: './create-event-info-bar.component.html',
  styleUrls: ['./create-event-info-bar.component.scss']
})
export class CreateEventInfoBarComponent implements OnInit {

  constructor(public eventService: EventService) { }
  isSticky: boolean = false;

  ngOnInit(): void {
  }
  @HostListener('window:scroll', ['$event'])
  checkScroll() {
    this.isSticky = window.pageYOffset >= 300;
  }

}
