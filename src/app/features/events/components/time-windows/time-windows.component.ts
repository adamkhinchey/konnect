import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, QueryList, ViewChildren } from '@angular/core';
import { TimeWindowFormatInterface, VenueTimeChangedSubjectInterface } from '../../models/interfaces';
import { ToastrService } from 'ngx-toastr';
import * as moment from 'moment';
import { DateTimePickerComponent } from '../date-time-picker/date-time-picker.component';
import { EventService } from '../../services/event.service';
import { EventTimeSlotTypes, EventTimeWindowTypes } from '../../models/types';
import { Subscription } from 'rxjs';
import { cloneDeep } from 'lodash-es';
import { devLogger } from "../../../../shared/utils";
import { AngularEditorConfig } from '@kolkov/angular-editor';

@Component({
  selector: 'app-time-windows',
  templateUrl: './time-windows.component.html',
  styleUrls: ['./time-windows.component.scss']
})
export class TimeWindowsComponent implements OnInit, OnDestroy {

  @ViewChildren('preEventStartDateTimes') preEventStartDateTimes: QueryList<DateTimePickerComponent> | undefined;
  @ViewChildren('preEventEndDateTimes') preEventEndDateTimes: QueryList<DateTimePickerComponent> | undefined;
  @ViewChildren('eventStartDateTimes') eventStartDateTimes: QueryList<DateTimePickerComponent> | undefined;
  @ViewChildren('eventEndDateTimes') eventEndDateTimes: QueryList<DateTimePickerComponent> | undefined;
  @ViewChildren('postEventStartDateTimes') postEventStartDateTimes: QueryList<DateTimePickerComponent> | undefined;
  @ViewChildren('postEventEndDateTimes') postEventEndDateTimes: QueryList<DateTimePickerComponent> | undefined;

  @Input() isVenueDependent = false;
  @Input() windowLabels: string[] | undefined;

  Arr = Array;
  @Input() useVenueTimes = false;
  @Input() eventView = false;
  @Input() preEventTimesCount = 1;
  @Input() preEventNotes = '';
  @Input() preEventTimes: Partial<TimeWindowFormatInterface>[] = [];
  @Input() eventTimesCount = 1;
  @Input() eventNotes = '';
  @Input() eventTimes: Partial<TimeWindowFormatInterface>[] = [];
  @Input() postEventTimesCount = 1;
  @Input() postEventNotes = '';
  @Input() postEventTimes: Partial<TimeWindowFormatInterface>[] = [];
  /*
  ** venueIndex in case of venues tab
  ** service index in case of suppliers tab
  ** exhibitorIndex in case of exhibitors tab
  ** venueIndex in case of exhibitors tab but for all exhibitors time windows
   */
  @Input() index: number | undefined;
  @Input() timeWindowFor: EventTimeWindowTypes | undefined;

  /*
  ** below  four @Input() bound properties are
  ** used to hold reference to venue time windows
  * and venue index in added venues
  ** only in suppliers and exhibitors
   */
  @Input() venuePreEventTimes: Partial<TimeWindowFormatInterface>[] | undefined;
  @Input() venueEventTimes: Partial<TimeWindowFormatInterface>[] | undefined;
  @Input() venuePostEventTimes: Partial<TimeWindowFormatInterface>[] | undefined;
  @Input() venueIndex: number | undefined;

  @Input() exhibitorForAllPreEventTimes: Partial<TimeWindowFormatInterface>[] | undefined;
  @Input() exhibitorForAllEventTimes: Partial<TimeWindowFormatInterface>[] | undefined;
  @Input() exhibitorForAllPostEventTimes: Partial<TimeWindowFormatInterface>[] | undefined;

  @Output() test = new EventEmitter();
  eventTimeSlotTypes = EventTimeSlotTypes;

  private venuePreEventTimeChangeSub: Subscription | undefined;
  private exhibitionPreEventTimeChangeSub: Subscription | undefined;
  @Input() isPreEventTimesSameAsVenue = false;
  @Input() isPreEventTimesSameAsExhibition = false;

