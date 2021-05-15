import {Component, OnInit, Output, EventEmitter, Input, ViewChild} from '@angular/core';
import {devLogger} from "../../../../shared/utils";
import {Moment} from 'moment';
import {OwlDateTimeComponent} from "@danielmoncada/angular-datetime-picker";

@Component({
  selector: 'app-date-time-picker',
  templateUrl: './date-time-picker.component.html',
  styleUrls: ['./date-time-picker.component.scss']
})
export class DateTimePickerComponent implements OnInit {

  @ViewChild('dt1') owlDateTime: OwlDateTimeComponent<any> | undefined;
  @Input() minimumDate: Date | undefined;
  @Input() index: any;
  @Input() eventDateTime: any;
  @Output() addNewDateTime = new EventEmitter<Date>();

  constructor() {
  }

  ngOnInit(): void {
  }

  setDateTime(event: any): void {
    this.addNewDateTime.emit(event.value);
  }
}
