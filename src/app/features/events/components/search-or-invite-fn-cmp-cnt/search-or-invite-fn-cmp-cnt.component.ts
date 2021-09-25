import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { InviteFnCmpCntInterface } from '../../models/interfaces/invite-fn-cmp-cnt.interface';
import { Company } from '../../../users/models';
import { FormBuilder, Validators } from '@angular/forms';
import { CompaniesService } from '../../../users/services/companies.service';
import { checkRxFormValidation, devLogger } from '../../../../shared/utils';
import { environment } from '../../../../../environments/environment';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { FnCmpCntInterface } from '../../models/interfaces';

@Component({
  selector: 'app-search-or-invite-fn-cmp-cnt',
  templateUrl: './search-or-invite-fn-cmp-cnt.component.html',
  styleUrls: ['./search-or-invite-fn-cmp-cnt.component.scss']
})
export class SearchOrInviteFnCmpCntComponent implements OnInit, OnDestroy {
  EMAIL_REGEX = new RegExp(/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,6}))$/);

  @Input() alreadyInContactList: FnCmpCntInterface[] = [];
  @Input() companyId: number | null = null;
  @Output() closed = new EventEmitter();
  @Output() addedContactList = new EventEmitter<FnCmpCntInterface[]>();
  searchKeyWord = '';
  listDisplayCss = '';
  listDisplayOverFlow = '';
  contactLabelId: number | null = null;
  contactList: FnCmpCntInterface[] = [];
  cntSearchList: any[] = [];
  selectedContact: any;
  inviteCmpCntForm = this.fb.group({
    firstName: [null, [Validators.required]],
    email: [null, [Validators.required, Validators.pattern(this.EMAIL_REGEX)]]
  });
  contactLabels = environment.eventContactLabels;
  private cmpCntSearchSub: Subscription | undefined;
  private emittedContactList = false;

  constructor(
    private fb: FormBuilder,
    private companiesService: CompaniesService,
    private toaster: ToastrService) {
  }


  ngOnInit(): void {
  }

  searchForCompCnt(): void {
    this.selectedContact = null;
    this.contactLabelId = null;
    if (this.companyId) {
      if (this.searchKeyWord.trim().length >= 3) {
        this.cmpCntSearchSub = this.companiesService.searchCmpContacts({
          companyId: this.companyId, keyword: this.searchKeyWord, isCrew: 0
        }, this.searchKeyWord.trim().length === 1).subscribe(
          value => {
            if (value && value.data) {
              devLogger('log', value);
              this.cntSearchList = value.data?.user.filter((u: any) => {
                return this.contactList.findIndex(cnt => cnt.id === u.userId) === -1
                  && this.alreadyInContactList.findIndex(cnt => cnt.id === u.userId) === -1
                  && this.alreadyInContactList.findIndex(cnt => cnt.email === u.email) === -1
                  && this.contactList.findIndex(cnt => cnt.email === u.email) === -1;
              }) || [];
              this.listDisplayCss = 'block !important';
              this.listDisplayOverFlow = 'auto';
            }
          },
          error => {
            devLogger('error', error);
            this.cntSearchList = [];
            this.listDisplayCss = '';
            this.listDisplayOverFlow = '';
          }
        );
      } else {
        this.cntSearchList = [];
        this.listDisplayCss = '';
        this.listDisplayOverFlow = '';
      }
    } else {
      this.toaster.error('Please make sure the function company is chosen');
    }
  }

  selectCnt(contact: any): void {
    this.selectedContact = contact;
    this.searchKeyWord = this.selectedContact?.firstName + ' ' + this.selectedContact?.lastName || '';
    this.cntSearchList = [];
  }

  addCmpCntToList(inviteType = false): void {
    if (this.selectedContact && !this.contactLabelId) {
      this.toaster.error('Please select a contact label');
      return;
    }
    if (this.selectedContact && !inviteType) {
      this.contactList.push({
        lastName: this.selectedContact.lastName,
        mobile: this.selectedContact.mobile,
        position: this.selectedContact.position,
        email: this.selectedContact.email,
        profileImage: this.selectedContact.profileImage,
        // @ts-ignore
        contactLabelId: parseInt(this.contactLabelId, 10),
        firstName: this.selectedContact.firstName,
        id: this.selectedContact.userId
      });
    } else if (!this.selectedContact && inviteType) {
      const invitedInContactList = this.alreadyInContactList
        .findIndex(cnt => cnt.email === this.inviteCmpCntForm.get('email')?.value) !== -1;

      if (invitedInContactList) {
        this.toaster.error('This user is already invited in contact list please check the email');
        return;
      }
      this.contactList.push({
        lastName: '',
        position: '(Invited)',
        mobile: '',
        email: this.inviteCmpCntForm.get('email')?.value,
        profileImage: undefined,
        firstName: this.inviteCmpCntForm.get('firstName')?.value,
        id: null,
        contactLabelId: null
      });
    } else {
      this.toaster.error('Please search and select a contact');
    }
    this.inviteCmpCntForm.reset();
    this.selectedContact = null;
    this.contactLabelId = null;
    this.searchKeyWord = '';
  }

  validateFields(): boolean {
    return checkRxFormValidation(this.inviteCmpCntForm);
  }

  removeContactFromList(i: number): void {
    this.contactList.splice(i, 1);
  }

  emitContactListAndClose(): void {
    if (!this.emittedContactList) {
      devLogger('log', { cntList: this.contactList });
      this.addedContactList.emit(this.contactList);
      this.emittedContactList = true;
    }
  }

  ngOnDestroy(): void {
    this.cmpCntSearchSub?.unsubscribe();
  }
}
