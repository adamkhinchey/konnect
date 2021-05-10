import { Component, Input, OnInit, AfterViewInit, ViewChild, AfterViewChecked, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { IgxCalendarComponent, DateRangeType, DateRangeDescriptor } from 'igniteui-angular';

@Component({
  selector: 'app-events-listings',
  templateUrl: './events-listings.component.html',
  styleUrls: ['./events-listings.component.scss']
})
export class EventsListingsComponent implements OnInit, AfterViewChecked {
  @ViewChild('calendar', { static: true }) calendar: IgxCalendarComponent = new IgxCalendarComponent();
  @Input() events: any;
  specialDates: DateRangeDescriptor[] = [];
  constructor(
    private cdRef: ChangeDetectorRef,
    private router: Router
  ) { }

  ngOnInit(): void {
    console.log(this.events);
  }

  ngAfterViewChecked() {
    this.specialDates = [{
      type: DateRangeType.Specific, dateRange: [
        new Date(2021, 5 - 1, 4),
        new Date(2021, 5 - 1, 14),
        new Date(2021, 5 - 1, 15),
        new Date(2021, 8 - 1, 14)
      ]
    }];
    this.cdRef.detectChanges();
    console.log(this.specialDates);
  }

  createEvent() {
    this.router.navigate(['/home/event/create']);
  }


}