  private venueEventTimeChangeSub: Subscription | undefined;
  private exhibitionEventTimeChangeSub: Subscription | undefined;
  @Input() isEventTimesSameAsVenue = false;
  @Input() isEventTimesSameAsExhibition = false;

  private venuePostEventTimeChangeSub: Subscription | undefined;
  private exhibitionPostEventTimeChangeSub: Subscription | undefined;
  @Input() isPostEventTimesSameAsVenue = false;
  @Input() isPostEventTimesSameAsExhibition = false;
  private timeZone = moment.tz.guess();
  config: AngularEditorConfig = {
    editable: true,
    showToolbar:false,
    spellcheck: true,
    // height: '15rem',
    minHeight: '5rem',
    placeholder: 'Enter text here...',
    translate: 'no',
    defaultParagraphSeparator: 'p',
    defaultFontName: 'Arial',
    sanitize: false,
    defaultFontSize:'2',
    toolbarHiddenButtons: [
      [
        // 'undo',
        // 'redo',
        // 'fontSize',
        // 'textColor',
        // 'backgroundColor',
        // 'bold',
        // 'italic',
        // 'underline',
        // 'strikeThrough',
        'subscript',
        'superscript',
        // 'justifyLeft',
        // 'justifyCenter',
        // 'justifyRight',
        'justifyFull',
        // 'indent',
        // 'outdent',
        // 'insertUnorderedList',
        // 'insertOrderedList',
        'heading',
        'fontName'
      ],
      [
        'customClasses',
        'link',
        'unlink',
        'insertImage',
        'insertVideo',
        'insertHorizontalRule',
        'removeFormat',
        'toggleEditorMode'
      ]
    ],
    customClasses: [
      {
        name: 'quote',
        class: 'quote',
      },
      {
        name: 'redText',
        class: 'redText',
      },
      {
        name: 'titleText',
        class: 'titleText',
        tag: 'h1',
      },
    ],
  };
  constructor(private toaster: ToastrService, private eventService: EventService) {
  }

  ngOnInit(): void {
  }

  // removePreTime(i: any) {
  //   this.preEventTimes.splice(i, 1);
  //   this.preEventTimesCount--;
  //   // if (typeof this.index === 'number' && this.timeWindowFor === EventTimeWindowTypes.Venue) {
  //   //   this.eventService.venuePreEventTimeChange.next({
  //   //     venueIndex: this.index,
  //   //     data: (cloneDeep(this.preEventTimes) as TimeWindowFormatInterface[])
  //   //   });
  //   // }
  //   // if (typeof this.index === 'number' && this.timeWindowFor === EventTimeWindowTypes.ALL_EXHIBITORS) {
  //   //   this.eventService.exhibitionPreEventTimeChange.next({
  //   //     venueIndex: this.index,
  //   //     data: (cloneDeep(this.preEventTimes) as TimeWindowFormatInterface[])
  //   //   });
  //   // }
  // }

  // removeEventTime(i: any) {
  //   this.eventTimes.splice(i, 1);
  //   this.eventTimesCount--;
  //   // if (typeof this.index === 'number' && this.timeWindowFor === EventTimeWindowTypes.Venue) {
  //   //   this.eventService.venueEventTimeChange.next({
  //   //     venueIndex: this.index,
  //   //     data: (cloneDeep(this.eventTimes) as TimeWindowFormatInterface[])
  //   //   });
  //   // }
  //   // if (typeof this.index === 'number' && this.timeWindowFor === EventTimeWindowTypes.ALL_EXHIBITORS) {
  //   //   this.eventService.exhibitionEventTimeChange.next({
  //   //     venueIndex: this.index,
  //   //     data: (cloneDeep(this.eventTimes) as TimeWindowFormatInterface[])
  //   //   });
  //   // }
  // }

