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
import {devLogger} from "../../../../shared/utils";
import {Moment} from 'moment';
import {OwlDateTimeComponent} from "@danielmoncada/angular-datetime-picker";

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
  @Output() addNewDateTime = new EventEmitter<Date>();

  constructor() {
  }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {

  }

  setDateTime(event: any): void {
    this.addNewDateTime.emit(event.value);
  }

}
