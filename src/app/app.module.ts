import {NgModule, CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {CoreModule} from './core/core.module';
import {SharedModule} from './shared/shared.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import {NgMultiSelectDropDownModule} from 'ng-multiselect-dropdown';
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {EventsModule} from "./features/events/events.module";
import {EditEventsModule} from "./features/edit-events/edit-events.module";
import {UsersModule} from "./features/users/users.module";
import {NgxSpinnerModule} from "ngx-spinner";
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    NgbModule,
    NgMultiSelectDropDownModule.forRoot(),
    NgxSpinnerModule,
    SharedModule,
    CoreModule,
    EventsModule,
    UsersModule,
    AppRoutingModule,
    FontAwesomeModule,
    EditEventsModule
  ],
  providers: [
  ],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule {
}
