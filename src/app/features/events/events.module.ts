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


@NgModule({
  declarations: [
    EventPanelComponent,
    CreateEventComponent,
    CreateEventInfoBarComponent,
    EventPanelNavComponent,
    EventClientFunctionComponent,
    EventManagerFunctionComponent,
    EventVenueFunctionComponent,
    EventSuppliersFunctionComponent,
    EventExhibitorsFunctionComponent,
    EventFilesFunctionComponent,
    EventTimelineFunctionComponent,
    EventAssignFunctionCmpComponent,
    SearchOrInviteFunctionCmpComponent,
    SearchOrInviteFnCmpCntComponent,
    TimeWindowsComponent,
    DateTimePickerComponent,
    EventFilesUploadModalComponent,
    EventViewComponent,
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
  ],
})
export class EventsModule {
}
