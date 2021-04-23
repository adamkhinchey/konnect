import {Component, Input, OnInit, Output, EventEmitter} from '@angular/core';
import {devLogger} from "../../../../shared/utils";
import {TimeWindowFormatInterface} from "../../models/interfaces";
import {ToastrService} from "ngx-toastr";
import * as moment from "moment";

@Component({
  selector: 'app-time-windows',
  templateUrl: './time-windows.component.html',
  styleUrls: ['./time-windows.component.scss']
})
export class TimeWindowsComponent implements OnInit {
  Arr = Array;
  preEventTimesCount = 1;
  preEventNotes = '';
  @Input() preEventTimes: Partial<TimeWindowFormatInterface>[] = [];
  eventTimesCount = 1;
  eventNotes = '';
  @Input() eventTimes: Partial<TimeWindowFormatInterface>[] = [];
  postEventTimesCount = 1;
  postEventNotes = '';
  @Input() postEventTimes: Partial<TimeWindowFormatInterface>[] = [];
  @Input() index: any;

  @Output() test = new EventEmitter();

  constructor(private toaster: ToastrService) {
  }

  ngOnInit(): void {
  }

  getMinimumPreEventStartDateTime(i: number): Date {
    return moment().add('1', 'minutes').toDate();
  }

  getMinimumPreEventEndDateTime(i: number): Date {
    return this.preEventTimes[i]?.startDateTime || moment().add('1', 'minutes').toDate();
  }

  pushPreEventStartDateTime(event: Date, i: number): void {
    if (this.preEventTimes.length === 0) {
      this.preEventTimes.push({startDateTime: event, notes: this.preEventNotes});
      return;
    }
    this.preEventTimes[i] = {
      ...this.preEventTimes[i],
      startDateTime: event,
      notes: this.preEventNotes
    };
  }

  pushPreEventEndDateTime(event: Date, i: number): void {
    if (this.preEventTimes.length === 0) {
      this.preEventTimes.push({endDateTime: event, notes: this.preEventNotes});
      return;
    }
    this.preEventTimes[i] = {
      ...this.preEventTimes[i],
      endDateTime: event,
      notes: this.preEventNotes
    };
  }

  addMorePreEventDateTime(): void {
    const len = this.preEventTimes.length;
    const timeSlot = this.preEventTimes[len - 1];
    if (!timeSlot) {
      this.toaster.error('Please select start and end date-time for current', 'Pre-event Access');
      return;
    }
    if (!timeSlot.startDateTime) {
      this.toaster.error('Please select start date and time for current', 'Pre-event Access');
      return;
    }
    if (!timeSlot.endDateTime) {
      this.toaster.error('Please select end date and time for current', 'Pre-event Access');
      return;
    }
    this.preEventTimesCount++;
    this.preEventTimes.push({});
    this.test.emit();
  }

  populatePreEventNotes($event: any): void {
    this.preEventTimes.forEach(obj => {
      // @ts-ignore
      obj.notes = this.preEventNotes;
    });
  }


  getMinimumEventStartDateTime(i: number): Date {
    return moment().add('1', 'minutes').toDate();
  }

  getMinimumEventEndDateTime(i: number): Date {
    return this.eventTimes[i]?.startDateTime || moment().add('1', 'minutes').toDate();
  }

  pushEventStartDateTime(event: Date, i: number): void {
    if (this.eventTimes.length === 0) {
      this.eventTimes.push({startDateTime: event, notes: this.eventNotes});
      return;
    }
    this.eventTimes[i] = {
      ...this.eventTimes[i],
      startDateTime: event,
      notes: this.eventNotes
    };
  }

  pushEventEndDateTime(event: Date, i: number): void {
    if (this.eventTimes.length === 0) {
      this.eventTimes.push({endDateTime: event, notes: this.eventNotes});
      return;
    }
    this.eventTimes[i] = {
      ...this.eventTimes[i],
      endDateTime: event,
      notes: this.eventNotes
    };
  }

  addMoreEventDateTime(): void {
    const len = this.eventTimes.length;
    const timeSlot = this.eventTimes[len - 1];
    if (!timeSlot) {
      this.toaster.error('Please select start and end date-time for current', 'Event Access');
      return;
    }
    if (!timeSlot.startDateTime) {
      this.toaster.error('Please select start date and time for current', 'Event Access');
      return;
    }
    if (!timeSlot.endDateTime) {
      this.toaster.error('Please select end date and time for current', 'Event Access');
      return;
    }
    this.eventTimesCount++;
    this.eventTimes.push({});
    this.test.emit();
  }

  populateEventNotes($event: any): void {
    this.eventTimes.forEach(obj => {
      // @ts-ignore
      obj.notes = this.eventNotes;
    });
  }


  getMinimumPostEventStartDateTime(i: number): Date {
    return moment().add('1', 'minutes').toDate();
  }

  getMinimumPostEventEndDateTime(i: number): Date {
    return this.postEventTimes[i]?.startDateTime || moment().add('1', 'minutes').toDate();
  }

  pushPostEventStartDateTime(event: Date, i: number): void {
    if (this.postEventTimes.length === 0) {
      this.postEventTimes.push({startDateTime: event, notes: this.postEventNotes});
      return;
    }
    this.postEventTimes[i] = {
      ...this.eventTimes[i],
      startDateTime: event,
      notes: this.postEventNotes
    };
  }

  pushPostEventEndDateTime(event: Date, i: number): void {
    if (this.postEventTimes.length === 0) {
      this.postEventTimes.push({endDateTime: event, notes: this.postEventNotes});
      return;
    }
    this.postEventTimes[i] = {
      ...this.eventTimes[i],
      endDateTime: event,
      notes: this.postEventNotes
    };
  }

  addMorePostEventDateTime(): void {
    const len = this.postEventTimes.length;
    const timeSlot = this.postEventTimes[len - 1];
    if (!timeSlot) {
      this.toaster.error('Please select start and end date-time for current', 'Post-Event Access');
      return;
    }
    if (!timeSlot.startDateTime) {
      this.toaster.error('Please select start date and time for current', 'Post-event Access');
      return;
    }
    if (!timeSlot.endDateTime) {
      this.toaster.error('Please select end date and time for current', 'Post-event Access');
      return;
    }
    this.postEventTimesCount++;
    this.postEventTimes.push({});
    this.test.emit();
  }

  populatePostEventNotes($event: any): void {
    this.postEventTimes.forEach(obj => {
      // @ts-ignore
      obj.notes = this.postEventNotes;
    });
  }
}
