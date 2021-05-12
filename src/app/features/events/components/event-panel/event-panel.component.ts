import { AfterViewChecked, ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-event-panel',
  templateUrl: './event-panel.component.html',
  styleUrls: ['./event-panel.component.scss']
})
export class EventPanelComponent implements OnInit, AfterViewChecked {
  isView: boolean = false;
  eventId: any;
  constructor(private router: Router, private aroute: ActivatedRoute, private cdRef: ChangeDetectorRef) {
    this.eventId = this.router.getCurrentNavigation()?.extras.state?.eventId;
    this.aroute.queryParams.subscribe(param => {
      console.log(param);
      this.eventId = param['eventId'];
    });
  }

  ngOnInit(): void {
  }

  ngAfterViewChecked() {
    if (this.eventId != undefined) {
      this.isView = true;
    }
    else {
      this.isView = false;
    }
    this.cdRef.detectChanges();
  }

}