  // removePostTime(i: any) {
  //   this.postEventTimes.splice(i, 1);
  //   this.postEventTimesCount--;
  //   // if (typeof this.index === 'number' && this.timeWindowFor === EventTimeWindowTypes.Venue) {
  //   //   this.eventService.venuePostEventTimeChange.next({
  //   //     venueIndex: this.index,
  //   //     data: (cloneDeep(this.postEventTimes) as TimeWindowFormatInterface[])
  //   //   });
  //   // }
  //   // if (typeof this.index === 'number' && this.timeWindowFor === EventTimeWindowTypes.ALL_EXHIBITORS) {
  //   //   this.eventService.exhibitionPostEventTimeChange.next({
  //   //     venueIndex: this.index,
  //   //     data: (cloneDeep(this.postEventTimes) as TimeWindowFormatInterface[])
  //   //   });
  //   // }
  // }

  getMinimumPreEventStartDateTime(i: number): Date {
    // if (this.eventView && this.preEventTimes && this.preEventTimes.length){
    //   return moment(this.preEventTimes[i].startDateTime).toDate();
    // }
    return moment().set('second', 0).set('millisecond', 0).toDate();
  }

  getMinimumPreEventEndDateTime(i: number): Date {
    return this.preEventTimes[i]?.startDateTime || moment().set('second', 0).set('millisecond', 0).toDate();
  }

  pushPreEventStartDateTime(event: Date, i: number): void {
    if (this.preEventTimes.length === 0) {
      this.preEventTimes.push({ startDateTime: event, notes: this.preEventNotes });
      this.preEventEndDateTimes?.get(0)?.owlDateTime?.confirmSelectedChange.next(
        this.preEventTimes[0].startDateTime
      );
      // don't consider 0 (zero) as falsy
      if (typeof this.index === 'number' && this.timeWindowFor === EventTimeWindowTypes.Venue) {
        this.eventService.venuePreEventTimeChange.next({
          venueIndex: this.index,
          data: (cloneDeep(this.preEventTimes) as TimeWindowFormatInterface[])
        });
      }
      if (typeof this.index === 'number' && this.timeWindowFor === EventTimeWindowTypes.ALL_EXHIBITORS) {
        this.eventService.exhibitionPreEventTimeChange.next({
          venueIndex: this.index,
          data: (cloneDeep(this.preEventTimes) as TimeWindowFormatInterface[])
        });
      }
      // early return;
      return;
    }
    this.preEventTimes[i] = {
      ...this.preEventTimes[i],
      startDateTime: event,
      notes: this.preEventNotes
    };

    // if (moment(this.preEventTimes[i].startDateTime).isAfter(this.preEventTimes[i].endDateTime) ||
    //   !this.preEventTimes[i].endDateTime) {
    this.preEventEndDateTimes?.get(i)?.owlDateTime?.confirmSelectedChange.next(
      this.preEventTimes[i].startDateTime
    );
    // }

    if (typeof this.index === 'number' && this.timeWindowFor === EventTimeWindowTypes.Venue) {
      this.eventService.venuePreEventTimeChange.next({
        venueIndex: this.index,
        data: (cloneDeep(this.preEventTimes) as TimeWindowFormatInterface[])
      });
    }
    if (typeof this.index === 'number' && this.timeWindowFor === EventTimeWindowTypes.ALL_EXHIBITORS) {
      this.eventService.exhibitionPreEventTimeChange.next({
        venueIndex: this.index,
        data: (cloneDeep(this.preEventTimes) as TimeWindowFormatInterface[])
      });
    }
  }

  pushPreEventEndDateTime(event: Date, i: number): void {
    if (this.preEventTimes.length === 0) {
      this.preEventTimes.push({ endDateTime: event, notes: this.preEventNotes });

      if (typeof this.index === 'number' && this.timeWindowFor === EventTimeWindowTypes.Venue) {
        this.eventService.venuePreEventTimeChange.next({
          venueIndex: this.index,
          data: (cloneDeep(this.preEventTimes) as TimeWindowFormatInterface[])
        });
      }
      if (typeof this.index === 'number' && this.timeWindowFor === EventTimeWindowTypes.ALL_EXHIBITORS) {
        this.eventService.exhibitionPreEventTimeChange.next({
          venueIndex: this.index,
          data: (cloneDeep(this.preEventTimes) as TimeWindowFormatInterface[])
        });
      }
      // early return
      return;
    }
    this.preEventTimes[i] = {
      ...this.preEventTimes[i],
      endDateTime: event,
      notes: this.preEventNotes
    };

    if (typeof this.index === 'number' && this.timeWindowFor === EventTimeWindowTypes.Venue) {
      this.eventService.venuePreEventTimeChange.next({
        venueIndex: this.index,
        data: (cloneDeep(this.preEventTimes) as TimeWindowFormatInterface[])
      });
    }
    if (typeof this.index === 'number' && this.timeWindowFor === EventTimeWindowTypes.ALL_EXHIBITORS) {
      this.eventService.exhibitionPreEventTimeChange.next({
        venueIndex: this.index,
        data: (cloneDeep(this.preEventTimes) as TimeWindowFormatInterface[])
      });
    }
  }

