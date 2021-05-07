import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-events-listings',
  templateUrl: './events-listings.component.html',
  styleUrls: ['./events-listings.component.scss']
})
export class EventsListingsComponent implements OnInit {
  @Input() events: any;
  constructor() { }

  ngOnInit(): void {
    console.log(this.events);
  }

}
