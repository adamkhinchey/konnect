import { Component, OnInit } from '@angular/core';
import {SaveEventService} from "../../services/save-event.service";

@Component({
  selector: 'app-create-event-info-bar',
  templateUrl: './create-event-info-bar.component.html',
  styleUrls: ['./create-event-info-bar.component.scss']
})
export class CreateEventInfoBarComponent implements OnInit {

  constructor(public eventSaveService: SaveEventService) { }

  ngOnInit(): void {
  }

}
