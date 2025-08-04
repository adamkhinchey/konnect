import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EventPanelComponent } from "./components/event-panel/event-panel.component";
import { CreateEventComponent } from "./components/create-event/create-event.component";
import AuthGuard from "../../core/guards/authGuard";
import { EventViewComponent } from './components/event-view/event-view.component';

const routes: Routes = [
  {
    path: 'home/event',
    component: EventPanelComponent,
    canActivate: [AuthGuard],
    children: [
      { path: 'create', component: CreateEventComponent },
      { path: 'view-event', component: EventViewComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EventsRoutingModule {
}
