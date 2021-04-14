import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-event-assign-function-cmp',
  templateUrl: './event-assign-function-cmp.component.html',
  styleUrls: ['./event-assign-function-cmp.component.scss']
})
export class EventAssignFunctionCmpComponent implements OnInit {

  @Input() content: any;

  constructor() {
  }

  ngOnInit(): void {
  }

  openVerticallyCentered(content: any) {

  }
}
