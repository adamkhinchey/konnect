import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { Company } from '../../../users/models';
import { InviteFnCmpClass } from '../../models/classes';
import { SaveEventClass } from '../../models/classes/saveEvent.class';
import { Subscription } from 'rxjs';
import { EventService } from '../../services/event.service';
import { EventFunctionTypes } from '../../models/types';
import { ActivatedRoute, Router } from '@angular/router';
import { ViewEventService } from '../../services/view-event.service';
import { faAddressCard } from '@fortawesome/free-regular-svg-icons';
import { AngularEditorConfig } from '@kolkov/angular-editor';

@Component({
  selector: 'app-event-client-function',
  templateUrl: './event-client-function.component.html',
  styleUrls: ['./event-client-function.component.scss'],
})
export class EventClientFunctionComponent
  implements OnInit, OnDestroy, OnChanges
{
  addressCardIcon = faAddressCard;
  @Input() selectedCompany: Company | InviteFnCmpClass | undefined | null;
  @Input() content: any;
  @Output() removeSelectedCompany = new EventEmitter<any>();
  @Input() eventToBeSaved = new SaveEventClass();
  @Output() saveAndInvite = new EventEmitter<boolean>();
  @Input() isOwnCompany: boolean = false;
  private subs1: Subscription | undefined;
  private subs2: Subscription | undefined;
  private subs3: Subscription | undefined;
  @Input() eventData: any;
  @Output() editClient = new EventEmitter<boolean>();
  @Input() permissionObj: any;

  isSupplier: boolean = false;
  modalReference: any;
  isClientEdit: boolean = false;
  isEventEdit: boolean = false;
  isVenueEdit: boolean = false;
  isSupplierEdit: boolean = false;
  isExhibitorEdit: boolean = true;
  isPast: any;
  config: AngularEditorConfig = {
    editable: true,
    spellcheck: true,
    // height: '15rem',
    minHeight: '5rem',
    placeholder: 'Enter text here...',
    translate: 'no',
    defaultParagraphSeparator: 'p',
    defaultFontName: 'Arial',
    sanitize: false,
    defaultFontSize:'2',
    showToolbar:false,
    toolbarHiddenButtons: [
      [
        'link',
        'unlink',
        'insertImage',
        'insertVideo',
        'insertHorizontalRule',
        'removeFormat',
        'toggleEditorMode',
      ],
    ],
    customClasses: [
      {
        name: 'quote',
        class: 'quote',
      },
      {
        name: 'redText',
        class: 'redText',
      },
      {
        name: 'titleText',
        class: 'titleText',
        tag: 'h1',
      },
    ],
  };

  constructor(
    private eventService: EventService,
    private router: Router,
    private aroute: ActivatedRoute,
    private viewEvSrvc: ViewEventService
  ) {
    this.eventService.isEdit = false;
  }

  changeConfig() {
    if (!this.isClientEdit){ 
      this.config.editable = false; 
      this.config.showToolbar = false;
    }
    else{ 
      $('#evDescription .angular-editor-textarea').css('border-top', 'none');
      this.config.editable = true; 
      this.config.showToolbar = true;
    }
  }

  check() {
    if (!this.isClientEdit && this.isPast == 'false') {
      return true;
    } else {
      return false;
    }
  }

  ngOnChanges(changes: SimpleChanges) {}

  booleanFalse() {
    this.isClientEdit = false;
    this.isEventEdit = false;
    this.isVenueEdit = false;
    this.isSupplierEdit = false;
    this.isExhibitorEdit = false;
  }

  editClientEvent() {
    this.eventService.isEdit = true;
    this.isClientEdit = true;
    this.editClient.emit(this.isClientEdit);
  }
  editEventManager() {
    this.isEventEdit = true;
  }
  editVenue() {
    this.isVenueEdit = true;
  }
  editSupplier() {
    this.isSupplierEdit = true;
  }
  editExhibitor() {
    this.isExhibitorEdit = true;
  }

  /*ngOnChanges(changes: SimpleChanges): void {
    if (changes && changes.eventToBeSaved && changes.eventToBeSaved.currentValue) {
      const eventData = changes.eventToBeSaved.currentValue;
      if (eventData.client && eventData.client.isOwnCompany) {
        this.isOwnCompany = eventData.client.isOwnCompany;
      }
    }
  }*/

  ngOnInit(): void {
    this.subs3 = this.eventService.isEditChange.subscribe((value) => {
      this.isClientEdit = value;
      this.editClient.emit(this.isClientEdit);
    });
    if (this.eventData.eventData.isDeleted == 1) {
      this.eventService.isDeleted = true;
    }
    /*this.subs1 = this.clientCmpToSelfSub?.subscribe(value => {
      if (value !== null) {
        this.isOwnCompany = value;
      }
    });*/

    this.subs2 = this.eventService.setIsFnOwnCompany.subscribe((status) => {
      this.isOwnCompany = !!status.get(EventFunctionTypes.CLIENT);
    });
    this.aroute.queryParams.subscribe((param) => {
      console.log('param...', param);
      this.isPast = param.isPast;
      console.log('isPast...', this.isPast);
    });
  }

  openVerticallyCentered(content: any): void {}

  getCompanyProfileImage(): string | null | undefined {
    if (this.selectedCompany instanceof InviteFnCmpClass) {
      return null;
    } else {
      return this.selectedCompany?.companyProfileImage;
    }
  }

  getCompanyWebsite(): string | null | undefined {
    if (this.selectedCompany instanceof InviteFnCmpClass) {
      return null;
    } else {
      return this.selectedCompany?.website;
    }
  }

  getCompanyPhone(): string | null | undefined {
    if (this.selectedCompany instanceof InviteFnCmpClass) {
      return null;
    } else {
      return this.selectedCompany?.phone;
    }
  }

  toggleClientOwnCompany(): void {
    const tempMap = new Map(this.eventService.setIsFnOwnCompany.getValue());
    tempMap.set(
      EventFunctionTypes.CLIENT,
      !tempMap.get(EventFunctionTypes.CLIENT)
    );
    this.eventData.eventData.client.isOwnCompany = tempMap.get(
      EventFunctionTypes.CLIENT
    )
      ? 1
      : 0;
    this.eventService.setIsFnOwnCompany.next(tempMap);
  }

  ngOnDestroy(): void {
    this.subs1?.unsubscribe();
    this.subs2?.unsubscribe();
    this.subs3?.unsubscribe();
  }

  deleteEvent(eventId: any) {
    this.viewEvSrvc.deleteEvent(eventId).subscribe(
      (res: any) => {
        this.router.navigate(['/home']);
      },
      (err: any) => {}
    );
  }

  getCompanyId(): any {
    if (this.selectedCompany instanceof InviteFnCmpClass) {
      return null;
    } else {
      return this.selectedCompany?.id;
    }
  }

  getIsPrivate(): any {
    if (this.selectedCompany instanceof InviteFnCmpClass) {
      return null;
    } else {
      return this.selectedCompany?.isPrivate;
    }
  }

  getIsSeed(): any {
    if (this.selectedCompany instanceof InviteFnCmpClass) {
      return null;
    } else {
      return this.selectedCompany?.isSeed;
    }
  }

  goToCompanyProfile(companyId: any) {
    if (companyId) {
      localStorage.setItem('companyId', JSON.stringify(companyId));
      localStorage.setItem('isView', JSON.stringify(true));
      localStorage.setItem('isHeaderDisable', JSON.stringify(true));
      window.open('/home/company/manage-company?isView=' + true);
    }
  }
}
