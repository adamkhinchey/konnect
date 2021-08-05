import { Component, Input, OnInit, HostListener } from '@angular/core';
import { NgbNavChangeEvent } from '@ng-bootstrap/ng-bootstrap';
import { SaveEventClass } from "../../models/classes";

@Component({
  selector: 'app-event-panel-nav',
  templateUrl: './event-panel-nav.component.html',
  styleUrls: ['./event-panel-nav.component.scss']
})
export class EventPanelNavComponent implements OnInit {
  @Input() navChange!: ((changeEvent: NgbNavChangeEvent) => void | undefined);
  @Input() active = 1;
  @Input() content: any;
  @Input() eventToBeSaved: SaveEventClass | undefined;
  isSticky: boolean = false;
  constructor() {
  }

  ngOnInit(): void {
  }

  @HostListener('window:scroll', ['$event'])
  checkScroll() {
    this.isSticky = window.pageYOffset >= 300;
  }

  openVerticallyCentered(content: any) {

  }
  navChanged(ev: any) {
  }
}
