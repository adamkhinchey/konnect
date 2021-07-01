import { ChangeDetectorRef, Component, ElementRef, Inject, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Timeline, TimelineOptions } from 'vis-timeline';
import * as vis from 'vis-timeline';
import { DataSet } from 'vis-data';
import { DOCUMENT } from '@angular/common';
import { EventTimelineDataInterface, mockTimeLineData } from "../../models/interfaces";
import { EventTimelineService } from "../../services/event-timeline.service";
import { devLogger } from "../../../../shared/utils";
import { EventTimelineType } from "../../../../shared/models";
import { Subject, Subscription } from "rxjs";
import { v4 as uuidV4 } from 'uuid';
import { isEmpty } from "lodash-es";
import * as moment from 'moment-timezone';
import { MomentInput } from "moment";

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
  private timeZone = moment.tz.guess();

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

    devLogger('log', { timelineData: this.timelineData });

    if (this.timelineData && !isEmpty(this.timelineData)) {


      this.groups = new DataSet<any>(this.timelineData.groups.map(group => ({ id: group.date })));

      devLogger('log', 'Rendering timeline');
      const that = this;
      this.options = {
        width: '100%',
        zoomable: true,
        autoResize: true,
        stack: false,
        align: 'left',
        start: moment.tz(this.timelineData.startDateTime, this.timeZone).toDate(),
        min: moment.tz(this.timelineData.minimumDateTime, this.timeZone).hours(0).minutes(0).seconds(0).toDate(),
        end: moment.tz(this.timelineData.maxDateTime, this.timeZone).toDate(),
        max: moment.tz(this.timelineData.maxDateTime, this.timeZone).hours(23).minutes(59).seconds(59).toDate(),
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

      const items: vis.DataItemCollectionType = [];
      this.timelineData.groups.forEach((groupData) => {
        groupData.data.preTime.forEach(preTimeData => {
          items.push({
            id: `${preTimeData.id}_${uuidV4()}`,
            content: `Pre Event Access:<br/>${moment.tz(preTimeData.startDateTime, this.timeZone).format('HH:mm')} - ${moment.tz(preTimeData.endDateTime, this.timeZone).format('HH:mm')}`,
            start: moment.tz(preTimeData.startDateTime, this.timeZone).toDate(),
            end: moment.tz(preTimeData.endDateTime, this.timeZone).toDate(),
            type: 'background',
            className: 'bumpIn'
          });

          if (this.timelineType === EventTimelineType.SERVICES) {
            preTimeData.services?.forEach((servicesData) => {
              items.push({
                id: `${servicesData.id}_${uuidV4()}`,
                content: servicesData.content || '',
                title: `<b>${servicesData.content}</b><p>${servicesData.companyName || servicesData.companyName}<br/>
${moment.tz(servicesData.startDateTime, this.timeZone).toDate().toDateString()} -
${moment.tz(servicesData.endDateTime, this.timeZone).toDate().toDateString()}</p>
<b>${servicesData.primaryContact?.name}</b><p>${servicesData.primaryContact?.mobile}<span class="hyphen"> - </span>${servicesData.primaryContact?.email}</p><small>${servicesData.companyWebSite || ''}</small>`,
                start: moment.tz(servicesData.startDateTime, this.timeZone).toDate(),
                end: moment.tz(servicesData.endDateTime, this.timeZone).toDate(),
                group: servicesData.group,
              });
            });
          } else if (this.timelineType === EventTimelineType.EXHIBITORS) {
            preTimeData.exhibitors?.forEach((exhibitorsData) => {
              items.push({
                id: `${exhibitorsData.id}_${uuidV4()}`,
                content: exhibitorsData.content || '',
                title: `<b>${exhibitorsData.content}</b><p>${exhibitorsData.companyName || exhibitorsData.companyName}<br/>
${moment.tz(exhibitorsData.startDateTime, this.timeZone).toDate().toDateString()} -
${moment.tz(exhibitorsData.endDateTime, this.timeZone).toDate().toDateString()}</p>
<b>${exhibitorsData.primaryContact?.name}</b><p>${exhibitorsData.primaryContact?.mobile}<span class="hyphen"> - </span>${exhibitorsData.primaryContact?.email}</p><small>${exhibitorsData.companyWebSite || ''}</small>`,
                start: moment.tz(exhibitorsData.startDateTime, this.timeZone).toDate(),
                end: moment.tz(exhibitorsData.endDateTime, this.timeZone).toDate(),
                group: exhibitorsData.group,
              });
            });
          }
        });

        groupData.data.eventTime.forEach(eventTimeData => {
          items.push({
            id: `${eventTimeData.id}_${uuidV4()}`,
            content: `Event:<br/>${moment.tz(eventTimeData.startDateTime, this.timeZone).format('HH:mm')} - ${moment.tz(eventTimeData.endDateTime, this.timeZone).format('HH:mm')}`,
            start: moment.tz(eventTimeData.startDateTime, this.timeZone).toDate(),
            end: moment.tz(eventTimeData.endDateTime, this.timeZone).toDate(),
            type: 'background',
            className: 'eventTimes'
          });

          if (this.timelineType === EventTimelineType.SERVICES) {
            eventTimeData.services?.forEach((servicesData) => {
              items.push({
                id: `${servicesData.id}_${uuidV4()}`,
                content: servicesData.content || '',
                title: `<b>${servicesData.content}</b><p>${servicesData.companyName || servicesData.companyName}<br/>
${moment.tz(servicesData.startDateTime, this.timeZone).toDate().toDateString()} -
${moment.tz(servicesData.endDateTime, this.timeZone).toDate().toDateString()}</p>
<b>${servicesData.primaryContact?.name}</b><p>${servicesData.primaryContact?.mobile}<span class="hyphen"> - </span>${servicesData.primaryContact?.email}</p><small>${servicesData.companyWebSite || ''}</small>`,
                start: moment.tz(servicesData.startDateTime, this.timeZone).toDate(),
                end: moment.tz(servicesData.endDateTime, this.timeZone).toDate(),
                group: servicesData.group,
              });
            });
          } else if (this.timelineType === EventTimelineType.EXHIBITORS) {
            eventTimeData.exhibitors?.forEach((exhibitorsData) => {
              items.push({
                id: `${exhibitorsData.id}_${uuidV4()}`,
                content: exhibitorsData.content || '',
                title: `<b>${exhibitorsData.content}</b><p>${exhibitorsData.companyName}<br/>
${new Date(exhibitorsData.startDateTime).toDateString()} - ${new Date(exhibitorsData.endDateTime).toDateString()}</p>
<b>${exhibitorsData.primaryContact?.name}</b><p>${exhibitorsData.primaryContact?.mobile}<span class="hyphen"> - </span>${exhibitorsData.primaryContact?.email}</p><small>${exhibitorsData.companyWebSite}</small>`,
                start: moment.tz(exhibitorsData.startDateTime, this.timeZone).toDate(),
                end: moment.tz(exhibitorsData.endDateTime, this.timeZone).toDate(),
                group: exhibitorsData.group,
              });
            });
          }
        });

        groupData.data.postTime.forEach(postTimeData => {
          items.push({
            id: `${postTimeData.id}_${uuidV4()}`,
            content: `Post Event Access:<br/>${moment.tz(postTimeData.startDateTime, this.timeZone).format('HH:mm')} - ${moment.tz(postTimeData.endDateTime, this.timeZone).format('HH:mm')}`,
            start: moment.tz(postTimeData.startDateTime, this.timeZone).toDate(),
            end: moment.tz(postTimeData.endDateTime, this.timeZone).toDate(),
            type: 'background',
            className: 'bumpOut'
          });

          if (this.timelineType === EventTimelineType.SERVICES) {
            postTimeData.services?.forEach((servicesData) => {
              items.push({
                id: `${servicesData.id}_${uuidV4()}`,
                content: servicesData.content || '',
                title: `<b>${servicesData.content}</b><p>${servicesData.companyName || servicesData.companyName}<br/>
${moment.tz(servicesData.startDateTime, this.timeZone).toDate().toDateString()} -
${moment.tz(servicesData.endDateTime, this.timeZone).toDate().toDateString()}</p>
<b>${servicesData.primaryContact?.name}</b><p>${servicesData.primaryContact?.mobile}<span class="hyphen"> - </span>${servicesData.primaryContact?.email}</p><small>${servicesData.companyWebSite || ''}</small>`,
                start: moment.tz(servicesData.startDateTime, this.timeZone).toDate(),
                end: moment.tz(servicesData.endDateTime, this.timeZone).toDate(),
                group: servicesData.group,
              });
            });
          } else if (this.timelineType === EventTimelineType.EXHIBITORS) {
            postTimeData.exhibitors?.forEach((exhibitorsData) => {
              items.push({
                id: `${exhibitorsData.id}_${uuidV4()}`,
                content: exhibitorsData.content || '',
                title: `<b>${exhibitorsData.content}</b><p>${exhibitorsData.companyName || exhibitorsData.companyName}<br/>
${moment.tz(exhibitorsData.startDateTime, this.timeZone).toDate().toDateString()} -
${moment.tz(exhibitorsData.endDateTime, this.timeZone).toDate().toDateString()}</p>
<b>${exhibitorsData.primaryContact?.name}</b><p>${exhibitorsData.primaryContact?.mobile}<span class="hyphen"> - </span>${exhibitorsData.primaryContact?.email}</p><small>${exhibitorsData.companyWebSite || ''}</small>`,
                start: moment.tz(exhibitorsData.startDateTime, this.timeZone).toDate(),
                end: moment.tz(exhibitorsData.endDateTime, this.timeZone).toDate(),
                group: exhibitorsData.group,
              });
            });
          }
        });
      });

      devLogger('log', { items });

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
