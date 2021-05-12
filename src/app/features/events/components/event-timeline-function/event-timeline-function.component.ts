import {AfterViewInit, Component, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {EventGanttChartComponent} from "../event-gantt-chart/event-gantt-chart.component";
import {EventTimelineService} from "../../services/event-timeline.service";
import {devLogger} from "../../../../shared/utils";
import {Subject, Subscription} from "rxjs";
import {ToastrService} from "ngx-toastr";
import {EventTimelineDataInterface} from "../../models/interfaces";
import {EventTimelineType} from "../../../../shared/models";
import {NgbNavChangeEvent} from "@ng-bootstrap/ng-bootstrap";

@Component({
  selector: 'app-event-timeline-function',
  templateUrl: './event-timeline-function.component.html',
  styleUrls: ['./event-timeline-function.component.scss']
})
export class EventTimelineFunctionComponent implements OnInit, AfterViewInit, OnDestroy {

  @Input() eventId: number | null = 169;
  @ViewChild('servicesGanttChart') servicesGanttChart: EventGanttChartComponent | undefined;
  @ViewChild('exhibitorsGanttChart') exhibitorsGanttChart: EventGanttChartComponent | undefined;
  activeVenueId: number | undefined;
  serviceTimeLineId = 9;
  exhibitorsTimeLineId = 10;
  timeLineData: EventTimelineDataInterface | undefined;
  venues: { venueId: number; venueName: string }[] = [];
  private fetchEventVenueSubs: Subscription | undefined;
  timelineType: EventTimelineType = EventTimelineType.SERVICES;
  timelineRenderSubject = new Subject<HTMLElement>();
  private eventServTLSubs: Subscription | undefined;
  private eventExhTLSubs: Subscription | undefined;
  private tlineRenderTrigrSubs: Subscription | undefined;


  constructor(
    private eventTimelineService: EventTimelineService,
    private toaster: ToastrService
  ) {
  }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    this.tlineRenderTrigrSubs = this.eventTimelineService.render.subscribe(() => {
      this.fetchVenuesData(() => {
        this.fetchServicesTimelineData(() => {
          this.timelineRenderSubject.next(this.servicesGanttChart?.timelineContainer?.nativeElement);
        });
      });
    });
  }

  onNavChange(event: NgbNavChangeEvent<any>): void {
    if (event.nextId === this.serviceTimeLineId) {
      this.timelineType = EventTimelineType.SERVICES;
      this.fetchServicesTimelineData(() => {
        this.timelineRenderSubject.next(this.servicesGanttChart?.timelineContainer?.nativeElement);
      });
    } else if (event.nextId === this.exhibitorsTimeLineId) {
      this.timelineType = EventTimelineType.EXHIBITORS;
      this.fetchExhibitorsTimelineData(() => {
        devLogger('log', {['navigating_exh_gntc']: this.exhibitorsGanttChart});
        this.timelineRenderSubject.next(this.exhibitorsGanttChart?.timelineContainer?.nativeElement);
      });
    }
  }

  fetchVenuesData(callback: () => void): void {
    if (this.fetchEventVenueSubs) {
      this.fetchEventVenueSubs.unsubscribe();
    }
    if (this.eventId) {
      this.fetchEventVenueSubs = this.eventTimelineService.fetchEventVenues(this.eventId)
        .subscribe((value) => {
          this.venues = value;
          this.activeVenueId = value[0].venueId;
          callback.call(this);
        }, (err) => {
          callback.call(this);
          this.toaster.error('Failed to load venue data for timeline', 'Event Timeline');
          devLogger('error', {err});
        });
    } else {
      this.toaster.error('Invalid event id', 'Event Timeline');
    }
  }

  fetchServicesTimelineData(callback: () => void): void {
    this.eventServTLSubs?.unsubscribe();
    this.eventServTLSubs = this.eventTimelineService.fetchServicesTimelineData(this.eventId, this.activeVenueId)
      .subscribe((value) => {
        this.timeLineData = value.data;
        callback.call(this);
      }, (err) => {
        devLogger('error', {err});
        callback.call(this);
        this.toaster.error('Failed to load venue services data for timeline', 'Event Timeline: Services');
      });
  }

  fetchExhibitorsTimelineData(callback: () => void): void {
    this.eventExhTLSubs?.unsubscribe();
    this.eventExhTLSubs = this.eventTimelineService.fetchExhibitorsTimelineData(this.eventId, this.activeVenueId)
      .subscribe((value) => {
        this.timeLineData = value.data;
        callback.call(this);
      }, (err) => {
        callback.call(this);
        devLogger('error', {err});
        this.toaster.error('Failed to load venue exhibitors data for timeline', 'Event Timeline: Exhibitors');
      });
  }

  setVenueId(event: any): void {
    this.activeVenueId = event;
    this.fetchServicesTimelineData(() => {
      this.timelineRenderSubject.next(this.servicesGanttChart?.timelineContainer?.nativeElement);
    });
  }

  ngOnDestroy(): void {
    this.fetchEventVenueSubs?.unsubscribe();
    this.eventServTLSubs?.unsubscribe();
    this.eventExhTLSubs?.unsubscribe();
    this.tlineRenderTrigrSubs?.unsubscribe();
  }
}
