import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import AuthGuard from "../../core/guards/authGuard";
import { CreateEventComponent } from './components/create-event/create-event.component';
import { EventPanelComponent } from './components/event-panel/event-panel.component';
import { EventViewComponent } from './components/event-view/event-view.component';

const routes: Routes = [
  {
    path: 'home/edit-event',
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
