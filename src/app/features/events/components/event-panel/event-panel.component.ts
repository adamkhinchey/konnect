import { AfterViewChecked, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-event-panel',
  templateUrl: './event-panel.component.html',
  styleUrls: ['./event-panel.component.scss']
})
export class EventPanelComponent implements OnInit, AfterViewChecked {
  isView: boolean = false;
  constructor(private router: Router, private cdRef: ChangeDetectorRef) { }

  ngOnInit(): void {

  }

  ngAfterViewChecked() {
    if (this.router.url === '/home/event/view-event') {
      this.isView = true;
    }
    else {
      this.isView = false;
    }
    this.cdRef.detectChanges();
  }

}
