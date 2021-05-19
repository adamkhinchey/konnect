import {ChangeDetectorRef, Component, ElementRef, Inject, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Timeline, TimelineOptions} from 'vis-timeline';
import {DataSet} from 'vis-data';
import {DOCUMENT} from '@angular/common';
import {EventTimelineDataInterface, mockTimeLineData} from "../../models/interfaces";
import {EventTimelineService} from "../../services/event-timeline.service";
import {devLogger} from "../../../../shared/utils";
import {EventTimelineType} from "../../../../shared/models";
import {Subject, Subscription} from "rxjs";
import {v4 as uuidV4} from 'uuid';
import {isEmpty} from "lodash-es";

@Component({
  selector: 'app-event-gantt-chart',
  templateUrl: './event-gantt-chart.component.html',
  styleUrls: ['./event-gantt-chart.component.scss']
})
export class EventGanttChartComponent implements OnInit, OnDestroy {
  @ViewChild('timeline') timelineContainer: ElementRef | undefined;
  @Input() timelineID: any = 'timelineContainer';
  @Input() timelineType: EventTimelineType | undefined;
  @Input() timelineGenTrigger: Subject<{ elem: HTMLElement, data: EventTimelineDataInterface | undefined }> | undefined;
  timelineData: EventTimelineDataInterface | undefined;

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
    this.timelineGenTriggerSubs = this.timelineGenTrigger?.subscribe((value) => {
      if (value.elem) {
        this.render(value.elem, value.data);
      }
    });
  }


  render(nativeElement: HTMLElement, timelineData: EventTimelineDataInterface | undefined): void {

    this.timelineData = timelineData;

    if (this.timeline) {
      this.timeline.destroy();
    }

    devLogger('log', {timelineData: this.timelineData});

    if (this.timelineData && !isEmpty(this.timelineData)) {

      this.groups = new DataSet<any>(this.timelineData.groups.map(group => ({id: group.date})));

      devLogger('log', 'Rendering timeline');

      this.options = {
        width: '100%',
        zoomable: true,
        autoResize: true,
        stack: false,
        start: this.timelineData.startDateTime,
        min: this.timelineData.minimumDateTime,
        end: this.timelineData.maxDateTime,
        max: this.timelineData.maxDateTime,
        margin: {
          item: {
            vertical: 15,
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
      this.timelineData.groups.forEach((groupData) => {
        groupData.data.preTime.forEach(preTimeData => {
          items.push({
            id: `${preTimeData.id}_${uuidV4()}`,
            content: `Pre Event Access:<br/>${preTimeData.content}`,
            start: preTimeData.startDateTime,
            end: preTimeData.endDateTime,
            type: 'background',
            className: 'bumpIn'
          });

          if (this.timelineType === EventTimelineType.SERVICES) {
            preTimeData.services?.forEach((servicesData) => {
              items.push({
                id: `${servicesData.id}_${uuidV4()}`,
                content: 'BI',
                title: `<b>${servicesData.content} Bump In </b><br/>${new Date(servicesData.startDateTime).toDateString()} - ${new Date(servicesData.endDateTime).toDateString()}`,
                start: servicesData.startDateTime,
                end: servicesData.endDateTime,
                group: servicesData.group,
              });
            });
          } else if (this.timelineType === EventTimelineType.EXHIBITORS) {
            preTimeData.exhibitors?.forEach((exhibitorsData) => {
              items.push({
                id: `${exhibitorsData.id}_${uuidV4()}`,
                content: 'BI',
                title: `<b>${exhibitorsData.content} Bump In </b><br/>${new Date(exhibitorsData.startDateTime).toDateString()} - ${new Date(exhibitorsData.endDateTime).toDateString()}`,
                start: exhibitorsData.startDateTime,
                end: exhibitorsData.endDateTime,
                group: exhibitorsData.group,
              });
            });
          }
        });

        groupData.data.eventTime.forEach(eventTimeData => {
          items.push({
            id: `${eventTimeData.id}_${uuidV4()}`,
            content: `Event:<br/>${eventTimeData.content}`,
            start: eventTimeData.startDateTime,
            end: eventTimeData.endDateTime,
            type: 'background',
            className: 'eventTimes'
          });

          if (this.timelineType === EventTimelineType.SERVICES) {
            eventTimeData.services?.forEach((servicesData) => {
              items.push({
                id: `${servicesData.id}_${uuidV4()}`,
                content: servicesData.content,
                title: `<b>${servicesData.content}</b><p>${servicesData.companyName}<br/>
${new Date(servicesData.startDateTime).toDateString()} - ${new Date(servicesData.endDateTime).toDateString()}</p>
<b>${servicesData.primaryContact?.name}</b><p>${servicesData.primaryContact?.mobile}<span class="hyphen"> - </span>${servicesData.primaryContact?.email}</p><small>${servicesData.companyWebSite}</small>`,
                start: servicesData.startDateTime,
                end: servicesData.endDateTime,
                group: servicesData.group,
              });
            });
          } else if (this.timelineType === EventTimelineType.EXHIBITORS) {
            eventTimeData.exhibitors?.forEach((exhibitorsData) => {
              items.push({
                id: `${exhibitorsData.id}_${uuidV4()}`,
                content: exhibitorsData.content,
                title: `<b>${exhibitorsData.content}</b><p>${exhibitorsData.companyName}<br/>
${new Date(exhibitorsData.startDateTime).toDateString()} - ${new Date(exhibitorsData.endDateTime).toDateString()}</p>
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
            id: `${postTimeData.id}_${uuidV4()}`,
            content: `Post Event Access:<br/>${postTimeData.content}`,
            start: postTimeData.startDateTime,
            end: postTimeData.endDateTime,
            type: 'background',
            className: 'bumpOut'
          });

          if (this.timelineType === EventTimelineType.SERVICES) {
            postTimeData.services?.forEach((servicesData) => {
              items.push({
                id: `${servicesData.id}_${uuidV4()}`,
                content: 'BO',
                title: `${servicesData.content} Bump Out ${new Date(servicesData.startDateTime).toDateString()} - ${new Date(servicesData.endDateTime).toDateString()}`,
                start: servicesData.startDateTime,
                end: servicesData.endDateTime,
                group: servicesData.group,
              });
            });
          } else if (this.timelineType === EventTimelineType.EXHIBITORS) {
            postTimeData.exhibitors?.forEach((exhibitorsData) => {
              items.push({
                id: `${exhibitorsData.id}_${uuidV4()}`,
                content: 'BO',
                title: `${exhibitorsData.content} Bump Out ${new Date(exhibitorsData.startDateTime).toDateString()} - ${new Date(exhibitorsData.endDateTime).toDateString()}`,
                start: exhibitorsData.startDateTime,
                end: exhibitorsData.endDateTime,
                group: exhibitorsData.group,
              });
            });
          }
        });
      });

      devLogger('log', {items});

      this.items = new DataSet<any>(items);

      this.timeline = new Timeline(
        nativeElement,
        this.items,
        this.groups,
        this.options
      );

      this.chdRef.detectChanges();
    }
  }

  ngOnDestroy(): void {
    this.timelineGenTriggerSubs?.unsubscribe();
  }

}
