import {Component, OnInit, Output, EventEmitter, Input} from '@angular/core';
import {devLogger} from "../../../../shared/utils";

@Component({
  selector: 'app-date-time-picker',
  templateUrl: './date-time-picker.component.html',
  styleUrls: ['./date-time-picker.component.scss']
})
export class DateTimePickerComponent implements OnInit {

  @Input() index: any;
  @Output() addNewDateTime = new EventEmitter<Date>();

  constructor() {
  }

  ngOnInit(): void {
  }

  setDateTime(event: any): void {
    this.addNewDateTime.emit(event.value);
  }
}
