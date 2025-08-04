import {Component, OnInit, Output, EventEmitter, OnDestroy} from '@angular/core';
import {CompaniesService} from '../../../users/services/companies.service';
import {Company} from '../../../users/models';
import {checkRxFormValidation, devLogger} from '../../../../shared/utils';
import {Subscription} from 'rxjs';
import {ToastrService} from 'ngx-toastr';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {GetRegionAndCountriesService} from "../../../../shared/services";
import {InviteFnCmpInterface} from "../../models/interfaces";
import {InviteFnCmpClass} from "../../models/classes";

@Component({
  selector: 'app-search-or-invite-function-cmp',
  templateUrl: './search-or-invite-function-cmp.component.html',
  styleUrls: ['./search-or-invite-function-cmp.component.scss']
})
export class SearchOrInviteFunctionCmpComponent implements OnInit, OnDestroy {
  EMAIL_REGEX = new RegExp(/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,20}))$/);
  
  @Output() closed = new EventEmitter();
  @Output() newCompanyInvited = new EventEmitter<InviteFnCmpClass>();
  @Output() existingCompanySelected = new EventEmitter<Company>();
  searchKeyWord = '';
  companyList: any[] = [];
  listDisplayCss = '';
  listDisplayOverFlow = '';
  private cmpSearchSubscription: Subscription | undefined;
  selectedCompany: Company | null = null;
  inviteFnCmpForm: FormGroup = this.fb.group({
    companyName: ['', [Validators.required]],
    countryId: [null, [Validators.required]],
    city: ['', [Validators.required]],
    contactName: ['', [Validators.required]],
    contactEmail: ['', [Validators.required, Validators.pattern(this.EMAIL_REGEX)]]
  });
  countries$ = this.getRegionAndCountriesService.getAllCountriesOnly();

  constructor(
    private companiesService: CompaniesService,
    private toaster: ToastrService,
    private getRegionAndCountriesService: GetRegionAndCountriesService,
    private fb: FormBuilder) {
  }

  ngOnInit(): void {
  }

  searchForCompany(): void {
    if (this.searchKeyWord.trim().length >= 3) {
      this.cmpSearchSubscription = this.companiesService
        .searchForEvent({
          searchKeyword: this.searchKeyWord,
          domain: null,
          includeMyCompanies: true,
          includePrivate: 1
        }, this.searchKeyWord.trim().length === 1)
        .subscribe((value: { company: Company | null, companyList: Company[] | null } | null | undefined) => {
            if (value && value.companyList) {
              this.companyList = value.companyList;
              this.listDisplayCss = 'block !important';
              this.listDisplayOverFlow = 'auto';
            }
          }
          , error => {
            devLogger('error', error);
            this.listDisplayCss = '';
            this.listDisplayOverFlow = '';
          });
    } else {
      this.companyList = [];
      this.listDisplayCss = '';
      this.listDisplayOverFlow = '';
    }
  }

  applyCmpListStyle(): any {
    if (this.companyList.length > 0) {
      return {
        display: 'block !important',
        overflowY: 'auto'
      };
    }
    return {};
  }

  selectCompany(company: Company | null): void {
    this.selectedCompany = company;
    this.searchKeyWord = this.selectedCompany?.companyName || '';
    this.companyList = [];
  }

  ngOnDestroy(): void {
    this.cmpSearchSubscription?.unsubscribe();
  }

  emitSelectedAndClose(): void {
    if (this.selectedCompany) {
      this.existingCompanySelected.emit(this.selectedCompany);
      this.closed.emit();
    } else {
      this.toaster.error('Please Select a company first');
    }
  }

  validateForm(): boolean {
    return checkRxFormValidation(this.inviteFnCmpForm);
  }

  emitInvitedAndClose(): void {
    this.newCompanyInvited.emit(new InviteFnCmpClass(this.inviteFnCmpForm.value));
  }
}
