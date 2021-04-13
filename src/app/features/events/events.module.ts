import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { EventsRoutingModule } from './events-routing.module';
import { CreateEventComponent } from './create-event/create-event.component';


@NgModule({
  declarations: [
    CreateEventComponent
  ],
  imports: [
    CommonModule,
    EventsRoutingModule
  ]
})
export class EventsModule { }