  addMorePreEventDateTime(): void {
    const len = this.preEventTimes.length;
    const timeSlot = this.preEventTimes[len - 1];
    if (!timeSlot) {
      this.toaster.error('Please select start and end date-time for current', 'Pre-event Access');
      return;
    }
    if (!timeSlot.startDateTime) {
      this.toaster.error('Please select start date and time for current', 'Pre-event Access');
      return;
    }
    if (!timeSlot.endDateTime) {
      this.toaster.error('Please select end date and time for current', 'Pre-event Access');
      return;
    }
    this.preEventTimesCount++;
    this.preEventTimes.push({});
    this.test.emit();
  }

  populatePreEventNotes($event: any): void {
    this.preEventTimes.forEach(obj => {
      // @ts-ignore
      obj.notes = this.preEventNotes;
    });
  }


  getMinimumEventStartDateTime(i: number): Date {
    return moment().set('seconds', 0).set('millisecond', 0).toDate();
  }

  getMinimumEventEndDateTime(i: number): Date {
    return this.eventTimes[i]?.startDateTime || moment().set('seconds', 0).set('milliseconds', 0).toDate();
  }

  pushEventStartDateTime(event: Date, i: number): void {
    if (this.eventTimes.length === 0) {
      this.eventTimes.push({ startDateTime: event, notes: this.eventNotes });
      this.eventEndDateTimes?.get(0)?.owlDateTime?.confirmSelectedChange.next(
        this.eventTimes[0].startDateTime
      );
      if (typeof this.index === 'number' && this.timeWindowFor === EventTimeWindowTypes.Venue) {
        this.eventService.venueEventTimeChange.next({
          venueIndex: this.index,
          data: (cloneDeep(this.eventTimes) as TimeWindowFormatInterface[])
        });
      }
      if (typeof this.index === 'number' && this.timeWindowFor === EventTimeWindowTypes.ALL_EXHIBITORS) {
        this.eventService.exhibitionEventTimeChange.next({
          venueIndex: this.index,
          data: (cloneDeep(this.eventTimes) as TimeWindowFormatInterface[])
        });
      }
      return;
    }
    this.eventTimes[i] = {
      ...this.eventTimes[i],
      startDateTime: event,
      notes: this.eventNotes
    };

    // if (moment(this.eventTimes[i].startDateTime).isAfter(this.eventTimes[i].endDateTime) ||
    //   !this.eventTimes[i].endDateTime) {
    this.eventEndDateTimes?.get(i)?.owlDateTime?.confirmSelectedChange.next(
      this.eventTimes[i].startDateTime
    );
    // }

    if (typeof this.index === 'number' && this.timeWindowFor === EventTimeWindowTypes.Venue) {
      this.eventService.venueEventTimeChange.next({
        venueIndex: this.index,
        data: (cloneDeep(this.eventTimes) as TimeWindowFormatInterface[])
      });
    }
    if (typeof this.index === 'number' && this.timeWindowFor === EventTimeWindowTypes.ALL_EXHIBITORS) {
      this.eventService.exhibitionEventTimeChange.next({
        venueIndex: this.index,
        data: (cloneDeep(this.eventTimes) as TimeWindowFormatInterface[])
      });
    }
  }

