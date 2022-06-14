import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { Company } from '../../../users/models';
import { InviteFnCmpClass } from '../../models/classes';
import { SaveEventClass } from '../../models/classes/saveEvent.class';
import { Subscription } from 'rxjs';
import { EventService } from '../../services/event.service';
import { EventFunctionTypes } from '../../models/types';
import { AngularEditorConfig } from '@kolkov/angular-editor';

@Component({
  selector: 'app-event-manager-function',
  templateUrl: './event-manager-function.component.html',
  styleUrls: ['./event-manager-function.component.scss'],
})
export class EventManagerFunctionComponent implements OnInit, OnDestroy {
  @Input() selectedCompany: Company | InviteFnCmpClass | undefined | null;
  @Input() content: any;
  @Output() removeSelectedCompany = new EventEmitter<any>();
  @Input() eventToBeSaved = new SaveEventClass();
  @Output() saveAndInvite = new EventEmitter<boolean>();
  isOwnCompany = false;
  private subs1: Subscription | undefined;
  config: AngularEditorConfig = {
    editable: true,
    showToolbar: false,
    spellcheck: true,
    // height: '15rem',
    minHeight: '5rem',
    placeholder: 'Enter text here...',
    translate: 'no',
    defaultParagraphSeparator: 'p',
    defaultFontName: 'Arial',
    sanitize: false,
    defaultFontSize: '2',
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
        'fontName',
      ],
      [
        'customClasses',
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
  constructor(public eventService: EventService) {}

  ngOnInit(): void {
    this.subs1 = this.eventService.setIsFnOwnCompany.subscribe((status) => {
      this.isOwnCompany = !!status.get(EventFunctionTypes.EVENT_MANAGER);
    });
  }

  changeConfig(){
    $('#evDescription .angular-editor-textarea').css('border-top', 'none');
    this.config.editable = true;
    this.config.showToolbar = true;
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
    this.eventService.setIsFnOwnCompany.next(tempMap);
  }

  ngOnDestroy(): void {
    this.subs1?.unsubscribe();
  }

  getCompanyId(): any {
    if (this.selectedCompany instanceof InviteFnCmpClass) {
      return null;
    } else {
      return this.selectedCompany?.id;
    }
  }

  goToCompanyProfile(companyId: any) {
    if (companyId) {
      localStorage.setItem('companyId', JSON.stringify(companyId));
      localStorage.setItem('isView', JSON.stringify(true));
      window.open('/home/company/manage-company?isView=' + true);
    }
  }
}
