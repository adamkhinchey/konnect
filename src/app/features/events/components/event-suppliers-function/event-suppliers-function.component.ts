import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-event-suppliers-function',
  templateUrl: './event-suppliers-function.component.html',
  styleUrls: ['./event-suppliers-function.component.scss']
})
export class EventSuppliersFunctionComponent implements OnInit {

  @Input() content: any;

  constructor() { }

  ngOnInit(): void {
  }

  openVerticallyCentered(content: any) {

  }
}