  pushEventEndDateTime(event: Date, i: number): void {
    if (this.eventTimes.length === 0) {
      this.eventTimes.push({ endDateTime: event, notes: this.eventNotes });
      return;
    }
    this.eventTimes[i] = {
      ...this.eventTimes[i],
      endDateTime: event,
      notes: this.eventNotes
    };

    if (typeof this.index === 'number' && this.timeWindowFor === EventTimeWindowTypes.Venue) {
      this.eventService.venueEventTimeChange.next({
        venueIndex: this.index,
        data: (cloneDeep(this.eventTimes) as TimeWindowFormatInterface[])
      });
    }
    if (typeof this.index === 'number' && this.timeWindowFor === EventTimeWindowTypes.ALL_EXHIBITORS) {
      this.eventService.exhibitionEventTimeChange.next({
        venueIndex: this.index,
        data: (cloneDeep(this.eventTimes) as TimeWindowFormatInterface[])
      });
    }
  }

  addMoreEventDateTime(): void {
    const len = this.eventTimes.length;
    const timeSlot = this.eventTimes[len - 1];
    if (!timeSlot) {
      this.toaster.error('Please select start and end date-time for current', 'Event Access');
      return;
    }
    if (!timeSlot.startDateTime) {
      this.toaster.error('Please select start date and time for current', 'Event Access');
      return;
    }
    if (!timeSlot.endDateTime) {
      this.toaster.error('Please select end date and time for current', 'Event Access');
      return;
    }
    this.eventTimesCount++;
    this.eventTimes.push({});
    this.test.emit();
  }

  populateEventNotes($event: any): void {
    this.eventTimes.forEach(obj => {
      // @ts-ignore
      obj.notes = this.eventNotes;
    });
  }


  getMinimumPostEventStartDateTime(i: number): Date {
    return moment().set('seconds', 0).set('milliseconds', 0).toDate();
  }

  getMinimumPostEventEndDateTime(i: number): Date {
    return this.postEventTimes[i]?.startDateTime || moment().set('seconds', 0).set('milliseconds', 0).toDate();
  }

  pushPostEventStartDateTime(event: Date, i: number): void {
    if (this.postEventTimes.length === 0) {
      this.postEventTimes.push({ startDateTime: event, notes: this.postEventNotes });
      this.postEventEndDateTimes?.get(0)?.owlDateTime?.confirmSelectedChange.next(
        this.postEventTimes[0].startDateTime
      );
      if (typeof this.index === 'number' && this.timeWindowFor === EventTimeWindowTypes.Venue) {
        this.eventService.venuePostEventTimeChange.next({
          venueIndex: this.index,
          data: (cloneDeep(this.postEventTimes) as TimeWindowFormatInterface[])
        });
      }
      if (typeof this.index === 'number' && this.timeWindowFor === EventTimeWindowTypes.ALL_EXHIBITORS) {
        this.eventService.exhibitionPostEventTimeChange.next({
          venueIndex: this.index,
          data: (cloneDeep(this.postEventTimes) as TimeWindowFormatInterface[])
        });
      }
      return;
    }
    this.postEventTimes[i] = {
      ...this.postEventTimes[i],
      startDateTime: event,
      notes: this.postEventNotes
    };

    // if (moment(this.postEventTimes[i].startDateTime).isAfter(this.postEventTimes[i].endDateTime) ||
    //   !this.postEventTimes[i].endDateTime) {
    this.postEventEndDateTimes?.get(i)?.owlDateTime?.confirmSelectedChange.next(
      this.postEventTimes[i].startDateTime
    );
    // }

    if (typeof this.index === 'number' && this.timeWindowFor === EventTimeWindowTypes.Venue) {
      this.eventService.venuePostEventTimeChange.next({
        venueIndex: this.index,
        data: (cloneDeep(this.postEventTimes) as TimeWindowFormatInterface[])
      });
    }
    if (typeof this.index === 'number' && this.timeWindowFor === EventTimeWindowTypes.ALL_EXHIBITORS) {
      this.eventService.exhibitionPostEventTimeChange.next({
        venueIndex: this.index,
        data: (cloneDeep(this.postEventTimes) as TimeWindowFormatInterface[])
      });
    }
  }

