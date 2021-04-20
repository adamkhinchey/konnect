import {Component, Input, OnInit, Output, EventEmitter} from '@angular/core';
import {devLogger} from "../../../../shared/utils";
import {TimeWindowFormatInterface} from "../../models/interfaces";

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

  constructor() {
  }

  ngOnInit(): void {
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
