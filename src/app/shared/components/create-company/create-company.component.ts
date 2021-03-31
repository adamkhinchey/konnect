import {Component, Input, OnChanges, OnDestroy, OnInit, EventEmitter} from '@angular/core';
import {CompanyCategoriesService, GetRegionAndCountriesService} from '../../services';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {IDropdownSettings} from 'ng-multiselect-dropdown';
import {environment} from '../../../../environments/environment';
import {CompanyType, CreateCompanyInterface, LoginUserProfile, SignupUserProfile} from '../../models';
import {checkRxFormValidation, devLogger} from '../../utils';
import {CompaniesService} from '../../../features/users/services/companies.service';
import {Subscription} from 'rxjs';
import {Router} from '@angular/router';
import {ToastrService} from 'ngx-toastr';

const WEBSITE_REGEX = /^((https?|ftp|smtp):\/\/)?(www.)?[a-z0-9]+\.[a-z]+(\/[a-zA-Z0-9#]+\/?)*$/;

@Component({
  selector: 'app-create-company',
  templateUrl: './create-company.component.html',
  styleUrls: ['./create-company.component.scss']
})
export class CreateCompanyComponent implements OnInit, OnDestroy {

  @Input() user: LoginUserProfile | SignupUserProfile | undefined;
  @Input() createCompanyMode: { status: boolean, type: { soleTrader: boolean, inc: boolean } } = {
    status: false,
    type: {soleTrader: false, inc: false}
  };
  @Input() navigateToPostCreate = 'dashboard';
  createCompanySubscription: Subscription | undefined;
  categoryListSubscription: Subscription | undefined;
  countries$ = this.getRegionAndCountriesService.getAllCountriesOnly();
  // @ts-ignore
  createCompanyForm: FormGroup;

  categoryList: any[] = [];
  dropdownSettings: IDropdownSettings = {
    singleSelection: false,
    idField: 'id',
    textField: 'name',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    itemsShowLimit: 3,
    allowSearchFilter: true,
  };
  selectedCategory: any;

  constructor(
    private getRegionAndCountriesService: GetRegionAndCountriesService,
    private fb: FormBuilder,
    private companiesService: CompaniesService,
    private router: Router,
    private toaster: ToastrService,
    private companyCategoriesService: CompanyCategoriesService
  ) {
  }

  ngOnInit(): void {
    this.createCompanyForm = this.fb.group({
      companyProfileImage: [null],
      companyName: [null, [Validators.required]],
      countryId: [null, [Validators.required]],
      city: [null, [Validators.required]],
      categoryIds: [null, [Validators.required]],
      website: [null, [Validators.pattern(WEBSITE_REGEX)]],
      description: [null],
      companyType: [null, [Validators.required]]
    });
    this.setInitialFormControlStates();
    this.fetchCategories();
  }

  private setInitialFormControlStates(): void {
    if (this.createCompanyMode?.type?.inc === true) {
      this.setWebSiteValidity();
      this.setCompanyType(CompanyType.INC);
    } else if (this.createCompanyMode?.type?.soleTrader === true) {
      this.setCompanyType(CompanyType.PROPRIETOR);
    }
  }


  private setCompanyType(companyType: CompanyType): void {
    this.createCompanyForm.get('companyType')?.setValue(companyType);
  }

  private setWebSiteValidity(): void {
    this.createCompanyForm.get('website')?.setValidators([Validators.required, Validators.pattern(WEBSITE_REGEX)]);
    this.createCompanyForm.get('website')?.updateValueAndValidity();
  }

  private fetchCategories(): void {
    this.categoryListSubscription = this.companyCategoriesService.get().subscribe((value) => {
      if (value) {
        this.categoryList = value;
        devLogger('log', {categoryList: value});
      }
    }, err => {
      devLogger('error', err);
    });
  }

  onCategoryChange(event: { id: number, val: string }[]): void {
    if (event) {
      if (event.length === 0) {
        this.createCompanyForm.get('categoryIds')?.setValue(null);
      } else {
        this.createCompanyForm.get('categoryIds')?.setValue(event.map(ct => ct.id));
      }
    }
  }

  markCategoryTouched(): void {
    this.createCompanyForm.get('categoryIds')?.markAsTouched({onlySelf: true});
  }

  checkValidation(): boolean {
    return checkRxFormValidation(this.createCompanyForm);
  }

  createCompany(): void {
    devLogger('log', this.createCompanyForm.value);
    if (this.createCompanySubscription) {
      this.createCompanySubscription.unsubscribe();
    }
    this.createCompanySubscription = this.companiesService
      .createCompany({userId: this.user?.id, ...this.createCompanyForm.value})
      .subscribe(async (value) => {
        if (value) {
          this.toaster.success('Company created successfully');
          await this.router.navigate([this.navigateToPostCreate]);
        }
      }, err => {
        devLogger('error', err);
      });
  }

  ngOnDestroy(): void {
    if (this.createCompanySubscription) {
      this.createCompanySubscription.unsubscribe();
    }
    if (this.categoryListSubscription) {
      this.categoryListSubscription.unsubscribe();
    }
  }
}
