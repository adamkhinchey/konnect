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
import { UserInfoService } from 'src/app/shared/services';

@Component({
  selector: 'app-search-or-invite-fn-cmp-cnt',
  templateUrl: './search-or-invite-fn-cmp-cnt.component.html',
  styleUrls: ['./search-or-invite-fn-cmp-cnt.component.scss']
})
export class SearchOrInviteFnCmpCntComponent implements OnInit, OnDestroy {
  EMAIL_REGEX = new RegExp(/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,6}))$/);

  @Input() alreadyInContactList: FnCmpCntInterface[] = [];
  @Input() companyId: number | null = null;
  @Input() myAssociatedCompanies=[];
  @Input() isSeedCompany:boolean = false;
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
    email: [null, [Validators.required, Validators.pattern(this.EMAIL_REGEX)]],
    mobile: [null],
  });
  contactLabels = environment.eventContactLabels;
  private cmpCntSearchSub: Subscription | undefined;
  private emittedContactList = false;
  isDisableInviteContact:boolean =true;
  userId: any = 0;
  constructor(
    private fb: FormBuilder,
    private companiesService: CompaniesService,
    private toaster: ToastrService,
    public userInfoService: UserInfoService
  ) {
  }


  ngOnInit(): void {
    this.fetchUserInfo();

    if (this.companyId) {
      this.getCompanyContacts();
    } else {
      this.toaster.error('Please make sure the function company is chosen');
    }
    if (!this.isSeedCompany){
      this.isDisableInviteContact = this.isNotAssociatedCompany(this.companyId);
    }

  }

  isNotAssociatedCompany(companyId:any){
    var filteredArray = this.myAssociatedCompanies.filter(function(c:any){
      return [companyId].indexOf(c.id) > -1;
    });
    return (filteredArray.length > 0 ? true : false);
  }

  private fetchUserInfo(): void {
    this.userInfoService.getInfo(this.userId).subscribe((value) => {

      this.userId = value.id
    }, err => {
      devLogger('error', { err });
    });
  }

  getCompanyContacts() {
    this.cmpCntSearchSub = this.companiesService.getCmpContacts({
      companyId: this.companyId, isCrew: 0
    }, this.searchKeyWord.trim().length === 1).subscribe(
      value => {

        if (value && value.length) {
          devLogger('log', value);
          this.cntSearchList = value || [];
          // value.filter((u: any) => {
          //   return this.contactList.findIndex(cnt => cnt.id === u.userId) === -1
          //     && this.alreadyInContactList.findIndex(cnt => cnt.id === u.userId) === -1
          //     && this.alreadyInContactList.findIndex(cnt => cnt.email === u.email) === -1
          //     && this.contactList.findIndex(cnt => cnt.email === u.email) === -1;
          // }) || [];
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

            if (value && value.length) {
              devLogger('log', value);
              this.cntSearchList = value.filter((u: any) => {
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

  selectCnt(ev: any): void {

    let contact = this.cntSearchList.filter((val: any) => {
      return val.userId == ev.target.value
    });

    this.selectedContact = contact[0];
    this.searchKeyWord = this.selectedContact?.firstName + ' ' + this.selectedContact?.lastName || '';
    // this.cntSearchList = [];
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
      this.companiesService.checkDomain({
        companyId: this.companyId, email: this.inviteCmpCntForm.get('email')?.value
      }).subscribe((res: any) => {
        if (res.code == 200) {
          if (res.data.domainMatch) {
            this.contactList.push({
              lastName: '',
              position: '(Invited)',
              mobile: this.inviteCmpCntForm.get('mobile')?.value,
              email: this.inviteCmpCntForm.get('email')?.value,
              profileImage: undefined,
              firstName: this.inviteCmpCntForm.get('firstName')?.value,
              id: null,
              contactLabelId: null
            });
            this.inviteCmpCntForm.reset();
          } else {
            this.toaster.error('This user cannot be invited to this company');
            this.inviteCmpCntForm.reset();
          }
        }
      }, err => {

        this.inviteCmpCntForm.reset();
      })
    } else {
      this.toaster.error('Please select a contact');
    }
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
