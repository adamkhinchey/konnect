import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-event-exhibitors-function',
  templateUrl: './event-exhibitors-function.component.html',
  styleUrls: ['./event-exhibitors-function.component.scss']
})
export class EventExhibitorsFunctionComponent implements OnInit {

  @Input() content: any;

  constructor() { }

  ngOnInit(): void {
  }

  openVerticallyCentered(content: any) {

  }
}