  pushPostEventEndDateTime(event: Date, i: number): void {
    if (this.postEventTimes.length === 0) {
      this.postEventTimes.push({ endDateTime: event, notes: this.postEventNotes });
      return;
    }
    this.postEventTimes[i] = {
      ...this.postEventTimes[i],
      endDateTime: event,
      notes: this.postEventNotes
    };
    if (typeof this.index === 'number' && this.timeWindowFor === EventTimeWindowTypes.Venue) {
      this.eventService.venuePostEventTimeChange.next({
        venueIndex: this.index,
        data: (cloneDeep(this.postEventTimes) as TimeWindowFormatInterface[])
      });
    }
    if (typeof this.index === 'number' && this.timeWindowFor === EventTimeWindowTypes.ALL_EXHIBITORS) {
      this.eventService.exhibitionPostEventTimeChange.next({
        venueIndex: this.index,
        data: (cloneDeep(this.postEventTimes) as TimeWindowFormatInterface[])
      });
    }
  }

  addMorePostEventDateTime(): void {
    const len = this.postEventTimes.length;
    const timeSlot = this.postEventTimes[len - 1];

    if (!timeSlot) {
      this.toaster.error('Please select start and end date-time for current', 'Post-Event Access');
      return;
    }

    if (!timeSlot.startDateTime) {
      this.toaster.error('Please select start date and time for current 1', 'Post-event Access');
      return;
    }
    if (!timeSlot.endDateTime) {
      this.toaster.error('Please select end date and time for current', 'Post-event Access');
      return;
    }
    this.postEventTimesCount++;
    this.postEventTimes.push({});
    this.test.emit();
  }

  populatePostEventNotes($event: any): void {
    this.postEventTimes.forEach(obj => {
      // @ts-ignore
      obj.notes = this.postEventNotes;
    });
  }

  listenVenueEventTimeChange(event: Event, slotsType: EventTimeSlotTypes, forAllExhibitors = false): void {
    const target = (event.target as HTMLInputElement);
    const { checked } = target;
    if (checked) {
      if (slotsType === EventTimeSlotTypes.PRE_EVENT_ACCESS) {
        this.copyAssignVenueTime(this.eventTimeSlotTypes.PRE_EVENT_ACCESS, (this.venuePreEventTimes as TimeWindowFormatInterface[]));
        this.isPreEventTimesSameAsVenue = true;
        this.venuePreEventTimeChangeSub = this.eventService.venuePreEventTimeChange.subscribe((value: VenueTimeChangedSubjectInterface) => {
          if (this.venueIndex === value.venueIndex) {
            this.copyAssignVenueTime(this.eventTimeSlotTypes.PRE_EVENT_ACCESS, value.data);
          }
        });
      } else if (slotsType === EventTimeSlotTypes.EVENT_ACCESS) {
        this.copyAssignVenueTime(this.eventTimeSlotTypes.EVENT_ACCESS, (this.venueEventTimes as TimeWindowFormatInterface[]));
        this.isEventTimesSameAsVenue = true;
        this.venueEventTimeChangeSub = this.eventService.venueEventTimeChange.subscribe((value: VenueTimeChangedSubjectInterface) => {
          if (this.venueIndex === value.venueIndex) {
            this.copyAssignVenueTime(this.eventTimeSlotTypes.EVENT_ACCESS, value.data);
          }
        });
      } else if (slotsType === EventTimeSlotTypes.POST_EVENT_ACCESS) {
        this.copyAssignVenueTime(this.eventTimeSlotTypes.POST_EVENT_ACCESS, (this.venuePostEventTimes as TimeWindowFormatInterface[]));
        this.isPostEventTimesSameAsVenue = true;
        this.venuePostEventTimeChangeSub = this.eventService.venuePostEventTimeChange.subscribe((value: VenueTimeChangedSubjectInterface) => {
          if (this.venueIndex === value.venueIndex) {
            this.copyAssignVenueTime(this.eventTimeSlotTypes.POST_EVENT_ACCESS, value.data);
          }
        });
      }
    } else {
      if (slotsType === EventTimeSlotTypes.PRE_EVENT_ACCESS) {
        this.preEventTimesCount = 1;
        this.emptyPreEventTimes();
        //this.preEventTimes = [];
        this.isPreEventTimesSameAsVenue = false;
        this.venuePreEventTimeChangeSub?.unsubscribe();
      } else if (slotsType === EventTimeSlotTypes.EVENT_ACCESS) {
        this.eventTimesCount = 1;
        this.emptyEventTimes();
        //this.eventTimes = [];
        this.isEventTimesSameAsVenue = false;
        this.venueEventTimeChangeSub?.unsubscribe();
      } else if (slotsType === EventTimeSlotTypes.POST_EVENT_ACCESS) {
        this.postEventTimesCount = 1;
        this.emptyPostEventTimes();
        //this.postEventTimes = [];
        this.isPostEventTimesSameAsVenue = false;
        this.venuePostEventTimeChangeSub?.unsubscribe();
      }
    }
  }

