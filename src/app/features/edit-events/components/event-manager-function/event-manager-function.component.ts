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
import { faAddressCard } from '@fortawesome/free-regular-svg-icons';
import { ActivatedRoute } from '@angular/router';
import { AngularEditorConfig } from '@kolkov/angular-editor';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { ClientAccessComponent } from 'src/app/shared/components';

@Component({
  selector: 'app-event-manager-function',
  templateUrl: './event-manager-function.component.html',
  styleUrls: ['./event-manager-function.component.scss'],
})
export class EventManagerFunctionComponent
  implements OnInit, OnDestroy, OnChanges
{
  addressCardIcon = faAddressCard;
  @Input() eventData: any;
  @Input() selectedCompany: Company | InviteFnCmpClass | undefined | null;
  @Input() content: any;
  @Output() removeSelectedCompany = new EventEmitter<any>();
  @Input() eventToBeSaved = new SaveEventClass();
  @Output() saveAndInvite = new EventEmitter<boolean>();
  @Input() isOwnCompany: boolean = false;
  private subs1: Subscription | undefined;
  private subs2: Subscription | undefined;
  @Output() editClient = new EventEmitter<boolean>();
  @Output() editManager = new EventEmitter<boolean>();
  @Output() editVenue = new EventEmitter<boolean>();
  @Output() editService = new EventEmitter<boolean>();
  @Output() editExhibitor = new EventEmitter<boolean>();
  isEventEdit: boolean = false;

  @Input() permissionObj: any;
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
    defaultFontSize: '2',
    showToolbar:false,
    toolbarHiddenButtons: [
      [
        // 'undo',
        // 'redo',
        // 'fontSize',
        // 'textColor',
        // 'backgroundColor',
        // 'bold',
        // 'italic',
        // 'underline',
        // 'strikeThrough',
        'subscript',
        'superscript',
        // 'justifyLeft',
        // 'justifyCenter',
        // 'justifyRight',
        'justifyFull',
        // 'indent',
        // 'outdent',
        // 'insertUnorderedList',
        // 'insertOrderedList',
        'heading',
        'fontName'
      ],
      [
        'customClasses',
        'link',
        'unlink',
        'insertImage',
        'insertVideo',
        'insertHorizontalRule',
        'removeFormat',
        'toggleEditorMode'
      ]
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
  config1: AngularEditorConfig = {
    editable: true,
    spellcheck: true,
    // height: '15rem',
    minHeight: '5rem',
    placeholder: 'Enter text here...',
    translate: 'no',
    defaultParagraphSeparator: 'p',
    defaultFontName: 'Arial',
    sanitize: false,
    defaultFontSize: '2',
    showToolbar:false,
    toolbarHiddenButtons: [
      [
        // 'undo',
        // 'redo',
        // 'fontSize',
        // 'textColor',
        // 'backgroundColor',
        // 'bold',
        // 'italic',
        // 'underline',
        // 'strikeThrough',
        'subscript',
        'superscript',
        // 'justifyLeft',
        // 'justifyCenter',
        // 'justifyRight',
        'justifyFull',
        // 'indent',
        // 'outdent',
        // 'insertUnorderedList',
        // 'insertOrderedList',
        'heading',
        'fontName'
      ],
      [
        'customClasses',
        'link',
        'unlink',
        'insertImage',
        'insertVideo',
        'insertHorizontalRule',
        'removeFormat',
        'toggleEditorMode'
      ]
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
  accessPermission:any;
  constructor(
    public eventService: EventService,
    public aroute: ActivatedRoute,
    public modalService: NgbModal
  ) {
    this.aroute.queryParams.subscribe((param) => {
      console.log('param...', param);
      this.isPast = param.isPast;
    });
  }
  changeConfig() {
    if (!this.isEventEdit) {
      this.config.editable = false;
      this.config.showToolbar = false;
    } else {
      $('#evDescription .angular-editor-textarea').css('border-top', 'none');
      this.config.editable = true;
      this.config.showToolbar = true;
    }
  }

  changeConfig1() {
    if (!this.isEventEdit) {
      this.config1.editable = false;
      this.config1.showToolbar = false;
    } else {
      $('#evDescription .angular-editor-textarea').css('border-top', 'none');
      this.config1.editable = true;
      this.config1.showToolbar = true;
    }
  }

  check() {
    if (!this.isEventEdit && this.isPast == 'false') {
      return true;
    } else {
      return false;
    }
  }

  ngOnChanges(changes: SimpleChanges) {}

  editEventManager() {
    this.eventService.isEdit = true;
    this.isEventEdit = true;
    this.editManager.emit(this.isEventEdit);
  }

  ngOnInit(): void {
    this.accessPermission = this.eventData.eventData.eventManager.clientAccessPermission
    this.subs2 = this.eventService.isEditChange.subscribe((value) => {
      this.isEventEdit = value;
      this.editManager.emit(this.isEventEdit);
    });
    if (this.eventData.eventData.isDeleted == 1) {
      this.eventService.isDeleted = true;
    }

    this.subs1 = this.eventService.setIsFnOwnCompany.subscribe((status) => {
      this.isOwnCompany = !!status.get(EventFunctionTypes.EVENT_MANAGER);
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

  toggleEvMgrOwnCompany(): void {
    const tempMap = new Map(this.eventService.setIsFnOwnCompany.getValue());
    tempMap.set(
      EventFunctionTypes.EVENT_MANAGER,
      !tempMap.get(EventFunctionTypes.EVENT_MANAGER)
    );
    this.eventData.eventData.eventManager.isOwnCompany = tempMap.get(
      EventFunctionTypes.EVENT_MANAGER
    )
      ? 1
      : 0;
    this.eventService.setIsFnOwnCompany.next(tempMap);
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
      window.open('/home/company/manage-company?isView=' + true);
    }
  }

  eventSettings() {
    let ngbModalOptions: NgbModalOptions = {
      backdrop: 'static',
      keyboard: false,
    };
    const modalRef = this.modalService.open(
      ClientAccessComponent,
      ngbModalOptions
    );
    modalRef.componentInstance.accessPermission = this.accessPermission;

    modalRef.result
      .then((result: any) => {
        if (result && result.accessPermission) {
          this.accessPermission = result.accessPermission;
          let data = {
            clientAccessPermission: result.accessPermission,
            eventId: this.eventData.eventData.eventId,
          };
          this.eventService.giveClientPermission(data).subscribe(
            (res: any) => {
              console.log(res);
            },
            (err) => {
              console.log(err);
            }
          );
        }
      })
      .catch((result) => {});
  }

  ngOnDestroy(): void {
    this.subs1?.unsubscribe();
    this.subs2?.unsubscribe();
  }
}
