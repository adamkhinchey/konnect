import {Component, Input, OnInit} from '@angular/core';
import {NgbNav} from "@ng-bootstrap/ng-bootstrap";
import {Company} from "../../../users/models";

@Component({
  selector: 'app-event-client-function',
  templateUrl: './event-client-function.component.html',
  styleUrls: ['./event-client-function.component.scss'],
})
export class EventClientFunctionComponent implements OnInit {
  @Input() selectedCompany: Company | undefined;
  @Input() content: any;

  constructor() {
  }

  ngOnInit(): void {
  }

  openVerticallyCentered(content: any): void {

  }
}
