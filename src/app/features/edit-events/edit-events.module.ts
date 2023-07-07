import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {OwlDateTimeModule, OwlNativeDateTimeModule} from '@danielmoncada/angular-datetime-picker';
import {EventsRoutingModule} from './events-routing.module';
import {EventPanelComponent} from './components/event-panel/event-panel.component';
import {CreateEventComponent} from './components/create-event/create-event.component';
import {NgbAccordionModule, NgbNav, NgbNavModule} from "@ng-bootstrap/ng-bootstrap";
import {CreateEventInfoBarComponent} from './components/create-event-info-bar/create-event-info-bar.component';
import {EventPanelNavComponent} from './components/event-panel-nav/event-panel-nav.component';
import {EventClientFunctionComponent} from './components/event-client-function/event-client-function.component';
import {EventManagerFunctionComponent} from './components/event-manager-function/event-manager-function.component';
import {EventVenueFunctionComponent} from './components/event-venue-function/event-venue-function.component';
import {EventSuppliersFunctionComponent} from './components/event-suppliers-function/event-suppliers-function.component';
import {EventExhibitorsFunctionComponent} from './components/event-exhibitors-function/event-exhibitors-function.component';
import {EventFilesFunctionComponent} from './components/event-files-function/event-files-function.component';
import {EventTimelineFunctionComponent} from './components/event-timeline-function/event-timeline-function.component';
import {EventAssignFunctionCmpComponent} from './components/event-assign-function-cmp/event-assign-function-cmp.component';
import {SearchOrInviteFunctionCmpComponent} from './components/search-or-invite-function-cmp/search-or-invite-function-cmp.component';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {SharedModule} from "../../shared/shared.module";
import {SearchOrInviteFnCmpCntComponent} from './components/search-or-invite-fn-cmp-cnt/search-or-invite-fn-cmp-cnt.component';
import {TimeWindowsComponent} from './components/time-windows/time-windows.component';
import { DateTimePickerComponent } from './components/date-time-picker/date-time-picker.component';
import { EventFilesUploadModalComponent } from './components/event-files-upload-modal/event-files-upload-modal.component';
import { EventViewComponent } from './components/event-view/event-view.component';
import { EventGanttChartComponent } from './components/event-gantt-chart/event-gantt-chart.component';
import { EventAssignCrewFunctionCmpComponent } from './components/event-assign-crew-function-cmp/event-assign-crew-function-cmp.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { AngularEditorModule } from '@kolkov/angular-editor';
import { TasksComponent } from './components/tasks/tasks.component';
import { OverviewComponent } from './components/overview/overview.component';
import {DragDropModule} from '@angular/cdk/drag-drop';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { EventFilesOverviewComponent } from './components/event-files-function-overview/event-files-function-overview.component';
import { EventClientoverviewComponent } from './components/event-client-overview/event-client-overview.component';
import { EventManagerOverviewComponent } from './components/event-manager-overview/event-manager-overview.component';
import { EventVenueOverviewComponent } from './components/event-venue-overview/event-venue-overview.component';
import { EventSuppliersOverviewComponent } from './components/event-suppliers-overview/event-suppliers-overview.component';
import { EventExhibitorsOverviewComponent } from './components/event-exhibitors-overview/event-exhibitors-overview.component';
import { EventTimelineOverviewComponent } from './components/event-timeline-overview/event-timeline-overview.component';
import { EventAssignCrewFunctionCmpOverviewComponent } from './components/event-assign-crew-function-overview-cmp/event-assign-crew-function-cmp-overview.component';
import { EventAssignFunctionCmpOverviewComponent } from './components/event-assign-function-cmp-overview/event-assign-function-cmp-overview.component';

@NgModule({
  declarations: [
    EventPanelComponent,
    CreateEventComponent,
    CreateEventInfoBarComponent,
    EventPanelNavComponent,
    EventClientFunctionComponent,
    EventManagerFunctionComponent,
    EventManagerOverviewComponent,
    EventVenueFunctionComponent,
    EventVenueOverviewComponent,
    EventSuppliersFunctionComponent,
    EventSuppliersOverviewComponent,
    EventExhibitorsFunctionComponent,
    EventExhibitorsOverviewComponent,
    EventFilesFunctionComponent,
    EventTimelineFunctionComponent,
    EventTimelineOverviewComponent,
    EventAssignFunctionCmpComponent,
    EventAssignFunctionCmpOverviewComponent,
    SearchOrInviteFunctionCmpComponent,
    SearchOrInviteFnCmpCntComponent,
    TimeWindowsComponent,
    DateTimePickerComponent,
    EventFilesUploadModalComponent,
    EventViewComponent,
    EventGanttChartComponent,
    EventAssignCrewFunctionCmpComponent,
    EventAssignCrewFunctionCmpOverviewComponent,
    TasksComponent,
    OverviewComponent,
    EventFilesOverviewComponent,
    EventClientoverviewComponent
    
  ],
  imports: [
    CommonModule,
    EventsRoutingModule,
    NgbNavModule,
    NgbAccordionModule,
    FormsModule,
    SharedModule,
    ReactiveFormsModule,
    OwlDateTimeModule,
    OwlNativeDateTimeModule,
    FontAwesomeModule,
    AngularEditorModule,
    DragDropModule,
    NgbModule
  ],
})
export class EditEventsModule {
}