  listenExhibitionEventTimeChange(event: Event, slotsType: EventTimeSlotTypes, forAllExhibitors = false): void {
    const target = (event.target as HTMLInputElement);
    const { checked } = target;
    if (checked) {
      if (slotsType === EventTimeSlotTypes.PRE_EVENT_ACCESS) {
        this.copyAssignVenueTime(this.eventTimeSlotTypes.PRE_EVENT_ACCESS, (this.exhibitorForAllPreEventTimes as TimeWindowFormatInterface[]));
        this.isPreEventTimesSameAsExhibition = true;
        this.exhibitionPreEventTimeChangeSub = this.eventService.exhibitionPreEventTimeChange.subscribe((value: VenueTimeChangedSubjectInterface) => {
          if (this.venueIndex === value.venueIndex) {
            this.copyAssignVenueTime(this.eventTimeSlotTypes.PRE_EVENT_ACCESS, value.data);
          }
        });
      } else if (slotsType === EventTimeSlotTypes.EVENT_ACCESS) {
        this.copyAssignVenueTime(this.eventTimeSlotTypes.EVENT_ACCESS, (this.exhibitorForAllEventTimes as TimeWindowFormatInterface[]));
        this.isEventTimesSameAsExhibition = true;
        this.exhibitionEventTimeChangeSub = this.eventService.exhibitionEventTimeChange.subscribe((value: VenueTimeChangedSubjectInterface) => {
          if (this.venueIndex === value.venueIndex) {
            this.copyAssignVenueTime(this.eventTimeSlotTypes.EVENT_ACCESS, value.data);
          }
        });
      } else if (slotsType === EventTimeSlotTypes.POST_EVENT_ACCESS) {
        this.copyAssignVenueTime(this.eventTimeSlotTypes.POST_EVENT_ACCESS, (this.exhibitorForAllPostEventTimes as TimeWindowFormatInterface[]));
        this.isPostEventTimesSameAsExhibition = true;
        this.exhibitionPostEventTimeChangeSub = this.eventService.exhibitionPostEventTimeChange.subscribe((value: VenueTimeChangedSubjectInterface) => {
          if (this.venueIndex === value.venueIndex) {
            this.copyAssignVenueTime(this.eventTimeSlotTypes.POST_EVENT_ACCESS, value.data);
          }
        });
      }
    } else {
      if (slotsType === EventTimeSlotTypes.PRE_EVENT_ACCESS) {
        this.preEventTimesCount = 1;
        this.emptyPreEventTimes();
        this.isPreEventTimesSameAsExhibition = false;
        this.exhibitionPreEventTimeChangeSub?.unsubscribe();
      } else if (slotsType === EventTimeSlotTypes.EVENT_ACCESS) {
        this.eventTimesCount = 1;
        this.emptyEventTimes();
        this.isEventTimesSameAsExhibition = false;
        this.exhibitionEventTimeChangeSub?.unsubscribe();
      } else if (slotsType === EventTimeSlotTypes.POST_EVENT_ACCESS) {
        this.postEventTimesCount = 1;
        this.emptyPostEventTimes();
        this.isPostEventTimesSameAsExhibition = false;
        this.exhibitionPostEventTimeChangeSub?.unsubscribe();
      }
    }
  }

