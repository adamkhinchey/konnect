import {AfterViewChecked, ChangeDetectorRef, Component, Input, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {EventService} from '../../services/event.service';
import {devLogger} from '../../../../shared/utils';

@Component({
  selector: 'app-event-panel',
  templateUrl: './event-panel.component.html',
  styleUrls: ['./event-panel.component.scss']
})
export class EventPanelComponent implements OnInit, AfterViewChecked {
  isView = false;
  eventId: any;
  constructor(
    private router: Router,
    private aroute: ActivatedRoute,
    private cdRef: ChangeDetectorRef,
    public readonly eventService: EventService) {

    this.eventId = this.router.getCurrentNavigation()?.extras.state?.eventId;
    this.aroute.queryParams.subscribe(param => {
      devLogger('log', param);
      this.eventId = param.eventId;
    });
  }

  ngOnInit(): void {
  }

  ngAfterViewChecked(): void {
    if (this.eventId !== undefined) {
      this.isView = true;
    } else {
      this.isView = false;
    }
    this.cdRef.detectChanges();
  }

}
