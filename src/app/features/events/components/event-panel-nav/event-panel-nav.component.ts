import {Component, ComponentRef, Input, OnInit, ViewChild} from '@angular/core';
import {NgbNav, NgbNavChangeEvent} from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-event-panel-nav',
  templateUrl: './event-panel-nav.component.html',
  styleUrls: ['./event-panel-nav.component.scss']
})
export class EventPanelNavComponent implements OnInit {
  @Input() navChange: ((changeEvent: NgbNavChangeEvent) => void | undefined) | undefined ;
  @Input() active = 1;
  @Input() content: any;

  constructor() {
  }

  ngOnInit(): void {
  }

  openVerticallyCentered(content: any) {

  }
}
