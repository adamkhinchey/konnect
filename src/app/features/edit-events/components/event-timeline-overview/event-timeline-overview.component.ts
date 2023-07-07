import {
  AfterViewInit,
  Component,
  Input,
  OnDestroy,
  OnInit,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { EventGanttChartComponent } from '../event-gantt-chart/event-gantt-chart.component';
import { EventTimelineService } from '../../services/event-timeline.service';
import { devLogger } from '../../../../shared/utils';
import { Subject, Subscription } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { EventTimelineDataInterface } from '../../models/interfaces';
import { EventTimelineType } from '../../../../shared/models';
import { NgbNavChangeEvent } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-event-timeline-overview',
  templateUrl: './event-timeline-overview.component.html',
  styleUrls: ['./event-timeline-overview.component.scss'],
})
export class EventTimelineOverviewComponent
  implements OnInit, AfterViewInit, OnDestroy
{
  @Input() eventId: number | null = null;
  @Input() permissionObj: any;
  @ViewChild('servicesGanttChart') servicesGanttChart:
    | EventGanttChartComponent
    | undefined;
  @ViewChild('exhibitorsGanttChart') exhibitorsGanttChart:
    | EventGanttChartComponent
    | undefined;
  activeVenueId: number | undefined;
  serviceTimeLineId = 9;
  exhibitorsTimeLineId = 10;
  timelineData: EventTimelineDataInterface | undefined;
  venues: { venueId: number; venueName: string }[] = [];
  private fetchEventVenueSubs: Subscription | undefined;
  timelineType: EventTimelineType = EventTimelineType.SERVICES;
  timelineRenderSubject = new Subject<{
    elem: HTMLElement;
    data: EventTimelineDataInterface | undefined;
  }>();
  private eventServTLSubs: Subscription | undefined;
  private eventExhTLSubs: Subscription | undefined;
  private tlineRenderTrigrSubs: Subscription | undefined;
  hasVenues = true;

  constructor(
    private eventTimelineService: EventTimelineService,
    private toaster: ToastrService
  ) {}

  ngOnInit(): void {
 
  }

  ngAfterViewInit(): void {
    this.fetchVenuesData(() => {
      this.fetchServicesTimelineData(
        (data: EventTimelineDataInterface | undefined) => {
          this.timelineRenderSubject.next({
            elem: this.servicesGanttChart?.timelineContainer?.nativeElement,
            data,
          });
        }
      );
    });
    this.tlineRenderTrigrSubs = this.eventTimelineService.render.subscribe(
      () => {
      
      }
    );
  }

  onNavChange(event: NgbNavChangeEvent<any>): void {
    if (event.nextId === this.serviceTimeLineId) {
      this.timelineType = EventTimelineType.SERVICES;
      this.fetchServicesTimelineData((data) => {
        this.timelineRenderSubject.next({
          elem: this.servicesGanttChart?.timelineContainer?.nativeElement,
          data,
        });
      });
    } else if (event.nextId === this.exhibitorsTimeLineId) {
      this.timelineType = EventTimelineType.EXHIBITORS;
      this.fetchExhibitorsTimelineData((data) => {
        this.timelineRenderSubject.next({
          elem: this.exhibitorsGanttChart?.timelineContainer?.nativeElement,
          data,
        });
      });
    }
  }

  fetchVenuesData(callback: () => void): void {
   
    if (this.fetchEventVenueSubs) {
      this.fetchEventVenueSubs.unsubscribe();
    }
    if (this.eventId) {
      this.fetchEventVenueSubs = this.eventTimelineService
        .fetchEventVenues(this.eventId)
        .subscribe(
          (value) => {
            this.venues = value;
            this.timelineType = EventTimelineType.SERVICES;
            if (Array.isArray(this.venues) && this.venues.length > 0) {
              this.activeVenueId = value[0].venueId;
              callback.call(this);
            } else {
              this.hasVenues = false;
            }
          },
          (err) => {
            this.toaster.error(
              'Failed to load venue data for timeline',
              'Event Timeline'
            );
            devLogger('error', { err });
          }
        );
    } else {
      this.toaster.error('Invalid event id', 'Event Timeline');
    }
  }

  fetchServicesTimelineData(
    callback: (data: EventTimelineDataInterface | undefined) => void
  ): void {
    this.eventServTLSubs?.unsubscribe();
    this.eventServTLSubs = this.eventTimelineService
      .fetchServicesTimelineData(this.eventId, this.activeVenueId)
      .subscribe(
        (value) => {
          this.timelineData = value.data;
          devLogger('log', { timelineData: this.timelineData });
          callback.call(this, this.timelineData);
        },
        (err) => {
          devLogger('error', { err });
          this.toaster.error(
            'Failed to load venue services data for timeline',
            'Event Timeline: Services'
          );
        }
      );
  }

  fetchExhibitorsTimelineData(
    callback: (data: EventTimelineDataInterface | undefined) => void
  ): void {
    this.eventExhTLSubs?.unsubscribe();
    this.eventExhTLSubs = this.eventTimelineService
      .fetchExhibitorsTimelineData(this.eventId, this.activeVenueId)
      .subscribe(
        (value) => {
          this.timelineData = value.data;
          callback.call(this, this.timelineData);
        },
        (err) => {
          devLogger('error', { err });
          this.toaster.error(
            'Failed to load venue exhibitors data for timeline',
            'Event Timeline: Exhibitors'
          );
        }
      );
  }

  setVenueId(event: any): void {
    this.timelineType = EventTimelineType.SERVICES;
    this.activeVenueId = event;
    this.fetchServicesTimelineData((data) => {
      this.timelineRenderSubject.next({
        elem: this.servicesGanttChart?.timelineContainer?.nativeElement,
        data,
      });
    });
  }

  ngOnDestroy(): void {
    this.fetchEventVenueSubs?.unsubscribe();
    this.eventServTLSubs?.unsubscribe();
    this.eventExhTLSubs?.unsubscribe();
    this.tlineRenderTrigrSubs?.unsubscribe();
  }
}
