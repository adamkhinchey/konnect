import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {EventPanelComponent} from "./components/event-panel/event-panel.component";
import {CreateEventComponent} from "./components/create-event/create-event.component";
import AuthGuard from "../../core/guards/authGuard";

const routes: Routes = [
  {
    path: 'home/event',
    component: EventPanelComponent,
    canActivate: [AuthGuard],
    children: [
      {path: 'create', component: CreateEventComponent}
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EventsRoutingModule {
}
