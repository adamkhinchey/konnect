import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-event-manager-function',
  templateUrl: './event-manager-function.component.html',
  styleUrls: ['./event-manager-function.component.scss']
})
export class EventManagerFunctionComponent implements OnInit {
  @Input() content: any;
  constructor() { }

  ngOnInit(): void {
  }

  openVerticallyCentered(content: any) {

  }

  openVerticallyCentered2(content: any) {
    
  }
}
