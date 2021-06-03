import { Component, Input, OnInit, AfterViewInit, ViewChild, AfterViewChecked, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { IgxCalendarComponent, DateRangeType, DateRangeDescriptor, CalendarView, IgxCalendarView } from 'igniteui-angular';
import * as moment from 'moment'

@Component({
  selector: 'app-events-listings',
  templateUrl: './events-listings.component.html',
  styleUrls: ['./events-listings.component.scss']
})
export class EventsListingsComponent implements OnInit, AfterViewChecked {
  @ViewChild('calendar', { static: true }) calendar: IgxCalendarComponent = new IgxCalendarComponent();
  @Input() events: any;
  eventsCopy: any;
  dates: any = [];
  specialDates: DateRangeDescriptor[] = [];
  constructor(
    private cdRef: ChangeDetectorRef,
    private router: Router
  ) { }

  ngOnInit(): void {
    console.log(this.events);
    this.eventsCopy = this.events;
    for (let i = 0; i < this.events.length; i++) {
      var startDate;
      var endDate;
      startDate = moment(this.events[i].eventStartDate).format('YYYY-MM-DD');
      endDate = moment(this.events[i].eventEndDate).format('YYYY-MM-DD');
      if (moment(startDate).isSame(endDate)) {
        this.dates.push(new Date(startDate));
      }
      else {
        this.dates.push(new Date(startDate));
        this.dates.push(new Date(startDate));
      }
    }
    this.specialDates = [{
      type: DateRangeType.Specific, dateRange: this.dates
      // [
      //   new Date(2021, 5 - 1, 4),
      //   new Date(2021, 5 - 1, 14),
      //   new Date(2021, 5 - 1, 15),
      //   new Date(2021, 8 - 1, 14)
      // ]
    }];
    this.cdRef.detectChanges();
    console.log(this.specialDates);
  }

  ngAfterViewChecked() {
  }

  createEvent() {
    this.router.navigate(['/home/event/create']);
  }

  changeToTodaysView() {
    let currentDate = new Date();
    this.calendar.changeMonth(currentDate);
  }

  public onSelection(dates: Date | Date[]) {
    console.log(this.events);
    console.log(dates);
    let date: any;
    console.log(moment.utc(dates.toString()).format('YYYY-MM-DD'));
    date = moment.utc(dates.toString()).format('YYYY-MM-DD');
    this.eventsCopy = this.events.filter((val: any) => {
      var startDate;
      startDate = moment(val.eventStartDate).format('YYYY-MM-DD');
      console.log(startDate);
      if (date == startDate) {
        console.log(val);
        return val;
      }
    })
  }

  viewEvent(eventId: any) {
    this.router.navigate(['/home/edit-event'], { queryParams: { eventId: eventId } });
  }

  eventHistory() {
    this.eventsCopy = this.events;
  }

}
