import {
  Component,
  OnInit,
  Output,
  EventEmitter,
  Input,
  ViewChild,
  AfterViewInit,
  TemplateRef,
  ElementRef
} from '@angular/core';
import { devLogger } from "../../../../shared/utils";
import { Moment } from 'moment';
import { OwlDateTimeComponent } from "@danielmoncada/angular-datetime-picker";
import * as moment from 'moment';

@Component({
  selector: 'app-date-time-picker',
  templateUrl: './date-time-picker.component.html',
  styleUrls: ['./date-time-picker.component.scss']
})
export class DateTimePickerComponent implements OnInit, AfterViewInit {


  @ViewChild('dt1') owlDateTime: OwlDateTimeComponent<any> | undefined;
  @ViewChild('inp') dateTimeInput: ElementRef | undefined;
  @Input() minimumDate: Date | undefined;
  @Input() max: any = null;
  @Input() index: any;
  @Input() eventDateTime: any;
  @Input() freeze = false;
  @Input() isEdit: boolean = false;
  @Output() addNewDateTime = new EventEmitter<Date>();

  constructor() {
  }

  ngOnInit(): void {
    if (this.max) {
      let date: any = moment(this.max).format('YYYY-MM-DD');
      console.log(date);
      date = moment.utc(date).add(24, 'hours');
      console.log(moment.utc(date));
    }
  }

  ngAfterViewInit(): void {

  }

  setDateTime(event: any): void {
    this.addNewDateTime.emit(event.value);
  }

}
