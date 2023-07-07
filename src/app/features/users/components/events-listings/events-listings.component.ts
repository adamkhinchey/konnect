import { Component, Input, OnInit, AfterViewInit, ViewChild, AfterViewChecked, ChangeDetectorRef , OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { IgxCalendarComponent, DateRangeType, DateRangeDescriptor, CalendarView, IgxCalendarView } from 'igniteui-angular';
import * as moment from 'moment'
import { EventslistingService } from '../../services/eventslisting.service';
import { Subscription } from "rxjs";
import { UserSettingsService } from "../../../../shared/services";

@Component({
  selector: 'app-events-listings',
  templateUrl: './events-listings.component.html',
  styleUrls: ['./events-listings.component.scss']
})
export class EventsListingsComponent implements OnInit, AfterViewChecked ,OnDestroy {
  @ViewChild('calendar', { static: true }) calendar: IgxCalendarComponent = new IgxCalendarComponent();
  @Input() events: any;
  eventsCopy: any;
  dates: any = [];
  specialDates: DateRangeDescriptor[] = [];
  isEventHistory: boolean = false;
  noDataMsg: any;
  private userSettingsSub: Subscription | undefined;
  isApproved = false;
  isViewPermission =false;
  constructor(
    private cdRef: ChangeDetectorRef,
    private router: Router,
    private eventListingSrvc: EventslistingService,
    public userSettingsService: UserSettingsService
  ) { }

  getDates(startDate: any, stopDate: any) {
    var dateArray = new Array();
    var currentDate: any = moment(startDate).format('YYYY-MM-DD');
    stopDate = moment(stopDate).format('YYYY-MM-DD');
    while (currentDate <= stopDate) {
      dateArray.push(currentDate)
      currentDate = moment(currentDate).add(1, 'day').format('YYYY-MM-DD');
    }
    return dateArray;
  }

  ngOnInit(): void {
    this.eventsCopy = this.events;
    console.log('this.eventsCopy',this.eventsCopy);
    this.fillSpecialDates();
    if (!this.isEventHistory) {
      this.noDataMsg = "Your associated companies currently have no scheduled events"
    }else{
      this.noDataMsg = "Your event history is empty"
    }

    this.userSettingsSub = this.userSettingsService.settings.subscribe((value:any) => {
      if (value && value.associatedCompanies && value.associatedCompanies.length > 0 && value.defaultCompany && value.isEmailVerified) {
        this.isApproved = true;

      }
      if (value && value.associatedCompanies && value.associatedCompanies.length > 0 && value.defaultCompany){
        this.isViewPermission = true;
      }
    });
  }

  fillSpecialDates() {
    for (let i = 0; i < this.events.length; i++) {
      var startDate;
      var endDate;
      var results;
      startDate = moment(this.events[i].eventStartDate).format('YYYY-MM-DD');
      endDate = moment(this.events[i].eventEndDate).format('YYYY-MM-DD');
      if (moment(startDate).isSame(endDate)) {
        this.dates.push(new Date(startDate));
      }
      else {
        // this.dates.push(new Date(startDate));
        // this.dates.push(new Date(endDate));
        if (startDate != "Invalid date") {
          results = this.getDates(startDate, endDate);
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

  }

  ngAfterViewChecked() {
  }

  createEvent() {
    this.router.navigate(['/home/event/create']);
  }

  changeToTodaysView() {
    let currentDate = new Date();
    this.calendar.changeMonth(currentDate);
    this.eventListingSrvc.getEventsList(0).subscribe((res: any) => {
      this.eventsCopy = this.events = res;
      this.fillSpecialDates();
    }, err => {

    })
  }

  public onSelection(dates: Date | Date[]) {
    let date: any;
    date = moment.utc(dates.toString()).format('YYYY-MM-DD');
    this.eventsCopy = this.events.filter((val: any) => {
      var startDate;
      var endDate;
      startDate = moment(val.eventStartDate).format('YYYY-MM-DD');
      endDate = moment(val.eventEndDate).format('YYYY-MM-DD');
      if (date == startDate || date == endDate) {

        return val;
      }
      else if (moment(date).isBetween(startDate, endDate)) {
        return val;
      }
    })
    if(this.eventsCopy && !this.eventsCopy.length && !this.isEventHistory){
      this.noDataMsg = "Your associated companies have no scheduled events on the selected date"
    }
  }

  viewEvent(eventId: any) {
      this.router.navigate(['/home/edit-event'], { queryParams: { eventId: eventId, isPast: this.isEventHistory,action:9} });
    // this.router.navigate([]).then((result) => {
    //   window.open('/home/edit-event?eventId=' + eventId + `&isPast=${this.isEventHistory}`+`&action=${1}`, '_blank');
    // });
  }
  
  viewEventNewTab(eventId: any) {
    // this.router.navigate(['/home/edit-event'], { queryParams: { eventId: eventId, isPast: this.isEventHistory,action:1} });
  this.router.navigate([]).then((result) => {
    window.open('/home/edit-event?eventId=' + eventId + `&isPast=${this.isEventHistory}`+`&action=${9}`, '_blank');
  });
}

  viewEventManager(eventId: any) {
  //  this.router.navigate(['/home/edit-event'], { queryParams: { eventId: eventId, isPast: this.isEventHistory,action:2} });
  this.router.navigate([]).then((result) => {
      window.open('/home/edit-event?eventId=' + eventId + `&isPast=${this.isEventHistory}`+`&action=${2}`, '_blank');
    });
  }
  viewVanue(eventId: any) {
    // this.router.navigate(['/home/edit-event'], { queryParams: { eventId: eventId, isPast: this.isEventHistory,action:3} });
  this.router.navigate([],{skipLocationChange:true}).then((result) => {
      window.open('/home/edit-event?eventId=' + eventId + `&isPast=${this.isEventHistory}`+`&action=${3}`, '_blank');
    });
  }
  viewEventClient(eventId: any) {
    // this.router.navigate(['/home/edit-event'], { queryParams: { eventId: eventId, isPast: this.isEventHistory,action:1} });
 this.router.navigate([]).then((result) => {
      window.open('/home/edit-event?eventId=' + eventId + `&isPast=${this.isEventHistory}`+`&action=${1}`, '_blank');
    });
  }

  viewSuppliers(eventId: any) {
   // this.router.navigate(['/home/edit-event'], { queryParams: { eventId: eventId, isPast: this.isEventHistory,action:4} });
 this.router.navigate([]).then((result) => {
      window.open('/home/edit-event?eventId=' + eventId + `&isPast=${this.isEventHistory}`+`&action=${4}`, '_blank');
    });
  }

  viewExhibitors(eventId: any) {
    // this.router.navigate(['/home/edit-event'], { queryParams: { eventId: eventId, isPast: this.isEventHistory,action:5} });
 this.router.navigate([]).then((result) => {
      window.open('/home/edit-event?eventId=' + eventId + `&isPast=${this.isEventHistory}`+`&action=${5}`, '_blank');
    });
  }
  viewFiles(eventId: any) {
    //this.router.navigate(['/home/edit-event'], { queryParams: { eventId: eventId, isPast: this.isEventHistory,action:6} });
  this.router.navigate([]).then((result) => {
      window.open('/home/edit-event?eventId=' + eventId + `&isPast=${this.isEventHistory}`+`&action=${6}`, '_blank');
    });
  }
  viewTasks(eventId: any) {
    // this.router.navigate(['/home/edit-event'], { queryParams: { eventId: eventId, isPast: this.isEventHistory,action:8} });
 this.router.navigate([]).then((result) => {
      window.open('/home/edit-event?eventId=' + eventId + `&isPast=${this.isEventHistory}`+`&action=${8}`, '_blank');
    });
  }
  viewTimeline(eventId: any) {
    // this.router.navigate(['/home/edit-event'], { queryParams: { eventId: eventId, isPast: this.isEventHistory,action:7} });
this.router.navigate([]).then((result) => {
      window.open('/home/edit-event?eventId=' + eventId + `&isPast=${this.isEventHistory}`+`&action=${7}`, '_blank');
    });
  }
  viewOverViewTab(eventId: any) {
    // this.router.navigate(['/home/edit-event'], { queryParams: { eventId: eventId, isPast: this.isEventHistory,action:7} });
this.router.navigate([]).then((result) => {
      window.open('/home/edit-event?eventId=' + eventId + `&isPast=${this.isEventHistory}`+`&action=${9}`, '_blank');
    });
  }
  eventHistory() {
    this.isEventHistory = true;
    this.eventListingSrvc.getEventsList(1).subscribe((res: any) => {
      this.eventsCopy = this.events = res;
      this.fillSpecialDates();
      if(!this.eventsCopy.length){
        this.noDataMsg = "Your associated companies have no event history."
      }
    }, err => {

    })
  }

  reset() {
    this.isEventHistory = false;
    // this.eventListingSrvc.getEventsList(0).subscribe((res: any) => {
    //   this.eventsCopy = this.events = res;
    //   this.fillSpecialDates();
    // }, err => {
    //
    // })
    window.location.reload()
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

  ngOnDestroy(): void {
    this.userSettingsSub?.unsubscribe();
  }

}