  copyAssignVenueTime(
    slotsType: EventTimeSlotTypes,
    timeWindows: Partial<TimeWindowFormatInterface>[],
  ): void {
    if (this.isVenueDependent) {
      if (slotsType === EventTimeSlotTypes.PRE_EVENT_ACCESS) {
        this.preEventTimesCount = timeWindows.length || 1;
        //this.preEventTimes = [];
        this.emptyPreEventTimes();
        timeWindows.forEach(timeSlot => {
          this.preEventTimes.push({
            notes: timeSlot.notes,
            endDateTime: timeSlot.endDateTime,
            startDateTime: timeSlot.startDateTime,
          });
        });
      } else if (slotsType === EventTimeSlotTypes.EVENT_ACCESS) {
        this.eventTimesCount = timeWindows.length || 1;
        //this.eventTimes = [];
        this.emptyEventTimes();
        timeWindows.forEach(timeSlot => {
          this.eventTimes.push({
            notes: timeSlot.notes,
            endDateTime: timeSlot.endDateTime,
            startDateTime: timeSlot.startDateTime
          });
        });
      } else if (slotsType === EventTimeSlotTypes.POST_EVENT_ACCESS) {
        this.postEventTimesCount = timeWindows.length || 1;
        //this.postEventTimes = [];
        this.emptyPostEventTimes();
        timeWindows.forEach(timeSlot => {
          this.postEventTimes.push({
            notes: timeSlot.notes,
            endDateTime: timeSlot.endDateTime,
            startDateTime: timeSlot.startDateTime
          });
        });
      }
    }
  }

  private emptyPreEventTimes(): void {
    const len = this.preEventTimes.length;
    for (let i = 0; i < len; i++) {
      this.preEventTimes.pop();
    }
  }

  private emptyEventTimes(): void {
    const len = this.eventTimes.length;
    for (let i = 0; i < len; i++) {
      this.eventTimes.pop();
    }
  }

  private emptyPostEventTimes(): void {
    const len = this.postEventTimes.length;
    for (let i = 0; i < len; i++) {
      this.postEventTimes.pop();
    }
  }

  getMax(max: any) {
    let maxDate;
    if (max) {
      maxDate = moment.tz(max, this.timeZone).hours(23).minutes(59).seconds(59).toDate();
      return maxDate
    } else {
      return null
    }
  }

  ngOnDestroy(): void {
    this.venuePreEventTimeChangeSub?.unsubscribe();
    this.venueEventTimeChangeSub?.unsubscribe();
  }

  checkTimeWindowFor(timewindowfor: any) {
    if (timewindowfor != EventTimeWindowTypes.Exhibitor) {
      return true;
    } else {
      return false;
    }
  }

  checkTimeWindowForExhibition(timewindowfor: any) {
    if (timewindowfor === EventTimeWindowTypes.Exhibitor) {
      return true;
    } else {
      return false;
    }
  }

  checkFreeze(timeType: any) {
    if (timeType == 'pre' && this.timeWindowFor === EventTimeWindowTypes.Exhibitor) {
      return this.isPreEventTimesSameAsExhibition;
    } else if (timeType == 'event' && this.timeWindowFor === EventTimeWindowTypes.Exhibitor) {
      return this.isEventTimesSameAsExhibition;
    } else if (timeType == 'post' && this.timeWindowFor === EventTimeWindowTypes.Exhibitor) {
      return this.isPostEventTimesSameAsExhibition;
    } else if (timeType == 'pre' && this.timeWindowFor != EventTimeWindowTypes.Exhibitor) {
      return this.isPreEventTimesSameAsVenue;
    } else if (timeType == 'event' && this.timeWindowFor != EventTimeWindowTypes.Exhibitor) {
      return this.isEventTimesSameAsVenue;
    } else if (timeType == 'post' && this.timeWindowFor != EventTimeWindowTypes.Exhibitor) {
      return this.isPostEventTimesSameAsVenue;
    } else {
      return false;
    }
  }

}
