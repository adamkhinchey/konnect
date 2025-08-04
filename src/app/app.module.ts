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
import { DatePipe } from '@angular/common';
import { VerifyEmailComponent } from './verify-email/verify-email.component';
import { AngularEditorModule } from '@kolkov/angular-editor';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    AppComponent,
    VerifyEmailComponent
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
    FormsModule,
    UsersModule,
    AppRoutingModule,
    FontAwesomeModule,
    EditEventsModule,
    AngularEditorModule
  ],
  providers: [
    DatePipe
  ],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule {
}
