import { Component, Input, OnInit, AfterViewInit, ViewChild, AfterViewChecked, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { IgxCalendarComponent, DateRangeType, DateRangeDescriptor, CalendarView, IgxCalendarView } from 'igniteui-angular';
import * as moment from 'moment'
import { EventslistingService } from '../../services/eventslisting.service';

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
    private router: Router,
    private eventListingSrvc: EventslistingService
  ) { }

  getDates(startDate: any, stopDate: any) {
    var dateArray = new Array();
    var currentDate: any = moment(startDate).format('YYYY-MM-DD');
    stopDate = moment(stopDate).format('YYYY-MM-DD');
    console.log(currentDate);
    console.log(stopDate);
    while (currentDate <= stopDate) {
      dateArray.push(currentDate)
      currentDate = moment(currentDate).add(1, 'day').format('YYYY-MM-DD');
      console.log(currentDate);
    }
    return dateArray;
  }

  ngOnInit(): void {
    console.log(this.events);
    this.eventsCopy = this.events;
    this.fillSpecialDates();
  }

  fillSpecialDates() {
    for (let i = 0; i < this.events.length; i++) {
      var startDate;
      var endDate;
      var results;
      startDate = moment(this.events[i].eventStartDate).format('YYYY-MM-DD');
      endDate = moment(this.events[i].eventEndDate).format('YYYY-MM-DD');
      console.log(startDate);
      if (moment(startDate).isSame(endDate)) {
        this.dates.push(new Date(startDate));
      }
      else {
        // this.dates.push(new Date(startDate));
        // this.dates.push(new Date(endDate));
        if (startDate != "Invalid date") {
          results = this.getDates(startDate, endDate);
          console.log(results);
          if (results.length) {
            for (let d = 0; d < results.length; d++) {
              this.dates.push(new Date(results[d]));
            }
          }
        }
      }
    }
    this.specialDates = [{
      type: DateRangeType.Specific, dateRange: this.dates
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
      var endDate;
      startDate = moment(val.eventStartDate).format('YYYY-MM-DD');
      endDate = moment(val.eventEndDate).format('YYYY-MM-DD');
      console.log(startDate);
      if (date == startDate || date == endDate) {
        console.log(val);
        return val;
      }
      else if (moment(date).isBetween(startDate, endDate)) {
        return val;
      }
    })
  }

  viewEvent(eventId: any) {
    this.router.navigate(['/home/edit-event'], { queryParams: { eventId: eventId } });
  }

  eventHistory() {
    this.eventListingSrvc.getEventsList(1).subscribe((res: any) => {
      console.log(res);
      this.eventsCopy = this.events = res;
      this.fillSpecialDates();
    }, err => {
      console.log(err);
    })
  }

  reset() {
    this.eventListingSrvc.getEventsList(0).subscribe((res: any) => {
      console.log(res);
      this.eventsCopy = this.events = res;
      this.fillSpecialDates();
    }, err => {
      console.log(err);
    })
  }

  checkIsSame(startDate: any, endDate: any) {
    if (startDate && endDate) {
      let StartDate = moment(startDate).format('YYYY-MM-DD');
      let EndDate = moment(endDate).format('YYYY-MM-DD');
      if (moment(StartDate).isSame(EndDate)) {
        return true;
      } else {
        return false;
      }
    }
    return;
  }

}
