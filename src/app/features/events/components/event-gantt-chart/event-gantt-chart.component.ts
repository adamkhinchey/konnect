import {ChangeDetectorRef, Component, ElementRef, Inject, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Timeline, TimelineOptions} from 'vis-timeline';
import {DataSet} from 'vis-data';
import {DOCUMENT} from '@angular/common';
import {EventTimelineDataInterface, mockTimeLineData} from "../../models/interfaces";
import {EventTimelineService} from "../../services/event-timeline.service";
import {devLogger} from "../../../../shared/utils";
import {EventTimelineType} from "../../../../shared/models";
import {Subject, Subscription} from "rxjs";

@Component({
  selector: 'app-event-gantt-chart',
  templateUrl: './event-gantt-chart.component.html',
  styleUrls: ['./event-gantt-chart.component.scss']
})
export class EventGanttChartComponent implements OnInit, OnDestroy {
  @ViewChild('timeline') timelineContainer: ElementRef | undefined;
  @Input() timelineID: any = 'timelineContainer';
  @Input() timelineType: EventTimelineType | undefined;
  @Input() timelineGenTrigger: Subject<HTMLElement> | undefined;
  @Input() timelineData: EventTimelineDataInterface | undefined;

  private pageDocument;
  timeline: Timeline | undefined;
  groups: DataSet<any> | undefined;
  items: DataSet<any> | undefined;
  options: TimelineOptions | undefined;
  private timelineGenTriggerSubs: Subscription | undefined;

  constructor(@Inject(DOCUMENT) document: Document,
              private eventTimelineService: EventTimelineService,
              private chdRef: ChangeDetectorRef) {
    this.pageDocument = document;
  }


  ngOnInit(): void {
    this.timelineGenTriggerSubs = this.timelineGenTrigger?.subscribe((element) => {
      if (element) {
        this.render(element);
      }
    });
  }


  render(nativeElement: HTMLElement): void {


    if (this.timeline) {
      this.timeline.destroy();
    }

    this.groups = new DataSet<any>(mockTimeLineData.groups.map(group => ({id: group.date})));

    devLogger('log', 'Rendering timeline');

    this.options = {
      width: '2000vw',
      zoomable: true,
      autoResize: true,
      stack: false,
      align: 'left',
      start: mockTimeLineData.startDateTime,
      min: mockTimeLineData.minimumDateTime,
      max: mockTimeLineData.maxDateTime,
      margin: {
        item: {
          vertical: 35,
          horizontal: 15
        },
        axis: 260,
      },
      timeAxis: {
        scale: 'hour',
        step: 1
      },
      orientation: {
        axis: 'both',
        item: 'top'
      },
      format: {
        minorLabels: {
          hour: 'HH',
        }
      },
    };

    const items: any[] = [];
    mockTimeLineData.groups.forEach((groupData) => {
      groupData.data.preTime.forEach(preTimeData => {
        items.push({
          id: preTimeData.id,
          content: preTimeData.content,
          start: preTimeData.startDateTime,
          end: preTimeData.endDateTime,
          type: 'background',
          className: 'bumpIn'
        });

        if (this.timelineType === EventTimelineType.SERVICES) {
          preTimeData.services?.forEach((servicesData) => {
            items.push({
              id: servicesData.id,
              content: 'BI',
              title: `<b>${servicesData.content} Bump In </b><br/>${servicesData.startDateTime.toDateString()} - ${servicesData.endDateTime.toDateString()}`,
              start: servicesData.startDateTime,
              end: servicesData.endDateTime,
              group: servicesData.group,
            });
          });
        } else if (this.timelineType === EventTimelineType.EXHIBITORS) {
          preTimeData.exhibitors?.forEach((exhibitorsData) => {
            items.push({
              id: exhibitorsData.id,
              content: 'BI',
              title: `<b>${exhibitorsData.content} Bump In </b><br/>${exhibitorsData.startDateTime.toDateString()} - ${exhibitorsData.endDateTime.toDateString()}`,
              start: exhibitorsData.startDateTime,
              end: exhibitorsData.endDateTime,
              group: exhibitorsData.group,
            });
          });
        }
      });

      groupData.data.eventTime.forEach(eventTimeData => {
        items.push({
          id: eventTimeData.id,
          content: eventTimeData.content,
          start: eventTimeData.startDateTime,
          end: eventTimeData.endDateTime,
          type: 'background',
          className: 'eventTimes'
        });

        if (this.timelineType === EventTimelineType.SERVICES) {
          eventTimeData.services?.forEach((servicesData) => {
            items.push({
              id: servicesData.id,
              content: servicesData.content,
              title: `<b>${servicesData.content}</b><p>${servicesData.companyName}<br/>
${servicesData.startDateTime.toDateString()} - ${servicesData.endDateTime.toDateString()}</p>
<b>${servicesData.primaryContact?.name}</b><p>${servicesData.primaryContact?.mobile}<span class="hyphen"> - </span>${servicesData.primaryContact?.email}</p><small>${servicesData.companyWebSite}</small>`,
              start: servicesData.startDateTime,
              end: servicesData.endDateTime,
              group: servicesData.group,
            });
          });
        } else if (this.timelineType === EventTimelineType.EXHIBITORS) {
          eventTimeData.exhibitors?.forEach((exhibitorsData) => {
            items.push({
              id: exhibitorsData.id,
              content: exhibitorsData.content,
              title: `<b>${exhibitorsData.content}</b><p>${exhibitorsData.companyName}<br/>
${exhibitorsData.startDateTime.toDateString()} - ${exhibitorsData.endDateTime.toDateString()}</p>
<b>${exhibitorsData.primaryContact?.name}</b><p>${exhibitorsData.primaryContact?.mobile}<span class="hyphen"> - </span>${exhibitorsData.primaryContact?.email}</p><small>${exhibitorsData.companyWebSite}</small>`,
              start: exhibitorsData.startDateTime,
              end: exhibitorsData.endDateTime,
              group: exhibitorsData.group,
            });
          });
        }
      });

      groupData.data.postTime.forEach(postTimeData => {
        items.push({
          id: postTimeData.id,
          content: postTimeData.content,
          start: postTimeData.startDateTime,
          end: postTimeData.endDateTime,
          type: 'background',
          className: 'bumpOut'
        });

        if (this.timelineType === EventTimelineType.SERVICES) {
          postTimeData.services?.forEach((servicesData) => {
            items.push({
              id: servicesData.id,
              content: 'BO',
              title: `${servicesData.content} Bump Out ${servicesData.startDateTime.toDateString()} - ${servicesData.endDateTime.toDateString()}`,
              start: servicesData.startDateTime,
              end: servicesData.endDateTime,
              group: servicesData.group,
            });
          });
        } else if (this.timelineType === EventTimelineType.EXHIBITORS) {
          postTimeData.exhibitors?.forEach((exhibitorsData) => {
            items.push({
              id: exhibitorsData.id,
              content: 'BO',
              title: `${exhibitorsData.content} Bump Out ${exhibitorsData.startDateTime.toDateString()} - ${exhibitorsData.endDateTime.toDateString()}`,
              start: exhibitorsData.startDateTime,
              end: exhibitorsData.endDateTime,
              group: exhibitorsData.group,
            });
          });
        }
      });
    });

    this.items = new DataSet<any>(items);

    this.timeline = new Timeline(
      nativeElement,
      this.items,
      this.groups,
      this.options
    );

    this.chdRef.detectChanges();
  }

  ngOnDestroy(): void {
    this.timelineGenTriggerSubs?.unsubscribe();
  }

}
