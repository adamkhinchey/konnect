import { Component, Input, OnInit, AfterViewInit, ViewChild, AfterViewChecked, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { IgxCalendarComponent, DateRangeType, DateRangeDescriptor } from 'igniteui-angular';
import * as moment from 'moment'

@Component({
  selector: 'app-events-listings',
  templateUrl: './events-listings.component.html',
  styleUrls: ['./events-listings.component.scss']
})
export class EventsListingsComponent implements OnInit, AfterViewChecked {
  @ViewChild('calendar', { static: true }) calendar: IgxCalendarComponent = new IgxCalendarComponent();
  @Input() events: any;
  dates: any = [];
  specialDates: DateRangeDescriptor[] = [];
  constructor(
    private cdRef: ChangeDetectorRef,
    private router: Router
  ) { }

  ngOnInit(): void {
    console.log(this.events);
    for (let i = 0; i < this.events.length; i++) {
      console.log('loop time: ', i);
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
    console.log(this.dates);
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


}
