import { Component, ComponentRef, Input, OnInit, ViewChild } from '@angular/core';
import { NgbNav, NgbNavChangeEvent } from '@ng-bootstrap/ng-bootstrap';
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

  constructor() {
  }

  ngOnInit(): void {
  }

  openVerticallyCentered(content: any) {

  }
  navChanged(ev: any) {
    alert('nav changed' + ev);
  }
}
